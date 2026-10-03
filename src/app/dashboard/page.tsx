"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Activity,
  Dumbbell,
  Target,
  Flame,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Heart,
  Moon,
} from "lucide-react";
import { format, subDays } from "date-fns";

// Mock data — will be replaced with real API calls
const mockAnalytics = {
  readiness: { overall: 78, zone: "green", trend: "+3" },
  weeklyDistance: 32.4,
  weeklyDistanceTrend: "+12%",
  acwr: { value: 1.12, status: "optimal" },
  sleepAvg: 7.2,
  sleepTrend: "+0.4h",
  caloriesToday: 2340,
  caloriesTarget: 2600,
  proteinToday: 168,
  proteinTarget: 180,
  weightTrend: "-0.3kg/wk",
  streak: 14,
  planCompliance: 87,
};

const readinessData = Array.from({ length: 14 }, (_, i) => ({
  day: format(subDays(new Date(), 13 - i), "MMM d"),
  score: 65 + Math.random() * 25,
}));

const weeklyMileage = [
  { week: "W1", planned: 24, actual: 22 },
  { week: "W2", planned: 28, actual: 26 },
  { week: "W3", planned: 32, actual: 34 },
  { week: "W4", planned: 24, actual: 21 },
  { week: "W5", planned: 30, actual: 30 },
  { week: "W6", planned: 34, actual: 32 },
];

