"use client";

import { AffordabilityFlag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface AffordabilityBadgeProps {
  flag: AffordabilityFlag;
  percentage?: number;
  showEmoji?: boolean;
  className?: string;
}

export function AffordabilityBadge({
  flag,
  percentage,
  showEmoji = true,
  className = "",
}: AffordabilityBadgeProps) {
  const getFlagMeta = () => {
    switch (flag) {
      case "comfortable":
        return {
          emoji: "🟢",
          label: "Comfortable",
          variant: "comfortable" as const,
        };
      case "moderate":
        return {
          emoji: "🟡",
          label: "Moderate",
          variant: "moderate" as const,
        };
      case "high":
        return {
          emoji: "🟠",
          label: "High",
          variant: "high" as const,
        };
      case "heavy":
        return {
          emoji: "🔴",
          label: "Heavy",
          variant: "heavy" as const,
        };
    }
  };

  const meta = getFlagMeta();

  return (
    <Badge
      variant={meta.variant}
      className={`font-bold tracking-wide shadow-2xs gap-1.5 ${className}`}
    >
      {showEmoji && <span>{meta.emoji}</span>}
      <span>{meta.label}</span>
      {percentage !== undefined && (
        <span className="opacity-90 font-normal">({percentage}%)</span>
      )}
    </Badge>
  );
}
