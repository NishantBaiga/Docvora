import { Card } from "@/components/common/card";
import { LucideIcon } from "lucide-react";

export interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  description: string;
  price: string;
  pricePeriod: string;
  popular: boolean;
  icon: LucideIcon;
  color: "gray" | "orange" | "purple";
  features: string[];
  cta: string;
  href: string;
}

interface FeatureComparisonProps {
  plans: Plan[];
}

const ROWS = [
  { feature: "PDF Credits",      free: "5/month",   pro: "Unlimited",  enterprise: "Unlimited" },
  { feature: "Page Limit",       free: "50 pages",  pro: "2,000 pages",enterprise: "Unlimited" },
  { feature: "AI Models",        free: "Basic",     pro: "Advanced",   enterprise: "Custom"    },
  { feature: "Processing Speed", free: "Standard",  pro: "2× Faster",  enterprise: "Priority"  },
  { feature: "Support",          free: "Community", pro: "Email & Chat",enterprise: "24/7 Dedicated" },
  { feature: "Export Formats",   free: "Basic",     pro: "Multiple",   enterprise: "All + API" },
];

export const FeatureComparison = ({ plans }: FeatureComparisonProps) => (
  <Card className="mt-16">
    <h3 className="text-2xl font-bold text-foreground text-center mb-8">
      Compare Plans Feature by Feature
    </h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 font-semibold text-foreground">Feature</th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                className={[
                  "text-center py-4 font-semibold",
                  plan.popular ? "text-primary" : "text-foreground",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              <td className="py-4 font-medium text-foreground/80">{row.feature}</td>
              <td className="text-center py-4">
                <span className="text-sm text-muted-foreground">{row.free}</span>
              </td>
              <td className="text-center py-4">
                <span className="text-sm font-semibold text-primary">{row.pro}</span>
              </td>
              <td className="text-center py-4">
                <span className="text-sm font-semibold text-foreground/70">{row.enterprise}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);