const nutritionData = Array.from({ length: 7 }, (_, i) => ({
  day: format(subDays(new Date(), 6 - i), "EEE"),
  calories: 2200 + Math.random() * 500,
  protein: 140 + Math.random() * 50,
}));

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mockAnalytics);
  const [dashboardTiles, setDashboardTiles] = useState<string[]>([
    "readiness",
    "training-load",
    "nutrition",
    "plan-compliance",
    "weight-trend",
    "recent-activities",
    "readiness-trend",
    "weekly-mileage",
    "nutrition-trend",
    "insights",
  ]);

  useEffect(() => {
    // TODO: fetch from /api/analytics
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4 animate-pulse">
              <div className="h-3 bg-surface-elevated rounded w-20 mb-2" />
              <div className="h-7 bg-surface-elevated rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-1">Your training at a glance</p>
        </div>
        <Button variant="secondary" size="sm">
          Customize Dashboard
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Readiness"
          value={String(data.readiness.overall)}
          trend={{ value: data.readiness.trend, positive: true }}
          accent={data.readiness.zone === "green"}
        />
        <StatCard
          label="Weekly Distance"
          value={`${data.weeklyDistance} km`}
          trend={{ value: data.weeklyDistanceTrend, positive: true }}
        />
        <StatCard
          label="ACWR"
          value={String(data.acwr.value)}
          trend={{ value: data.acwr.status, positive: true }}
          accent={data.acwr.status === "optimal"}
        />
        <StatCard
          label="Sleep (avg)"
          value={`${data.sleepAvg}h`}
          trend={{ value: data.sleepTrend, positive: true }}
        />
      </div>

      {/* Main Grid — MacroFactor-style tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Readiness Gauge */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--color-surface-elevated)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={
                      data.readiness.zone === "green"
                        ? "var(--color-green)"
                        : data.readiness.zone === "yellow"
                          ? "var(--color-amber)"
                          : "var(--color-red)"
                    }
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(data.readiness.overall / 100) * 314} 314`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-ink">
                    {data.readiness.overall}
                  </span>
                  <Badge
                    variant={
                      data.readiness.zone === "green"
                        ? "green"
                        : data.readiness.zone === "yellow"
                          ? "amber"
                          : "red"
                    }
                  >
                    {data.readiness.zone} zone
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Sleep</span>
                <span className="text-ink font-mono">76</span>
              </div>
              <Progress value={76} variant="green" />
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">HR Recovery</span>
                <span className="text-ink font-mono">82</span>
              </div>
              <Progress value={82} variant="green" />
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Energy</span>
                <span className="text-ink font-mono">70</span>
              </div>
              <Progress value={70} variant="amber" />
            </div>
          </CardContent>
        </Card>

        {/* Readiness Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>14-Day Readiness Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={readinessData}>
                <defs>
                  <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-ink-faint)" fontSize={11} />
                <YAxis stroke="var(--color-ink-faint)" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="url(#readinessGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Training & Nutrition Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Mileage */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Mileage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyMileage}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-ink-faint)" fontSize={11} />
                <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="planned" fill="var(--color-border)" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="actual" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Nutrition Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrition (7-Day)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-muted">Calories</span>
                  <span className="text-ink font-mono">
                    {data.caloriesToday} / {data.caloriesTarget}
                  </span>
                </div>
                <Progress value={data.caloriesToday} max={data.caloriesTarget} variant="amber" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-muted">Protein</span>
                  <span className="text-ink font-mono">
                    {data.proteinToday}g / {data.proteinTarget}g
                  </span>
                </div>
                <Progress value={data.proteinToday} max={data.proteinTarget} variant="green" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-ink-faint)" fontSize={11} />
                <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="var(--color-amber)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="var(--color-green)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Compliance + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-display font-bold text-ink">
                {data.planCompliance}%
              </div>
              <Badge variant="green">On Track</Badge>
            </div>
            <Progress value={data.planCompliance} variant="green" className="mb-3" />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-surface-elevated rounded-lg p-3">
                <p className="text-2xl font-bold text-ink font-mono">{data.streak}</p>
                <p className="text-xs text-ink-muted mt-0.5">Day Streak</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3">
                <p className="text-2xl font-bold text-accent font-mono">{data.weightTrend}</p>
                <p className="text-xs text-ink-muted mt-0.5">Weight Trend</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3">
                <p className="text-2xl font-bold text-green font-mono">87%</p>
                <p className="text-xs text-ink-muted mt-0.5">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "run", name: "Easy Morning Run", date: "Today", dist: "5.2 km", time: "28:14", rpe: 4 },
                { type: "strength", name: "Upper Body Push", date: "Yesterday", dist: null, time: "45 min", rpe: 7 },
                { type: "run", name: "Tempo Intervals", date: "2 days ago", dist: "7.0 km", time: "32:40", rpe: 8 },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      activity.type === "run"
                        ? "bg-blue-subtle text-blue"
                        : "bg-amber-subtle text-amber"
                    }`}
                  >
                    {activity.type === "run" ? (
                      <Activity className="w-4 h-4" />
                    ) : (
                      <Dumbbell className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{activity.name}</p>
                    <p className="text-xs text-ink-faint">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    {activity.dist && (
                      <p className="text-sm font-mono text-ink">{activity.dist}</p>
                    )}
                    <p className="text-xs text-ink-muted">{activity.time}</p>
                  </div>
                  <Badge variant={activity.rpe! > 6 ? "red" : activity.rpe! > 4 ? "amber" : "green"}>
                    RPE {activity.rpe}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: "Log Run", href: "/log?type=run", color: "text-blue" },
          { icon: Dumbbell, label: "Log Workout", href: "/log?type=strength", color: "text-amber" },
          { icon: Utensils, label: "Log Meal", href: "/nutrition-track", color: "text-green" },
          { icon: Target, label: "Check In", href: "/log?type=checkin", color: "text-accent" },
        ].map((action, i) => (
          <a
            key={i}
            href={action.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all group"
          >
            <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
            <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
              {action.label}
            </span>
          </a>
        ))}
      </div>

      {/* Placeholder for Insights tile */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-subtle border border-accent/20">
            <Zap className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-ink font-medium">Your training load is optimal</p>
              <p className="text-xs text-ink-muted mt-1">
                ACWR at 1.12 suggests you&apos;re in the sweet spot. Readiness is good (78). Consider
                pushing the tempo session on Thursday — your recovery markers support it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Progress({
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
    <div className={`h-2 bg-surface-elevated rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
