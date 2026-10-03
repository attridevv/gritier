"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "recharts";
import { Plus, Dumbbell, Activity, Loader2 } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  category: string | null;
  weight: number | null;
  sets: number | null;
  reps: number | null;
  rpe: number | null;
  estimated1RM: number | null;
  volumeLoad: number | null;
};

type Activity = {
  id: string;
  type: string;
  name: string;
  date: string;
  duration: number;
  rpe: number | null;
  distance: number | null;
  pace: number | null;
  avgHr: number | null;
  exercises: Exercise[];
};

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtPace(p: number | null) {
  if (!p) return "—";
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TrainPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"runs" | "strength" | "log">("runs");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/activities?limit=100");
      if (res.ok) {
        const json = await res.json();
        setActivities(json.activities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "log") setActiveTab("log");
  }, [load]);

  const runs = activities.filter((a) => a.type === "run");
  const strength = activities.filter((a) => a.type !== "run");

  const weekRuns = runs.filter((r) => new Date(r.date) >= new Date(Date.now() - 7 * 86400000));
  const weeklyDistance = Math.round(weekRuns.reduce((s, r) => s + (r.distance ?? 0), 0) * 10) / 10;
  const avgPace =
    runs.filter((r) => r.pace).length > 0
      ? runs.filter((r) => r.pace).reduce((s, r) => s + (r.pace ?? 0), 0) / runs.filter((r) => r.pace).length
      : 0;
  const avgEfficiency =
    runs.filter((r) => r.pace && r.avgHr).length > 0
      ? runs.filter((r) => r.pace && r.avgHr).reduce((s, r) => s + (r.pace ?? 0) / (r.avgHr ?? 1), 0) /
        runs.filter((r) => r.pace && r.avgHr).length
      : 0;

  const weekStrength = strength.filter((s) => new Date(s.date) >= new Date(Date.now() - 7 * 86400000));
  const weeklyVolume = weekStrength.reduce(
    (sum, w) => sum + w.exercises.reduce((s, e) => s + (e.volumeLoad ?? 0), 0),
    0
  );
  const totalVolume = strength.reduce(
    (sum, w) => sum + w.exercises.reduce((s, e) => s + (e.volumeLoad ?? 0), 0),
    0
  );
  const avgRpe =
    strength.filter((s) => s.rpe).length > 0
      ? strength.filter((s) => s.rpe).reduce((s, w) => s + (w.rpe ?? 0), 0) / strength.filter((s) => s.rpe).length
      : 0;

  const paceData = [...runs]
    .filter((r) => r.pace)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(-10)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pace: Number((r.pace ?? 0).toFixed(2)),
      hr: r.avgHr ?? 0,
    }));

  const volumeData = Object.values(
    strength
      .filter((s) => s.date >= new Date(Date.now() - 42 * 86400000).toISOString())
      .reduce((acc: Record<string, { week: string; volume: number }>, w) => {
        const d = new Date(w.date);
        const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day);
        const key = d.toISOString().slice(0, 10);
        if (!acc[key]) acc[key] = { week: new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }), volume: 0 };
        acc[key].volume += w.exercises.reduce((s, e) => s + (e.volumeLoad ?? 0), 0);
        return acc;
      }, {})
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Training</h1>
          <p className="text-sm text-ink-muted mt-1">Runs, workouts, and performance</p>
        </div>
        <Button size="sm" onClick={() => setActiveTab("log")}>
          <Plus className="w-4 h-4 mr-1" /> Log Activity
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border">
        {[
          { key: "runs", label: "Runs", icon: Activity },
          { key: "strength", label: "Strength", icon: Dumbbell },
          { key: "log", label: "Log New", icon: Plus },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${
              activeTab === tab.key ? "border-accent text-accent font-medium" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "runs" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard label="Weekly Distance" value={`${weeklyDistance} km`} />
            <StatCard label="Total Runs" value={String(runs.length)} />
            <StatCard label="Avg Pace" value={`${fmtPace(avgPace)} /km`} />
            <StatCard label="Efficiency" value={avgEfficiency ? avgEfficiency.toFixed(3) : "—"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pace & Heart Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {paceData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={paceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={11} />
                      <YAxis stroke="var(--color-ink-faint)" fontSize={11} yAxisId="left" reversed />
                      <YAxis stroke="var(--color-ink-faint)" fontSize={11} yAxisId="right" orientation="right" />
                      <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                      <Line yAxisId="left" type="monotone" dataKey="pace" stroke="var(--color-blue)" strokeWidth={2} dot />
                      <Line yAxisId="right" type="monotone" dataKey="hr" stroke="var(--color-red)" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty label="Log a few runs to see your pace and HR trend" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                {runs.length > 0 ? (
                  <div className="space-y-3">
                    {runs.slice(0, 5).map((run) => (
                      <div key={run.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                        <div className="w-9 h-9 rounded-lg bg-blue-subtle text-blue flex items-center justify-center">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{run.name}</p>
                          <p className="text-xs text-ink-faint">
                            {new Date(run.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right text-xs text-ink-muted space-y-0.5">
                          <p className="font-mono text-ink">
                            {run.distance ? `${run.distance.toFixed(1)} km` : "—"} · {fmtDuration(run.duration)}
                          </p>
                          <p>
                            {fmtPace(run.pace)}/km{run.avgHr ? ` · HR ${run.avgHr}` : ""}
                          </p>
                        </div>
                        {run.rpe && <Badge variant={run.rpe > 6 ? "red" : run.rpe > 4 ? "amber" : "green"}>RPE {run.rpe}</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-muted py-8 text-center">No runs logged yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "strength" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard label="Weekly Volume" value={`${Math.round(weeklyVolume).toLocaleString()} kg`} />
            <StatCard label="Sessions" value={String(strength.length)} />
            <StatCard label="Avg RPE" value={avgRpe ? avgRpe.toFixed(1) : "—"} />
            <StatCard label="Total kg Lifted" value={Math.round(totalVolume).toLocaleString()} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {volumeData.length > 1 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="week" stroke="var(--color-ink-faint)" fontSize={11} />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                    <Bar dataKey="volume" fill="var(--color-amber)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty label="Log a few sessions to see your volume trend" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {strength.length > 0 ? (
                <div className="space-y-3">
                  {strength.slice(0, 5).map((w) => (
                    <div key={w.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                      <div className="w-9 h-9 rounded-lg bg-amber-subtle text-amber flex items-center justify-center">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{w.name}</p>
                        <p className="text-xs text-ink-faint truncate">
                          {w.exercises.map((e) => e.name).join(", ") || "No exercises"}
                        </p>
                      </div>
                      <p className="text-xs text-ink-muted font-mono">{fmtDuration(w.duration)}</p>
                      {w.rpe && <Badge variant={w.rpe > 6 ? "red" : "amber"}>RPE {w.rpe}</Badge>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted py-8 text-center">No workouts logged yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "log" && <LogForm onDone={() => { setActiveTab("runs"); load(); }} />}
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

function LogForm({ onDone }: { onDone: () => void }) {
  const [type, setType] = useState<"run" | "strength">("run");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 16);

  const [run, setRun] = useState({ name: "Easy Run", distance: "", durationMin: "", durationSec: "0", avgHr: "", rpe: "5", terrain: "road", notes: "" });
  const [lift, setLift] = useState({
    name: "Strength Session",
    durationMin: "45",
    rpe: "7",
    exercises: [{ name: "Bench Press", weight: "", sets: "3", reps: "8", rpe: "7" }],
  });

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const now = new Date().toISOString();
      let payload: any;
      if (type === "run") {
        const duration = Number(run.durationMin) * 60 + Number(run.durationSec);
        if (!duration) throw new Error("Enter a duration");
        payload = {
          type: "run",
          name: run.name,
          date: now,
          duration,
          distance: run.distance ? Number(run.distance) : undefined,
          avgHr: run.avgHr ? Number(run.avgHr) : undefined,
          rpe: run.rpe ? Number(run.rpe) : undefined,
          terrain: run.terrain,
          notes: run.notes || undefined,
          isPublic: true,
        };
      } else {
        payload = {
          type: "strength",
          name: lift.name,
          date: now,
          duration: Number(lift.durationMin) * 60,
          rpe: lift.rpe ? Number(lift.rpe) : undefined,
          exercises: lift.exercises
            .filter((e) => e.name)
            .map((e) => ({
              name: e.name,
              weight: e.weight ? Number(e.weight) : undefined,
              sets: e.sets ? Number(e.sets) : undefined,
              reps: e.reps ? Number(e.reps) : undefined,
              rpe: e.rpe ? Number(e.rpe) : undefined,
            })),
        };
      }
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onDone();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setType("run")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${type === "run" ? "bg-blue-subtle text-blue border border-blue/20" : "bg-surface-elevated text-ink-muted border border-border"}`}
          >
            <Activity className="w-4 h-4 inline mr-1.5" />
            Run
          </button>
          <button
            onClick={() => setType("strength")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${type === "strength" ? "bg-amber-subtle text-amber border border-amber/20" : "bg-surface-elevated text-ink-muted border border-border"}`}
          >
            <Dumbbell className="w-4 h-4 inline mr-1.5" />
            Strength
          </button>
        </div>

        {error && <p className="text-sm text-red mb-4">{error}</p>}

        {type === "run" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name">
              <input className="input" value={run.name} onChange={(e) => setRun({ ...run, name: e.target.value })} />
            </Field>
            <Field label="Distance (km)">
              <input type="number" step="0.1" className="input" value={run.distance} onChange={(e) => setRun({ ...run, distance: e.target.value })} placeholder="5.0" />
            </Field>
            <Field label="Duration (min)">
              <input type="number" className="input" value={run.durationMin} onChange={(e) => setRun({ ...run, durationMin: e.target.value })} placeholder="30" />
            </Field>
            <Field label="Seconds">
              <input type="number" className="input" value={run.durationSec} onChange={(e) => setRun({ ...run, durationSec: e.target.value })} />
            </Field>
            <Field label="Avg Heart Rate">
              <input type="number" className="input" value={run.avgHr} onChange={(e) => setRun({ ...run, avgHr: e.target.value })} placeholder="145" />
            </Field>
            <Field label="RPE (1-10)">
              <input type="number" min={1} max={10} className="input" value={run.rpe} onChange={(e) => setRun({ ...run, rpe: e.target.value })} />
            </Field>
            <Field label="Terrain">
              <select className="input" value={run.terrain} onChange={(e) => setRun({ ...run, terrain: e.target.value })}>
                <option value="road">Road</option>
                <option value="trail">Trail</option>
                <option value="track">Track</option>
                <option value="treadmill">Treadmill</option>
              </select>
            </Field>
            <Field label="Notes">
              <input className="input" value={run.notes} onChange={(e) => setRun({ ...run, notes: e.target.value })} placeholder="How did it feel?" />
            </Field>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Name">
                <input className="input" value={lift.name} onChange={(e) => setLift({ ...lift, name: e.target.value })} />
              </Field>
              <Field label="Duration (min)">
                <input type="number" className="input" value={lift.durationMin} onChange={(e) => setLift({ ...lift, durationMin: e.target.value })} />
              </Field>
              <Field label="RPE">
                <input type="number" min={1} max={10} className="input" value={lift.rpe} onChange={(e) => setLift({ ...lift, rpe: e.target.value })} />
              </Field>
            </div>

            <div>
              <p className="text-xs text-ink-muted mb-2">Exercises</p>
              <div className="space-y-2">
                {lift.exercises.map((ex, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2">
                    <input
                      className="input col-span-2"
                      value={ex.name}
                      placeholder="Exercise"
                      onChange={(e) => {
                        const exs = [...lift.exercises];
                        exs[i] = { ...exs[i], name: e.target.value };
                        setLift({ ...lift, exercises: exs });
                      }}
                    />
                    <input type="number" className="input" placeholder="kg" value={ex.weight} onChange={(e) => { const exs = [...lift.exercises]; exs[i] = { ...exs[i], weight: e.target.value }; setLift({ ...lift, exercises: exs }); }} />
                    <input type="number" className="input" placeholder="sets" value={ex.sets} onChange={(e) => { const exs = [...lift.exercises]; exs[i] = { ...exs[i], sets: e.target.value }; setLift({ ...lift, exercises: exs }); }} />
                    <input type="number" className="input" placeholder="reps" value={ex.reps} onChange={(e) => { const exs = [...lift.exercises]; exs[i] = { ...exs[i], reps: e.target.value }; setLift({ ...lift, exercises: exs }); }} />
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setLift({ ...lift, exercises: [...lift.exercises, { name: "", weight: "", sets: "3", reps: "8", rpe: "7" }] })}>
                + Add Exercise
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Activity"}
          </Button>
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
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
