import { UploadCloud, Brain, Sparkles } from "lucide-react";
import { Card } from "@/components/common/card";
import { SectionTitle } from "@/components/common/sectionTitle";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const FeatureItem = ({
  icon: Icon,
  title,
  description,
  className,
}: FeatureItemProps) => (
  <Card className={cn("flex flex-col items-center text-center", className)}>
    <div className="p-3 bg-primary/10 rounded-full mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

const STEPS = [
  {
    icon: UploadCloud,
    title: "1. Securely Upload",
    description:
      "Drag and drop your PDF using UploadThing's secure, fast service. We handle files of any size.",
  },
  {
    icon: Brain,
    title: "2. AI Intelligence",
    description:
      "Our system chunks the text, applies a Map-Reduce strategy, and uses the Gemini API for precise summarization.",
  },
  {
    icon: Sparkles,
    title: "3. Gain Instant Insight",
    description:
      "Review the full summary, save it to your dashboard, and share the key findings with your team.",
  },
];

export default function HowItWorkSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 w-full max-w-7xl">
      <SectionTitle align="center" withUnderline>
        How It Works in 3 Simple Steps
      </SectionTitle>
      <p className="text-center text-lg text-muted-foreground max-w-xl mx-auto mt-4 mb-12">
        Our powerful engine handles the heavy lifting, from file processing to
        sophisticated multi-model summarization.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((step) => (
          <FeatureItem key={step.title} {...step} />
        ))}
      </div>
    </section>
  );
}