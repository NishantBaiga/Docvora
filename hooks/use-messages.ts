// hooks/use-messages.ts
"use client";

import { useEffect, useState } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function useMessages(fileId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Reset + reload whenever fileId changes
  useEffect(() => {
    if (!fileId) {
      setMessages([]);
      return;
    }

    async function load() {
      setLoadingMessages(true);
      setMessages([]);
      try {
        // Same endpoint, GET method
        const res = await fetch(`/api/chat?fileId=${fileId}`);
        if (!res.ok) return;

        const data = await res.json();
        setMessages(
          data.map((m: { id: string; text: string; isUserMessage: boolean }) => ({
            id: m.id,
            role: m.isUserMessage ? "user" : "assistant",
            content: m.text,
          }))
        );
      } finally {
        setLoadingMessages(false);
      }
    }

    load();
  }, [fileId]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || !fileId || isLoading) return;

    setInput("");
    setIsLoading(true);

    const optimisticUser: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const placeholderId = crypto.randomUUID();
    const placeholder: Message = {
      id: placeholderId,
      role: "assistant",
      content: "",
    };

    setMessages(prev => [...prev, optimisticUser, placeholder]);

    try {
      // Same endpoint, POST method
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, question }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const answer: string = data.answer ?? "No answer generated.";

      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId ? { ...m, content: answer } : m
        )
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    input,
    setInput,
    isLoading,
    loadingMessages,
    sendMessage,
  };
}