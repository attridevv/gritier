"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import { format, subDays } from "date-fns";

const acwrData = Array.from({ length: 28 }, (_, i) => ({
  date: format(subDays(new Date(), 27 - i), "MMM d"),
  acute: 300 + Math.random() * 200,
  chronic: 280 + Math.random() * 100,
  ratio: 0.9 + Math.random() * 0.4,
}));

const sleepData = Array.from({ length: 14 }, (_, i) => ({
  day: format(subDays(new Date(), 13 - i), "MMM d"),
  hours: 6 + Math.random() * 3,
  quality: 5 + Math.random() * 5,
}));

const trainingLoadData = Array.from({ length: 28 }, (_, i) => ({
  date: format(subDays(new Date(), 27 - i), "MMM d"),
  load: 200 + Math.random() * 400,
}));

const athleteRadar = [
  { metric: "Endurance", value: 78 },
  { metric: "Strength", value: 65 },
  { metric: "Mobility", value: 72 },
  { metric: "Recovery", value: 80 },
  { metric: "Consistency", value: 87 },
  { metric: "Nutrition", value: 70 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "14d" | "28d">("28d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Analytics</h1>
          <p className="text-sm text-ink-muted mt-1">Deep dive into your performance data</p>
        </div>
        <div className="flex gap-1 bg-surface-elevated rounded-lg p-1">
          {(["7d", "14d", "28d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                period === p ? "bg-accent text-background font-medium" : "text-ink-muted hover:text-ink"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Consistency Score" value="87%" trend={{ value: "+3%", positive: true }} accent />
        <StatCard label="Chronic Load" value="290" trend={{ value: "+12", positive: true }} />
        <StatCard label="Fatigue Index" value="64" trend={{ value: "-5", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ACWR */}
        <Card>
          <CardHeader>
            <CardTitle>Acute:Chronic Workload Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={acwrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={10} tick={{ transform: "rotate(-30)" }} />
                <YAxis stroke="var(--color-ink-faint)" fontSize={11} domain={[0, 2]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="ratio" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                {/* Optimal zone */}
                <line x1="0" x2="100%" y1="60%" y2="60%" stroke="var(--color-green)" strokeDasharray="4 4" strokeWidth={1} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-ink-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green" /> Optimal (0.8-1.3)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red" /> Risk (&gt;1.5)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Training Load */}
        <Card>
          <CardHeader>
            <CardTitle>Training Load (28d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trainingLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={10} tick={{ transform: "rotate(-30)" }} />
                <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="load" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sleep Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sleep Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="hours" stroke="var(--color-blue)" strokeWidth={2} fill="url(#sleepGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Athlete Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Athlete Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={athleteRadar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" stroke="var(--color-ink-faint)" fontSize={10} />
                <Radar name="Score" dataKey="value" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Race Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Race Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { dist: "5K", time: "22:14", confidence: "high" },
              { dist: "10K", time: "46:32", confidence: "medium" },
              { dist: "Half", time: "1:41:15", confidence: "medium" },
              { dist: "Full", time: "3:38:40", confidence: "low" },
            ].map((race, i) => (
              <div key={i} className="bg-surface-elevated rounded-lg p-4 text-center">
                <p className="text-sm text-ink-faint">{race.dist}</p>
                <p className="text-xl font-display font-bold text-ink mt-1">{race.time}</p>
                <Badge variant={race.confidence === "high" ? "green" : race.confidence === "medium" ? "amber" : "red"}>
                  {race.confidence}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
