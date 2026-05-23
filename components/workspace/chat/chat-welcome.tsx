"use client";

import { motion } from "framer-motion";
import { MessageCircle, FileSearch, Sparkles, Lightbulb } from "lucide-react";

const suggestions = [
  {
    icon: FileSearch,
    text: "Summarize this document",
  },
  {
    icon: Lightbulb,
    text: "What are the key takeaways?",
  },
  {
    icon: Sparkles,
    text: "What is this document about?",
  },
  {
    icon: MessageCircle,
    text: "List the main topics covered",
  },
];

interface Props {
  onSuggestionClick?: (text: string) => void;
}

export default function ChatWelcome({ onSuggestionClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 max-w-sm w-full"
      >
        {/* Icon */}
        <div className="p-4 bg-primary/10 rounded-2xl">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold">
            Ask anything about this document
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get instant answers, summaries, and insights
            powered by AI — based strictly on your PDF.
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-col gap-2 w-full">
          {suggestions.map(({ icon: Icon, text }) => (
            <motion.button
              key={text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSuggestionClick?.(text)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl
                         border border-border bg-muted/30 hover:bg-muted/60
                         text-xs text-left text-muted-foreground hover:text-foreground
                         transition-colors cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              {text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}