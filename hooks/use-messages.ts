"use client";

import { useEffect, useRef, useState } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function useMessages(fileId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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

    // Optimistic user message
    const optimisticUser: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    // Placeholder for streaming assistant reply
    const placeholderId = crypto.randomUUID();
    const placeholder: Message = {
      id: placeholderId,
      role: "assistant",
      content: "",
    };

    setMessages(prev => [...prev, optimisticUser, placeholder]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, question }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Chat request failed");
      if (!res.body) throw new Error("No response body");

      // Start reading the stream
      setIsStreaming(true);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages(prev =>
          prev.map(m =>
            m.id === placeholderId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped — keep whatever streamed so far
        return;
      }
      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setIsLoading(false);
    setIsStreaming(false);
  }


  async function sendWithText(text: string) {
  setInput(text);
  // Directly call internal logic with the text instead of reading from state
  const question = text.trim();
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
  abortRef.current = new AbortController();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, question }),
      signal: abortRef.current.signal,
    });

    if (!res.ok) throw new Error("Chat request failed");
    if (!res.body) throw new Error("No response body");

    setIsStreaming(true);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setMessages(prev =>
        prev.map(m =>
          m.id === placeholderId ? { ...m, content: m.content + chunk } : m
        )
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") return;
    setMessages(prev =>
      prev.map(m =>
        m.id === placeholderId
          ? { ...m, content: "Something went wrong. Please try again." }
          : m
      )
    );
  } finally {
    setIsLoading(false);
    setIsStreaming(false);
    abortRef.current = null;
  }
}
  return {
    messages,
    input,
    setInput,
    isLoading,
    isStreaming,
    loadingMessages,
    sendMessage,
    stop,
    sendWithText,
  };
}