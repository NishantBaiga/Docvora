"use client";

import { Check, ArrowRight, Building, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card } from "@/components/common/card";
import { SectionTitle } from "@/components/common/sectionTitle";
import { PricingCard } from "./priceSection/priceCard";
import { FeatureComparison, Plan } from "./priceSection/featureComparison";

const plans: Plan[] = [
  {
    id: "free",
    name: "Starter",
    description: "Perfect for trying out and personal projects",
    price: "$0",
    pricePeriod: "forever",
    popular: false,
    icon: Sparkles,
    color: "gray",
    features: [
      "5 PDF credits per month",
      "Basic summarization models",
      "Standard processing speed",
      "Up to 50 pages per document",
      "Basic dashboard access",
      "Community support",
    ],
    cta: "Start Free",
    href: "/signup?plan=free",
  },
  {
    id: "pro",
    name: "Professional",
    description: "For professionals and growing teams",
    price: "$19",
    pricePeriod: "per month",
    popular: true,
    icon: Crown,
    color: "orange",
    features: [
      "Unlimited PDF credits",
      "Advanced Gemini models (priority access)",
      "2× faster processing",
      "Up to 2,000 pages per document",
      "Advanced analytics dashboard",
      "Email & chat support",
      "Export to multiple formats",
      "Team collaboration features",
    ],
    cta: "Go Professional",
    href: "/signup?plan=pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: "Custom",
    pricePeriod: "tailored pricing",
    popular: false,
    icon: Building,
    color: "purple",
    features: [
      "Dedicated AI infrastructure",
      "Custom model training (Ollama)",
      "99.9% uptime SLA",
      "Unlimited pages & documents",
      "Full API access",
      "Dedicated account manager",
      "Custom security & compliance",
      "On-premise deployment options",
      "White-label solutions",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
];

const GUARANTEES = [
  "No credit card required to start",
  "Cancel or change plans anytime",
  "14-day money-back guarantee",
];

export const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 w-full max-w-7xl">
      <div className="text-center max-w-4xl mx-auto mb-16">
        <SectionTitle align="center" withUnderline>
          Simple, Transparent Pricing
        </SectionTitle>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed mt-4">
          Choose the perfect plan for your needs. All plans include our core
          features with no hidden fees.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-muted rounded-lg p-1 mb-12">
          {(["Monthly", "Annual"] as const).map((label) => {
            const active = label === "Annual" ? isAnnual : !isAnnual;
            return (
              <button
                key={label}
                onClick={() => setIsAnnual(label === "Annual")}
                className={[
                  "relative px-6 py-3 rounded-md font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {label}
                {label === "Annual" && isAnnual && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Feature comparison */}
        <FeatureComparison plans={plans} />

        {/* Guarantees */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          {GUARANTEES.map((text) => (
            <div key={text} className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-green-500 shrink-0" />
              {text}
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <Card className="mt-12 bg-gradient-to-r from-muted to-muted/60 border-border">
          <div className="text-center">
            <Building className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Need a Custom Solution?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our enterprise plans offer custom AI model training, dedicated
              infrastructure, and white-label solutions tailored to your
              organization's specific requirements.
            </p>
            <Button variant="outline" size="lg">
              Schedule a Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};