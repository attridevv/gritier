"use client";

import { useState, useEffect } from "react";
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
  ReferenceLine,
} from "recharts";

type Analytics = {
  acwr: { value: number; status: string };
  readiness: { overall: number };
  loadSeries: { date: string; load: number }[];
  sleepSeries: { day: string; hours: number; quality: number }[];
  acwrSeries: { date: string; ratio: number }[];
  racePredictions: Record<string, number>;
  vo2Max: number | null;
  predictionConfidence: string;
  athleteRadar: { metric: string; value: number }[];
};

function fmtTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

const distLabel: Record<string, string> = { "5k": "5K", "10k": "10K", "21.0975k": "Half", "42.195k": "Full" };

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-ink">Analytics</h1>
        <div className="h-64 bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!data) return <p className="text-ink-muted">Could not load analytics.</p>;

  const loads = data.loadSeries.map((l) => l.load);
  const chronic = loads.length ? Math.round(loads.reduce((a, b) => a + b, 0) / loads.length) : 0;
  const acute = loads.slice(-7).length ? Math.round(loads.slice(-7).reduce((a, b) => a + b, 0) / loads.slice(-7).length) : 0;
  const fatigue = chronic > 0 ? Math.min(100, Math.round((acute / chronic) * 100)) : 0;
  const consistency = data.athleteRadar.find((r) => r.metric === "Consistency")?.value ?? 0;

  const predictions = Object.entries(data.racePredictions).map(([k, v]) => ({
    dist: distLabel[k] ?? k,
    time: fmtTime(v),
    confidence: data.predictionConfidence,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Analytics</h1>
        <p className="text-sm text-ink-muted mt-1">Deep dive into your performance data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Consistency" value={`${consistency}%`} accent={consistency >= 70} />
        <StatCard label="Chronic Load" value={String(chronic)} />
        <StatCard label="Acute Load" value={String(acute)} />
        <StatCard label="ACWR" value={String(data.acwr.value)} trend={{ value: data.acwr.status, positive: data.acwr.status === "optimal" }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Acute:Chronic Workload Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            {data.acwrSeries.some((s) => s.ratio > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.acwrSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={10} tick={{ transform: "rotate(-30)" }} />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} domain={[0, 2]} />
                    <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                    <ReferenceLine y={1.3} stroke="var(--color-red)" strokeDasharray="4 4" />
                    <ReferenceLine y={0.8} stroke="var(--color-amber)" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="ratio" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <Empty label="Log a few sessions to compute your workload ratio" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Load</CardTitle>
          </CardHeader>
          <CardContent>
            {data.loadSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.loadSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={10} tick={{ transform: "rotate(-30)" }} />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                  <Bar dataKey="load" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty label="No training load yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sleep Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data.sleepSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.sleepSeries}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-ink-faint)" fontSize={11} />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="hours" stroke="var(--color-blue)" strokeWidth={2} fill="url(#sleepGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty label="Check in to track sleep" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Athlete Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={data.athleteRadar}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" stroke="var(--color-ink-faint)" fontSize={10} />
                <Radar name="Score" dataKey="value" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Race Predictions {data.vo2Max ? `· VO₂max ${data.vo2Max}` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          {predictions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {predictions.map((race) => (
                <div key={race.dist} className="bg-surface-elevated rounded-lg p-4 text-center">
                  <p className="text-sm text-ink-faint">{race.dist}</p>
                  <p className="text-xl font-display font-bold text-ink mt-1">{race.time}</p>
                  <Badge variant={race.confidence === "high" ? "green" : race.confidence === "medium" ? "amber" : "red"}>
                    {race.confidence}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Empty label="Log a run of 3km+ to unlock race predictions" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="h-[220px] flex items-center justify-center border border-dashed border-border rounded-lg">
      <p className="text-sm text-ink-faint px-6 text-center">{label}</p>
    </div>
  );
}
