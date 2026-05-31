
'use client';
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export default function HeroSection() {
    return(
    <section id="hero" className="text-center py-20 md:py-32">
    {/* Powered by AI badge */}
    <div className="inline-flex items-center justify-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium shadow-lg shadow-orange-500/25">
      <Sparkles className="w-4 h-4 mr-2" />
      Powered by Advanced AI
    </div>

    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
      Summarize Any PDF <span className="text-orange-600">Instantly with AI.</span>
    </h1>
    
    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
      Powered by <strong>Gemini</strong> and <strong>Ollama</strong>, get executive summaries and key insights without reading a single page. Start converting complexity into clarity today.
    </p>
    
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
      <a href="/workspace">
        <Button  size="lg" className="shadow-2xl shadow-orange-400/50 w-full sm:w-auto cursor-pointer">
          Upload Your First PDF
        </Button>
      </a>

    </div>

    {/* Stats Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">90%</div>
        <div className="text-gray-600 dark:text-gray-300">Faster Reading</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">1000+</div>
        <div className="text-gray-600 dark:text-gray-300">PDFs Processed</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
        <div className="text-gray-600 dark:text-gray-300">AI Processing</div>
      </div>
    </div>
  </section>
    );
}