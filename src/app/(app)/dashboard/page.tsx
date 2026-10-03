"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Badge, Progress } from "@/components/ui/utils";
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
  Activity,
  Dumbbell,
  Target,
  Zap,
  ChevronRight,
  Utensils,
  X,
  Loader2,
} from "lucide-react";

type Analytics = {
  user: { name: string | null; image: string | null };
  readiness: {
    overall: number;
    zone: string;
    trend: string;
    sleepScore: number;
    hrRecoveryScore: number;
    energyScore: number;
    sorenessScore: number;
    painPenalty: number;
    insights: string[];
  };
  weeklyDistance: number;
  weeklyDistanceTrend: string;
  acwr: { value: number; status: string };
  sleepAvg: number;
  caloriesToday: number;
  caloriesTarget: number;
  proteinToday: number;
  proteinTarget: number;
  weightTrend: string;
  streak: number;
  planCompliance: number;
  readinessTrend: { day: string; score: number }[];
  weeklyMileage: { week: string; planned: number; actual: number }[];
  nutritionTrend: { day: string; calories: number; protein: number; target: number }[];
  recentActivities: {
    id: string;
    type: string;
    name: string;
    date: string;
    distance: number | null;
    duration: number;
    pace: number | null;
    rpe: number | null;
    avgHr: number | null;
  }[];
  insight: { content: string; recommendations: string[] } | null;
};

function fmtDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function fmtPace(pace: number | null) {
  if (!pace) return "—";
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Analytics | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>
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

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-ink-muted">Could not load your data. Try refreshing.</p>
            <Button className="mt-4" onClick={load}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const zoneVariant = data.readiness.zone === "green" ? "green" : data.readiness.zone === "yellow" ? "amber" : "red";
  const zoneColor =
    data.readiness.zone === "green" ? "var(--color-green)" : data.readiness.zone === "yellow" ? "var(--color-amber)" : "var(--color-red)";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            {data.user.name ? `Welcome back, ${data.user.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-sm text-ink-muted mt-1">Your training at a glance</p>
        </div>
        <Button size="sm" onClick={() => setShowCheckIn(true)}>
          <Zap className="w-4 h-4 mr-1" /> Daily Check-In
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Readiness"
          value={String(data.readiness.overall)}
          trend={{ value: `${data.readiness.trend}`, positive: !data.readiness.trend.startsWith("-") }}
          accent={data.readiness.zone === "green"}
        />
        <StatCard
          label="Weekly Distance"
          value={`${data.weeklyDistance} km`}
          trend={{ value: data.weeklyDistanceTrend, positive: !data.weeklyDistanceTrend.startsWith("-") }}
        />
        <StatCard
          label="ACWR"
          value={String(data.acwr.value)}
          trend={{ value: data.acwr.status, positive: data.acwr.status === "optimal" }}
          accent={data.acwr.status === "optimal"}
        />
        <StatCard label="Sleep (avg)" value={`${data.sleepAvg}h`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-surface-elevated)" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={zoneColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(data.readiness.overall / 100) * 314} 314`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold text-ink">{data.readiness.overall}</span>
                  <Badge variant={zoneVariant}>{data.readiness.zone} zone</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {[
                { label: "Sleep", value: data.readiness.sleepScore },
                { label: "HR Recovery", value: data.readiness.hrRecoveryScore },
                { label: "Energy", value: data.readiness.energyScore },
                { label: "Soreness", value: data.readiness.sorenessScore },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">{s.label}</span>
                    <span className="text-ink font-mono">{s.value}</span>
                  </div>
                  <Progress
                    value={s.value}
                    variant={s.value >= 80 ? "green" : s.value >= 60 ? "amber" : "red"}
                  />
                </div>
              ))}
            </div>
            {data.readiness.insights?.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-surface-elevated">
                {data.readiness.insights.slice(0, 2).map((i, idx) => (
                  <p key={idx} className="text-xs text-ink-muted">
                    • {i}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Readiness Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data.readinessTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.readinessTrend}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-ink-faint)" fontSize={11} />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2} fill="url(#readinessGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Check in for a few days to see your readiness trend" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Mileage</CardTitle>
          </CardHeader>
          <CardContent>
            {data.weeklyMileage.some((w) => w.planned > 0 || w.actual > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.weeklyMileage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" stroke="var(--color-ink-faint)" fontSize={11} />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                  <Bar dataKey="planned" fill="var(--color-border)" radius={[4, 4, 0, 0]} name="Planned" />
                  <Bar dataKey="actual" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Start a training plan to compare planned vs actual mileage" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nutrition (7-Day)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-muted">Calories today</span>
                  <span className="text-ink font-mono">
                    {data.caloriesToday.toLocaleString()} / {data.caloriesTarget.toLocaleString()}
                  </span>
                </div>
                <Progress value={data.caloriesToday} max={data.caloriesTarget} variant="amber" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-muted">Protein today</span>
                  <span className="text-ink font-mono">
                    {data.proteinToday}g / {data.proteinTarget}g
                  </span>
                </div>
                <Progress value={data.proteinToday} max={data.proteinTarget} variant="green" />
              </div>
            </div>
            {data.nutritionTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data.nutritionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-ink-faint)" fontSize={11} />
                  <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="calories" stroke="var(--color-amber)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="protein" stroke="var(--color-green)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Log meals to unlock nutrition trends" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Plan Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-display font-bold text-ink">{data.planCompliance}%</div>
              <Badge variant={data.planCompliance >= 80 ? "green" : data.planCompliance >= 60 ? "amber" : "red"}>
                {data.planCompliance >= 80 ? "On Track" : data.planCompliance >= 60 ? "Holding" : "Off Plan"}
              </Badge>
            </div>
            <Progress value={data.planCompliance} variant={data.planCompliance >= 80 ? "green" : "amber"} className="mb-3" />
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
                <p className="text-2xl font-bold text-green font-mono">{data.acwr.value}</p>
                <p className="text-xs text-ink-muted mt-0.5">ACWR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <a href="/train" className="text-xs text-accent hover:underline flex items-center">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </CardHeader>
          <CardContent>
            {data.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivities.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        a.type === "run" ? "bg-blue-subtle text-blue" : "bg-amber-subtle text-amber"
                      }`}
                    >
                      {a.type === "run" ? <Activity className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{a.name}</p>
                      <p className="text-xs text-ink-faint">
                        {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right">
                      {a.distance != null && <p className="text-sm font-mono text-ink">{a.distance.toFixed(1)} km</p>}
                      <p className="text-xs text-ink-muted">{fmtDuration(a.duration)}</p>
                    </div>
                    {a.rpe != null && (
                      <Badge variant={a.rpe > 6 ? "red" : a.rpe > 4 ? "amber" : "green"}>RPE {a.rpe}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted py-8 text-center">No activities yet. Log your first session.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Activity, label: "Log Run", href: "/train?tab=log", color: "text-blue" },
          { icon: Dumbbell, label: "Log Workout", href: "/train?tab=log", color: "text-amber" },
          { icon: Utensils, label: "Log Meal", href: "/nutrition-track", color: "text-green" },
          { icon: Target, label: "Check In", action: () => setShowCheckIn(true), color: "text-accent" },
        ].map((action, i) =>
          action.action ? (
            <button
              key={i}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all group"
            >
              <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">{action.label}</span>
            </button>
          ) : (
            <a
              key={i}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-all group"
            >
              <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">{action.label}</span>
            </a>
          )
        )}
      </div>

      {data.insight && (
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-subtle border border-accent/20">
              <Zap className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-ink-muted whitespace-pre-line">{data.insight.content}</p>
                {data.insight.recommendations?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.insight.recommendations.slice(0, 3).map((r, i) => (
                      <Badge key={i} variant="default">
                        {r}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showCheckIn && (
        <CheckInModal
          onClose={() => setShowCheckIn(false)}
          onSaved={() => {
            setShowCheckIn(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[200px] flex items-center justify-center border border-dashed border-border rounded-lg">
      <p className="text-sm text-ink-faint px-6 text-center">{label}</p>
    </div>
  );
}

function CheckInModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    sleepHours: 7.5,
    sleepQuality: 7,
    energyLevel: 7,
    motivation: 7,
    stressLevel: 4,
    soreness: 3,
    mood: "good",
    restingHeartRate: "",
    groinPain: 0,
    lowerBackPain: 0,
    shoulderPain: 0,
    kneePain: 0,
    hamstringTightness: 0,
    hydrationHit: true,
    proteinHit: true,
    mobilityCompleted: false,
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ overall: number; zone: string } | null>(null);

  const submit = async () => {
    setSaving(true);
    try {
      const payload: any = { ...form };
      if (form.restingHeartRate) payload.restingHeartRate = Number(form.restingHeartRate);
      else delete payload.restingHeartRate;
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) setResult({ overall: json.score.overall, zone: json.score.zone });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <Modal onClose={onSaved}>
        <div className="text-center py-6">
          <div
            className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-display font-bold mb-4"
            style={{
              background:
                result.zone === "green" ? "var(--color-green-subtle)" : result.zone === "yellow" ? "var(--color-amber-subtle)" : "var(--color-red-subtle)",
              color: result.zone === "green" ? "var(--color-green)" : result.zone === "yellow" ? "var(--color-amber)" : "var(--color-red)",
            }}
          >
            {result.overall}
          </div>
          <h3 className="text-lg font-display font-bold text-ink mb-1">Readiness: {result.zone}</h3>
          <p className="text-sm text-ink-muted mb-6">Check-in saved. Your plan adapts to this.</p>
          <Button onClick={onSaved}>Done</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-display font-bold text-ink mb-4">Daily Check-In</h3>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sleep (hours)">
            <input type="number" step="0.5" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: +e.target.value })} className="input" />
          </Field>
          <Field label="Sleep quality (1-10)">
            <input type="number" min={1} max={10} value={form.sleepQuality} onChange={(e) => setForm({ ...form, sleepQuality: +e.target.value })} className="input" />
          </Field>
          <Field label="Energy (1-10)">
            <input type="number" min={1} max={10} value={form.energyLevel} onChange={(e) => setForm({ ...form, energyLevel: +e.target.value })} className="input" />
          </Field>
          <Field label="Motivation (1-10)">
            <input type="number" min={1} max={10} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: +e.target.value })} className="input" />
          </Field>
          <Field label="Stress (1-10)">
            <input type="number" min={1} max={10} value={form.stressLevel} onChange={(e) => setForm({ ...form, stressLevel: +e.target.value })} className="input" />
          </Field>
          <Field label="Soreness (1-10)">
            <input type="number" min={1} max={10} value={form.soreness} onChange={(e) => setForm({ ...form, soreness: +e.target.value })} className="input" />
          </Field>
          <Field label="Resting HR (optional)">
            <input type="number" value={form.restingHeartRate} onChange={(e) => setForm({ ...form, restingHeartRate: e.target.value })} placeholder="55" className="input" />
          </Field>
          <Field label="Mood">
            <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className="input">
              <option value="good">Good</option>
              <option value="neutral">Neutral</option>
              <option value="bad">Bad</option>
              <option value="anxious">Anxious</option>
            </select>
          </Field>
        </div>

        <div>
          <p className="text-xs text-ink-muted mb-2">Pain sites (0-10)</p>
          <div className="grid grid-cols-5 gap-2">
            {(["groinPain", "lowerBackPain", "shoulderPain", "kneePain", "hamstringTightness"] as const).map((k) => (
              <div key={k}>
                <label className="text-[10px] text-ink-faint block mb-1 capitalize">{k.replace(/([A-Z])/g, " $1").replace("Pain", "").replace("Tightness", "")}</label>
                <input type="number" min={0} max={10} value={form[k]} onChange={(e) => setForm({ ...form, [k]: +e.target.value })} className="input" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {(["hydrationHit", "proteinHit", "mobilityCompleted"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="accent-[var(--color-accent)]" />
              {k === "hydrationHit" ? "Hydration" : k === "proteinHit" ? "Protein" : "Mobility"}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={submit} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Check-In"}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-ink-faint hover:text-ink">
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-ink-muted block mb-1">{label}</label>
      {children}
    </div>
  );
}
