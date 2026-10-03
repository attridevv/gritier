"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Target,
  Check,
  X,
  Play,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";

const mockPlan = {
  name: "Half Marathon Build",
  phase: "Build",
  currentWeek: 6,
  totalWeeks: 12,
  raceDate: "2027-03-15",
  raceDistance: "Half Marathon",
  compliance: 87,
};

const weekPlan = {
  1: [
    { day: "Mon", type: "rest", name: "Rest & Recovery" },
    { day: "Tue", type: "run", name: "Easy 5K", dist: "5.0 km", rpe: 4, pace: "5:30-6:00", done: true },
    { day: "Wed", type: "strength", name: "Lower Body", rpe: 6, done: true },
    { day: "Thu", type: "run", name: "Tempo 6K", dist: "6.0 km", rpe: 7, pace: "4:50-5:10", done: true },
    { day: "Fri", type: "rest", name: "Active Recovery" },
    { day: "Sat", type: "run", name: "Easy Shakeout", dist: "3.0 km", rpe: 3, done: true },
    { day: "Sun", type: "run", name: "Long Run 10K", dist: "10.0 km", rpe: 5, pace: "5:45-6:15", done: false },
  ],
};

export default function PlanPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const today = new Date();
  const dayActivities: Record<number, { type: string; name: string; done?: boolean }[]> = {
    3: [{ type: "run", name: "Easy 5K", done: true }],
    5: [{ type: "strength", name: "Lower Body", done: true }],
    8: [{ type: "run", name: "Tempo 6K", done: false }],
    15: [{ type: "run", name: "Long Run 12K", done: false }],
  };

  const typeColors: Record<string, string> = {
    run: "bg-blue-subtle text-blue border-blue/20",
    strength: "bg-amber-subtle text-amber border-amber/20",
    recovery: "bg-green-subtle text-green border-green/20",
    rest: "bg-surface-elevated text-ink-faint",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Training Plan</h1>
          <p className="text-sm text-ink-muted mt-1">
            {mockPlan.name} — Week {mockPlan.currentWeek} / {mockPlan.totalWeeks}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowPlanModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Plan
        </Button>
      </div>

      {/* Plan Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Current Week" value={`${mockPlan.currentWeek}/${mockPlan.totalWeeks}`} />
        <StatCard label="Phase" value={mockPlan.phase} accent />
        <StatCard label="Compliance" value={`${mockPlan.compliance}%`} trend={{ value: "+5%", positive: true }} />
        <StatCard label="Race Date" value={format(new Date(mockPlan.raceDate), "MMM d")} />
      </div>

      {/* This Week */}
      <Card>
        <CardHeader>
          <CardTitle>
            This Week ({mockPlan.currentWeek})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekPlan[1].map((day, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-center ${
                  day.type === "rest"
                    ? "border-border bg-surface-elevated"
                    : day.done
                      ? "border-green/30 bg-green-subtle"
                      : "border-border bg-surface"
                }`}
              >
                <p className="text-xs text-ink-faint mb-1">{day.day}</p>
                <p className="text-xs font-medium text-ink truncate">{day.name}</p>
                {day.dist && <p className="text-xs text-ink-muted mt-0.5 font-mono">{day.dist}</p>}
                {day.pace && <p className="text-xs text-ink-faint font-mono">{day.pace}</p>}
                <div className="mt-1.5 flex justify-center">
                  {day.type === "rest" ? (
                    <span className="text-xs text-ink-faint">—</span>
                  ) : day.done ? (
                    <Check className="w-3.5 h-3.5 text-green" />
                  ) : (
                    <span className="text-xs text-amber">○</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-ink min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <p key={d} className="text-xs text-ink-faint py-2">{d}</p>
            ))}
            {Array.from({ length: days[0].getDay() === 0 ? 6 : days[0].getDay() - 1 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const dayNum = day.getDate();
              const isToday = isSameDay(day, today);
              const activities = dayActivities[dayNum] || [];
              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                  className={`p-2 rounded-lg border min-h-[70px] transition-colors text-left ${
                    isToday
                      ? "border-accent/50 bg-accent-subtle"
                      : selectedDay === dayNum
                        ? "border-accent/30 bg-surface-elevated"
                        : "border-border hover:bg-surface-elevated"
                  }`}
                >
                  <span className={`text-sm ${isToday ? "text-accent font-bold" : "text-ink"}`}>
                    {dayNum}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {activities.slice(0, 2).map((a, i) => (
                      <div
                        key={i}
                        className={`text-xs px-1.5 py-0.5 rounded border truncate ${typeColors[a.type] || typeColors.rest}`}
                      >
                        {a.done && "✓ "}{a.name}
                      </div>
                    ))}
                    {activities.length > 2 && (
                      <p className="text-xs text-ink-faint">+{activities.length - 2} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Overall Progress</span>
              <span className="text-sm font-mono text-ink">
                {Math.round((mockPlan.currentWeek / mockPlan.totalWeeks) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${(mockPlan.currentWeek / mockPlan.totalWeeks) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-surface-elevated rounded-lg p-3 text-center">
                <Target className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-sm font-mono text-ink">{mockPlan.raceDistance}</p>
                <p className="text-xs text-ink-faint">Target</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3 text-center">
                <CalendarDays className="w-4 h-4 text-blue mx-auto mb-1" />
                <p className="text-sm font-mono text-ink">{format(new Date(mockPlan.raceDate), "MMM d, yyyy")}</p>
                <p className="text-xs text-ink-faint">Race Day</p>
              </div>
              <div className="bg-surface-elevated rounded-lg p-3 text-center">
                <Play className="w-4 h-4 text-green mx-auto mb-1" />
                <p className="text-sm font-mono text-ink">Week {mockPlan.currentWeek}</p>
                <p className="text-xs text-ink-faint">Current</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
