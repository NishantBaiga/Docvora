"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Loader2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileRecord } from "@/types/type.pdf";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate?: () => void;
}

export default function SearchDialog({
  open,
  onOpenChange,
  onNavigate,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<FileRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch from API when debounced query changes
  const search = useCallback(async (q: string) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        sort: "date",
        order: "desc",
        ...(q.trim() && { q: q.trim() }),
      });

      const res = await fetch(`/api/files?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();
      setResults(data.pdfs ?? []);
      setActiveIndex(0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Trigger search when debounced query changes or dialog opens
  useEffect(() => {
    if (!open) return;
    search(debouncedQuery);
  }, [debouncedQuery, open, search]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  function handleSelect(fileId: string) {
    router.push(`/workspace/${fileId}`);
    onOpenChange(false);
    onNavigate?.();
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) handleSelect(selected.id);
    }
  }

  const showEmpty =
    !isSearching && results.length === 0 && debouncedQuery.trim();
  const showInitial =
    !isSearching && results.length === 0 && !debouncedQuery.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden w-[90vw] max-w-2xl min-h-[500px] flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search documents</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-muted-foreground shrink-0 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="border-0 p-0 h-auto text-sm shadow-none focus-visible:ring-0
                       bg-transparent placeholder:text-muted-foreground/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[10px] text-muted-foreground hover:text-foreground
                         bg-muted px-1.5 py-0.5 rounded transition-colors shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-[420px]">
          {/* Initial state — show recent files */}
          {showInitial && (
            <div>
              <div className="px-4 py-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Recent
                </span>
              </div>
              <ResultList
                results={results}
                activeIndex={activeIndex}
                onSelect={handleSelect}
                onHover={setActiveIndex}
              />
            </div>
          )}
          {/* Search results */}
          {!showInitial && !showEmpty && !isSearching && (
            <div>
              <div className="px-4 py-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ResultList
                results={results}
                activeIndex={activeIndex}
                onSelect={handleSelect}
                onHover={setActiveIndex}
              />
            </div>
          )}
          {/* No results */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <FileText className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No documents found for
                <span className="font-medium text-foreground"> "{query}"</span>
              </p>
            </div>
          )}
          {/* Loading skeleton */}
          {isSearching && (
            <div className="p-2 space-y-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-2 py-2 rounded-md"
                >
                  <div className="h-4 w-4 rounded bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 px-4 py-2 border-t bg-muted/30">
          <span className="text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] font-mono">
              ↑
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] font-mono ml-0.5">
              ↓
            </kbd>{" "}
            navigate
          </span>
          <span className="text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] font-mono">
              ↵
            </kbd>{" "}
            open
          </span>
          <span className="text-[10px] text-muted-foreground">
            <kbd className="px-1 py-0.5 rounded bg-muted border text-[10px] font-mono">
              Esc
            </kbd>{" "}
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultList({
  results,
  activeIndex,
  onSelect,
  onHover,
}: {
  results: FileRecord[];
  activeIndex: number;
  onSelect: (id: string) => void;
  onHover: (i: number) => void;
}) {
  return (
    <div className="p-2 space-y-0.5">
      {results.map((file, i) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onSelect(file.id)}
          onMouseEnter={() => onHover(i)}
          className={cn(
            "flex items-center gap-3 w-full px-2 py-2 rounded-md text-left transition-colors",
            activeIndex === i
              ? "bg-primary/10 text-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          <FileText
            className={cn(
              "h-4 w-4 shrink-0",
              activeIndex === i ? "text-primary" : "text-muted-foreground",
            )}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate leading-tight">
              {file.name}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              {formatDistanceToNow(new Date(file.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
