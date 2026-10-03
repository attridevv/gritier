export function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(" ");
}

import * as React from "react";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "red" | "amber" | "blue";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-accent-subtle text-accent border-accent/20",
    green: "bg-green-subtle text-green border-green/20",
    red: "bg-red-subtle text-red border-red/20",
    amber: "bg-amber-subtle text-amber border-amber/20",
    blue: "bg-blue-subtle text-blue border-blue/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono border ${variantClasses[variant]} ${className || ""}`}
    >
      {children}
    </span>
  );
}

export function Progress({
  value,
  max = 100,
  variant = "default",
  className,
}: {
  value: number;
  max?: number;
  variant?: "default" | "green" | "red" | "amber";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = {
    default: "bg-accent",
    green: "bg-green",
    red: "bg-red",
    amber: "bg-amber",
  }[variant];

  return (
    <div className={`h-2 bg-surface-elevated rounded-full overflow-hidden ${className || ""}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
