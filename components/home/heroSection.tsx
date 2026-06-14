"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section id="hero" className="text-center py-20 md:py-32 px-4">
      {/* Badge */}
      <div className="inline-flex items-center justify-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-brand-glow">
        <Sparkles className="w-4 h-4" />
        Powered by Advanced AI
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
        Summarize Any PDF{" "}
        <span className="text-primary">Instantly with AI.</span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
        Powered by <strong className="text-foreground">Gemini</strong> and{" "}
        <strong className="text-foreground">Ollama</strong>, get executive
        summaries and key insights without reading a single page. Start
        converting complexity into clarity today.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
        <a href="/workspace">
          <Button size="lg" className="shadow-brand-glow w-full sm:w-auto cursor-pointer">
            Go to Workspace
          </Button>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {[
          { value: "90%", label: "Faster Reading" },
          { value: "1000+", label: "PDFs Processed" },
          { value: "24/7", label: "AI Processing" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
            <div className="text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}