import { Card } from "@/components/common/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { Plan } from "./featureComparison";
import { cn } from "@/lib/utils";

interface Props {
  plan: Plan;
  isAnnual: boolean;
}

export const PricingCard = ({ plan, isAnnual }: Props) => {
  const Icon = plan.icon;

  const calculateAnnualPrice = (monthlyPrice: string) => {
    if (monthlyPrice === "$0") return "$0";
    if (monthlyPrice === "Custom") return "Custom";
    const price = parseInt(monthlyPrice.replace("$", ""));
    return `$${Math.floor(price * 12 * 0.8)}`;
  };

  const displayPrice = isAnnual ? calculateAnnualPrice(plan.price) : plan.price;
  const annualSavings =
    isAnnual && plan.price !== "$0" && plan.price !== "Custom"
      ? `Save $${Math.floor(parseInt(plan.price.replace("$", "")) * 12 * 0.2)}/year`
      : null;

  /* Icon background maps to semantic accent tints */
  const iconWrapperClass = {
    orange: "bg-primary/10 text-primary",
    purple: "bg-primary/10 text-primary",  // purple theme drives --primary
    gray: "bg-muted text-muted-foreground",
  }[plan.color];

  const checkClass = {
    orange: "text-primary",
    purple: "text-primary",
    gray: "text-muted-foreground",
  }[plan.color];

  return (
    <Card
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 hover:scale-[1.02]",
        plan.popular
          ? "border-2 border-primary shadow-2xl shadow-brand-glow ring-2 ring-primary/10"
          : "border border-border"
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            Most Popular
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={cn(
            "inline-flex items-center justify-center p-3 rounded-2xl mb-4",
            iconWrapperClass
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
        <p className="text-muted-foreground">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center mb-2">
          <span className="text-5xl font-extrabold text-foreground">
            {displayPrice}
          </span>
          {plan.price !== "Custom" && plan.price !== "$0" && (
            <span className="text-xl font-medium text-muted-foreground ml-2">
              /{isAnnual ? "year" : "month"}
            </span>
          )}
        </div>
        {annualSavings && (
          <div className="text-green-600 dark:text-green-400 font-semibold text-sm">
            {annualSavings}
          </div>
        )}
        {plan.pricePeriod && plan.price !== "Custom" && (
          <div className="text-muted-foreground text-sm">{plan.pricePeriod}</div>
        )}
      </div>

      {/* Features */}
      <div className="flex-grow mb-8 space-y-4">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <Check className={cn("w-5 h-5 mt-0.5 shrink-0", checkClass)} />
            <span className="text-foreground/80 text-sm leading-relaxed">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a href={plan.href} className="mt-auto">
        <Button
          variant={plan.popular ? "default" : "outline"}
          size="lg"
          className={cn("w-full", plan.popular && "shadow-brand-glow")}
        >
          {plan.cta}
          {plan.popular && <Zap className="w-4 h-4 ml-2" />}
        </Button>
      </a>
    </Card>
  );
};