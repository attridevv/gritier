"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  CalendarDays,
  Play,
  Check,
  Loader2,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";

type PlanDay = {
  id: string;
  date: string;
  weekNumber: number;
  dayOfWeek: number;
  workoutType: string | null;
  name: string | null;
  targetDistance: number | null;
  targetDuration: number | null;
  targetRPE: number | null;
  targetPace: number | null;
  paceWindow: { min: string; max: string } | null;
  completed: boolean;
  cue: string | null;
};

type Plan = {
  id: string;
  name: string;
  type: string;
  phase: string | null;
  distance: string | null;
  startDate: string;
  endDate: string;
  raceDate: string | null;
  totalWeeks: number;
  currentWeek: number;
  status: string;
  days: PlanDay[];
};

const typeColors: Record<string, string> = {
  run: "bg-blue-subtle text-blue border-blue/20",
  easy: "bg-blue-subtle text-blue border-blue/20",
  tempo: "bg-amber-subtle text-amber border-amber/20",
  intervals: "bg-red-subtle text-red border-red/20",
  longRun: "bg-accent-subtle text-accent border-accent/20",
  strength: "bg-amber-subtle text-amber border-amber/20",
  recovery: "bg-green-subtle text-green border-green/20",
  rest: "bg-surface-elevated text-ink-faint border-border",
};

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/plan");
      if (res.ok) {
        const json = await res.json();
        setPlan(json.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleComplete = async (day: PlanDay) => {
    setToggling(true);
    try {
      const res = await fetch("/api/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planDayId: day.id, completed: !day.completed }),
      });
      if (res.ok) {
        setPlan((p) =>
          p ? { ...p, days: p.days.map((d) => (d.id === day.id ? { ...d, completed: !d.completed } : d)) } : p
        );
        setSelectedDay(day.completed ? null : { ...day, completed: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-ink">Training Plan</h1>
        <div className="h-40 bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-ink">Training Plan</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-8 h-8 text-ink-faint mx-auto mb-3" />
            <p className="text-ink font-medium">No active plan</p>
            <p className="text-sm text-ink-muted mt-1">Create a plan to start tracking structured training.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const dayMap = new Map(plan.days.map((d) => [new Date(d.date).toDateString(), d]));

  const later = dayMap.get(today.toDateString());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const thisWeek = plan.days
    .filter((d) => {
      const dd = new Date(d.date);
      return dd >= weekStart && dd < new Date(weekStart.getTime() + 7 * 86400000);
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const due = plan.days.filter((d) => new Date(d.date) <= today);
  const compliance = due.length > 0 ? Math.round((due.filter((d) => d.completed).length / due.length) * 100) : 0;
  const totalPlanned = plan.days.reduce((s, d) => s + (d.targetDistance ?? 0), 0);

  const firstName = plan.days.find((d) => !d.completed && new Date(d.date) >= today && d.workoutType !== "rest");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">{plan.name}</h1>
          <p className="text-sm text-ink-muted mt-1">
            Week {plan.currentWeek} / {plan.totalWeeks} · {plan.type}
          </p>
        </div>
        <Badge variant={plan.status === "active" ? "green" : "amber"}>{plan.status}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Current Week" value={`${plan.currentWeek}/${plan.totalWeeks}`} />
        <StatCard label="Phase" value={plan.phase ?? "—"} accent />
        <StatCard label="Compliance" value={`${compliance}%`} />
        <StatCard label="Race Day" value={plan.raceDate ? format(new Date(plan.raceDate), "MMM d") : "—"} />
      </div>

      {later && (
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle>Next Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-display font-bold text-ink">{later.name ?? later.workoutType}</p>
                <p className="text-sm text-ink-muted mt-1">
                  {new Date(later.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  {later.targetDistance ? ` · ${later.targetDistance} km` : ""}
                  {later.paceWindow ? ` · ${later.paceWindow.min}–${later.paceWindow.max}/km` : ""}
                </p>
                {later.cue && <p className="text-xs text-accent mt-2 italic">&ldquo;{later.cue}&rdquo;</p>}
              </div>
              <Button onClick={() => toggleComplete(later)} disabled={toggling}>
                {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : later.completed ? <Check className="w-4 h-4" /> : "Mark Done"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-ink min-w-[120px] text-center">{format(currentMonth, "MMMM yyyy")}</span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <p key={d} className="text-xs text-ink-faint py-2">
                {d}
              </p>
            ))}
            {Array.from({ length: days[0].getDay() === 0 ? 6 : days[0].getDay() - 1 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const dayNum = day.getDate();
              const isToday = isSameDay(day, today);
              const pd = dayMap.get(day.toDateString());
              return (
                <button
                  key={dayNum}
                  onClick={() => pd && setSelectedDay(pd)}
                  className={`p-2 rounded-lg border min-h-[64px] transition-colors text-left ${
                    isToday ? "border-accent/50 bg-accent-subtle" : "border-border hover:bg-surface-elevated"
                  }`}
                >
                  <span className={`text-sm ${isToday ? "text-accent font-bold" : "text-ink"}`}>{dayNum}</span>
                  {pd && (
                    <div className="mt-1">
                      <div className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${typeColors[pd.workoutType ?? "rest"] ?? typeColors.rest}`}>
                        {pd.completed ? "✓ " : ""}
                        {pd.name ?? pd.workoutType}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>{new Date(selectedDay.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-display font-bold text-ink">{selectedDay.name ?? selectedDay.workoutType}</p>
                <div className="flex gap-3 mt-2 text-sm text-ink-muted">
                  {selectedDay.targetDistance && <span>{selectedDay.targetDistance} km</span>}
                  {selectedDay.paceWindow && <span>{selectedDay.paceWindow.min}–{selectedDay.paceWindow.max} /km</span>}
                  {selectedDay.targetRPE && <span>RPE {selectedDay.targetRPE}</span>}
                </div>
              </div>
              <Button
                variant={selectedDay.completed ? "secondary" : "default"}
                onClick={() => toggleComplete(selectedDay)}
                disabled={toggling}
              >
                {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedDay.completed ? "Completed ✓" : "Mark Done"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          {thisWeek.length > 0 ? (
            <div className="space-y-2">
              {thisWeek.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                  <span className="text-xs text-ink-faint w-10">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.dayOfWeek]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${typeColors[d.workoutType ?? "rest"] ?? typeColors.rest}`}>
                    {d.workoutType ?? "rest"}
                  </span>
                  <span className="text-sm text-ink flex-1 truncate">{d.name ?? "Rest"}</span>
                  {d.targetDistance && <span className="text-xs text-ink-muted font-mono">{d.targetDistance} km</span>}
                  {d.completed ? (
                    <Check className="w-4 h-4 text-green" />
                  ) : (
                    <button onClick={() => toggleComplete(d)} className="text-xs text-accent hover:underline">
                      Mark done
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted py-6 text-center">No sessions scheduled this week.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
