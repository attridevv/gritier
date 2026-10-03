"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Dumbbell,
  CalendarDays,
  Utensils,
  BarChart3,
  MessageSquare,
  Settings,
  Brain,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Train", href: "/train", icon: Dumbbell },
  { label: "Plan", href: "/plan", icon: CalendarDays },
  { label: "Nutrition", href: "/nutrition-track", icon: Utensils },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Feed", href: "/feed", icon: MessageSquare },
  { label: "Insights", href: "/insights", icon: Brain },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-display font-bold text-gradient tracking-tight">GRIT</h1>
        <p className="text-xs text-ink-faint mt-0.5">Performance OS</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-accent-subtle text-accent font-medium"
                  : "text-ink-muted hover:text-ink hover:bg-surface-elevated"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-accent-subtle flex items-center justify-center text-accent font-bold text-sm">
            G
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">Athlete</p>
            <p className="text-xs text-ink-faint truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
