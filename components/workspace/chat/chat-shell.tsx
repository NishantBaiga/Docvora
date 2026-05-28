// components/workspace/chat/chat-shell.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/hooks/use-messages";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import ChatWelcome from "./chat-welcome";
import { useWorkspace } from "@/hooks/use-workspace";

interface Props {
  fileId: string | null;
}

export default function ChatShell({ fileId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const prevScrollHeightRef = useRef<number>(0);

  const {
    status,
    processingStatus,
    loading: initLoading,
    error: initError,
  } = useWorkspace(fileId);

  const {
    messages,
    input,
    setInput,
    isLoading,
    isStreaming,
    loadingMessages,
    loadingMore,
    pagination,
    loadMore,
    sendMessage,
    sendWithText,
    stop,
  } = useMessages(fileId);

  // Auto scroll to bottom on initial load and new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom only when a new message is added at the end
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only auto scroll if user is near the bottom
    if (distFromBottom < 200) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Preserve scroll position after prepending older messages
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !loadingMore) return;
    prevScrollHeightRef.current = el.scrollHeight;
  }, [loadingMore]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || loadingMore) return;
    // After older messages prepended restore scroll position
    if (prevScrollHeightRef.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, loadingMore]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);

    // Load more when user scrolls near top
    if (el.scrollTop < 80 && pagination?.hasMore && !loadingMore) {
      loadMore();
    }
  }

  if (initLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {processingStatus === "PENDING"
              ? "Preparing your document..."
              : "Processing document"}
          </p>
          <p className="text-xs text-muted-foreground">
            {processingStatus === "PENDING"
              ? "Starting up the processing pipeline"
              : "Extracting text, generating embeddings and storing vectors"}
          </p>
        </div>
      </div>
    );
  }

  if (initError || status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <div className="p-3 bg-destructive/10 rounded-full">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Processing failed</p>
          <p className="text-xs text-muted-foreground">
            {initError ?? "Could not process this document."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-background">
      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Load more indicator at top */}
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {/* Load more button fallback */}
        {!loadingMore && pagination?.hasMore && (
          <div className="flex justify-center py-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-7"
              onClick={loadMore}
            >
              Load older messages
            </Button>
          </div>
        )}

        {loadingMessages ? (
          <MessageSkeletons />
        ) : messages.length === 0 ? (
          <ChatWelcome onSuggestionClick={sendWithText} />
        ) : (
          messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isAssistant = m.role === "assistant";

            const isThinking =
              isLoading &&
              !isStreaming &&
              isLast &&
              isAssistant &&
              m.content === "";

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
