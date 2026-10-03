import { cn } from "./utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface rounded-xl border border-border p-5 transition-all hover:border-border/80", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)}>{children}</div>;
}

export function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-medium text-ink-muted uppercase tracking-wider", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  trend,
  accent = false,
  className,
}: {
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-border p-4 transition-all hover:border-accent/30",
        accent && "border-accent/30 bg-accent-subtle",
        className
      )}
    >
      <p className="text-xs text-ink-muted uppercase tracking-wider">{label}</p>
      <p className={cn("text-2xl font-display font-bold mt-1", accent && "text-accent")}>{value}</p>
      {trend && (
        <p
          className={cn(
            "text-xs mt-1 font-mono",
            trend.positive ? "text-green" : "text-red"
          )}
        >
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
  );
}
