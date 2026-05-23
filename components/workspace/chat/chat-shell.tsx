// components/workspace/chat/chat-shell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/use-messages";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import ChatWelcome from "./chat-welcome";

interface Props {
  fileId: string | null;
}

export default function ChatShell({ fileId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const {
    messages,
    input,
    setInput,
    isLoading,
    loadingMessages,
    sendMessage,
    isStreaming,
    stop,
    sendWithText,
  } = useMessages(fileId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  }

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {loadingMessages ? (
          <MessageSkeletons />
        ) : messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={sendWithText} />
        ) : (
          messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isAssistant = m.role === "assistant";
            // Show thinking dots only while waiting for first chunk
            const isThinking =
              isLoading &&
              !isStreaming &&
              isLast &&
              isAssistant &&
              m.content === "";

            // Show blinking cursor while chunks are arriving
            const isCurrentlyStreaming = isStreaming && isLast && isAssistant;
            return (
              <ChatMessage
                key={m.id}
                message={m}
                isThinking={isThinking}
                isStreaming={isCurrentlyStreaming}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
          >
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full shadow-md gap-1.5 text-xs h-7"
              onClick={() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ArrowDown className="h-3 w-3" />
              Scroll to bottom
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={sendMessage}
        isLoading={isLoading}
        disabled={!fileId}
        isStreaming={isStreaming}
        onStop={stop}
      />
    </div>
  );
}

function MessageSkeletons() {
  return (
    <div className="space-y-4">
      {[80, 55, 70].map((w, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div
              className="h-4 rounded bg-muted animate-pulse"
              style={{ width: `${w}%` }}
            />
            <div
              className="h-4 rounded bg-muted animate-pulse"
              style={{ width: `${w - 20}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
