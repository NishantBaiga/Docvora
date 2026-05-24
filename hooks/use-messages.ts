"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Pagination = {
  page: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
};

export function useMessages(fileId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function mapMessage(m: {
    id: string;
    text: string;
    isUserMessage: boolean;
  }): Message {
    return {
      id: m.id,
      role: m.isUserMessage ? "user" : "assistant",
      content: m.text,
    };
  }

  async function fetchMessages(page: number): Promise<{
    messages: Message[];
    pagination: Pagination;
  } | null> {
    const res = await fetch(`/api/chat?fileId=${fileId}&page=${page}`);
    if (!res.ok) return null;

    const data = await res.json();

    return {
      messages: data.messages.map(mapMessage),
      pagination: data.pagination,
    };
  }

  // Initial load — most recent page. Reset + reload whenever fileId changes
  useEffect(() => {
    if (!fileId) {
      setMessages([]);
      setPagination(null);
      return;
    }


    

      // Load older messages — called when user scrolls to top
  const loadMore = useCallback(async () => {
    if (!fileId || !pagination?.hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const result = await fetchMessages(nextPage);
      if (!result) return;

      // Prepend older messages to existing ones
      setMessages(prev => [...result.messages, ...prev]);
      setPagination(result.pagination);
    } finally {
      setLoadingMore(false);
    }
  }, [fileId, pagination, loadingMore]);


    async function load() {
      setLoadingMessages(true);
      setMessages([]);
      setPagination(null);
      try {
        const result = await fetchMessages(1);
        if (!result) return;
        setMessages(result.messages);
        setPagination(result.pagination);
      } finally {
        setLoadingMessages(false);
      }
    }

    load();
  }, [fileId]);


   // Load older messages — called when user scrolls to top
  const loadMore = useCallback(async () => {
    if (!fileId || !pagination?.hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const result = await fetchMessages(nextPage);
      if (!result) return;

      // Prepend older messages to existing ones
      setMessages(prev => [...result.messages, ...prev]);
      setPagination(result.pagination);
    } finally {
      setLoadingMore(false);
    }
  }, [fileId, pagination, loadingMore]);

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

    setMessages((prev) => [...prev, optimisticUser, placeholder]);

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

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped — keep whatever streamed so far
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m,
        ),
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

    setMessages((prev) => [...prev, optimisticUser, placeholder]);
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
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m,
        ),
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
    loadingMore,
    pagination,
    loadMore,
    sendMessage,
    stop,
    sendWithText,
  };
}
