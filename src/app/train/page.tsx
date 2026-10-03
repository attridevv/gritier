"use client";

import { useState } from "react";
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
import { Plus, Filter, Dumbbell, Activity } from "lucide-react";
import { format } from "date-fns";

const paceData = [
  { date: "Sep 1", pace: 5.5, hr: 142 },
  { date: "Sep 4", pace: 5.2, hr: 148 },
  { date: "Sep 7", pace: 5.8, hr: 138 },
  { date: "Sep 10", pace: 4.9, hr: 156 },
  { date: "Sep 13", pace: 5.4, hr: 144 },
  { date: "Sep 16", pace: 5.1, hr: 150 },
  { date: "Sep 19", pace: 5.3, hr: 146 },
];

const volumeData = [
  { week: "W1", volume: 3200 },
  { week: "W2", volume: 4100 },
  { week: "W3", volume: 3800 },
  { week: "W4", volume: 2900 },
  { week: "W5", volume: 4500 },
  { week: "W6", volume: 4200 },
];

export default function TrainPage() {
  const [activeTab, setActiveTab] = useState<"runs" | "strength" | "log">("runs");

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

      {/* Tabs */}
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
              activeTab === tab.key
                ? "border-accent text-accent font-medium"
                : "border-transparent text-ink-muted hover:text-ink"
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
            <StatCard label="Weekly Distance" value="32.4 km" trend={{ value: "+12%", positive: true }} />
            <StatCard label="Total Runs" value="24" />
            <StatCard label="Avg Pace" value="5:24 /km" trend={{ value: "-3s", positive: true }} />
            <StatCard label="Efficiency" value="0.038" trend={{ value: "+0.002", positive: true }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Pace & Heart Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={paceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={11} />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} yAxisId="left" />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} yAxisId="right" orientation="right" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="pace" stroke="var(--color-blue)" strokeWidth={2} dot />
                    <Line yAxisId="right" type="monotone" dataKey="hr" stroke="var(--color-red)" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Easy Morning Run", date: "Sep 19", dist: "5.2 km", time: "28:14", pace: "5:26", hr: 142, rpe: 4, type: "easy" },
                    { name: "Tempo Intervals", date: "Sep 16", dist: "7.0 km", time: "32:40", pace: "4:40", hr: 156, rpe: 8, type: "tempo" },
                    { name: "Long Run", date: "Sep 13", dist: "14.2 km", time: "1:18:30", pace: "5:32", hr: 144, rpe: 6, type: "longRun" },
                  ].map((run, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                      <div className="w-9 h-9 rounded-lg bg-blue-subtle text-blue flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{run.name}</p>
                        <p className="text-xs text-ink-faint">{run.date}</p>
                      </div>
                      <div className="text-right text-xs text-ink-muted space-y-0.5">
                        <p className="font-mono text-ink">{run.dist} · {run.time}</p>
                        <p>{run.pace}/km · HR {run.hr}</p>
                      </div>
                      <Badge variant={run.rpe > 6 ? "red" : run.rpe > 4 ? "amber" : "green"}>
                        RPE {run.rpe}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "strength" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard label="Weekly Volume" value="18,400 kg" trend={{ value: "+8%", positive: true }} />
            <StatCard label="Sessions" value="4" />
            <StatCard label="Avg RPE" value="7.2" />
            <StatCard label="Total kg Lifted" value="84,200" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={volumeData}>
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
                  <Bar dataKey="volume" fill="var(--color-amber)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Upper Body Push", date: "Sep 18", exercises: "Bench, OHP, Dips", duration: "45 min", rpe: 7 },
                  { name: "Lower Body Pull", date: "Sep 16", exercises: "Deadlift, RDL, Pull-ups", duration: "55 min", rpe: 8 },
                  { name: "Full Body", date: "Sep 14", exercises: "Squat, Press, Row", duration: "60 min", rpe: 6 },
                ].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                    <div className="w-9 h-9 rounded-lg bg-amber-subtle text-amber flex items-center justify-center">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{w.name}</p>
                      <p className="text-xs text-ink-faint">{w.exercises}</p>
                    </div>
                    <div className="text-right text-xs text-ink-muted">
                      <p className="font-mono text-ink">{w.duration}</p>
                    </div>
                    <Badge variant={w.rpe > 6 ? "red" : "amber"}>RPE {w.rpe}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "log" && <LogForm onClose={() => setActiveTab("runs")} />}
    </div>
  );
}

function LogForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"run" | "strength">("run");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setType("run")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              type === "run" ? "bg-blue-subtle text-blue border border-blue/20" : "bg-surface-elevated text-ink-muted border border-border"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-1.5" />
            Run
          </button>
          <button
            onClick={() => setType("strength")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              type === "strength" ? "bg-amber-subtle text-amber border border-amber/20" : "bg-surface-elevated text-ink-muted border border-border"
            }`}
          >
            <Dumbbell className="w-4 h-4 inline mr-1.5" />
            Strength
          </button>
        </div>

        {type === "run" ? (
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Distance (km)</label>
              <input type="number" step="0.1" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="5.0" />
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Duration (minutes)</label>
              <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="30" />
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Avg Heart Rate</label>
              <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="145" />
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">RPE (1-10)</label>
              <input type="number" min="1" max="10" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="5" />
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Type</label>
              <select className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm">
                <option value="easy">Easy</option>
                <option value="tempo">Tempo</option>
                <option value="intervals">Intervals</option>
                <option value="longRun">Long Run</option>
                <option value="recovery">Recovery</option>
                <option value="race">Race</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-muted block mb-1">Terrain</label>
              <select className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm">
                <option value="road">Road</option>
                <option value="trail">Trail</option>
                <option value="track">Track</option>
                <option value="treadmill">Treadmill</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-ink-muted block mb-1">Notes</label>
              <textarea className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" rows={3} placeholder="How did it feel?" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit">Save Activity</Button>
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-ink-muted block mb-1">Workout Type</label>
                <select className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm">
                  <option value="strength">Strength</option>
                  <option value="mobility">Mobility</option>
                  <option value="crossTraining">Cross Training</option>
                  <option value="rehab">Rehab</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Duration (min)</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="45" />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">RPE</label>
                <input type="number" min="1" max="10" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="7" />
              </div>
            </div>

            <div>
              <label className="text-xs text-ink-muted block mb-1">Exercises</label>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-2 text-xs text-ink-faint px-2">
                  <span className="col-span-2">Exercise</span>
                  <span>Weight</span>
                  <span>Sets</span>
                  <span>Reps</span>
                  <span>RPE</span>
                </div>
                {["Bench Press", "Squat", "Overhead Press"].map((ex, i) => (
                  <div key={i} className="grid grid-cols-6 gap-2 items-center">
                    <input className="col-span-2 bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm" defaultValue={ex} />
                    <input type="number" className="bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm" placeholder="kg" />
                    <input type="number" className="bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm" placeholder="sets" />
                    <input type="number" className="bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm" placeholder="reps" />
                    <input type="number" min="1" max="10" className="bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm" placeholder="RPE" />
                  </div>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" className="mt-2">+ Add Exercise</Button>
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save Workout</Button>
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
