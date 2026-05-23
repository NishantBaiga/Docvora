// components/workspace/chat/chat-input.tsx
"use client";

import { Send, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  input: string;
  setInput: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  isStreaming: boolean;
  onStop: () => void;
}

export default function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  disabled,
  isStreaming,
  onStop, 
}: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!input.trim() || isLoading || disabled) return;
      onSubmit();
    }
  }

  return (
    <div className="px-4 pb-4 pt-2 border-t bg-background">
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "Select a PDF to start chatting"
              : "Ask anything about this document…"
          }
          disabled={disabled || isLoading}
          className="flex-1 h-10 rounded-xl bg-muted/40 border-muted-foreground/20
                     focus-visible:ring-1 focus-visible:bg-background
                     placeholder:text-muted-foreground/50 transition-colors"
        />





        {isStreaming ? (
          // Stop button while streaming
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-10 w-10 shrink-0 rounded-xl"
            onClick={onStop}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        ) : (
          // Send button
          <Button
            type="button"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl"
            disabled={!input.trim() || disabled || isLoading}
            onClick={onSubmit}
          >
            {isLoading && !isStreaming
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Send className="h-3.5 w-3.5" />
            }
          </Button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-1.5">
        Answers are based on the uploaded PDF only
      </p>
    </div>
  );
}