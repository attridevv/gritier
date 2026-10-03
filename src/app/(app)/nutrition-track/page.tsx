"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Scale, Loader2, Trash2 } from "lucide-react";

type Meal = {
  id: string;
  name: string;
  date: string;
  mealType: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};
type Target = { calories: number; protein: number; carbs: number; fat: number; estimatedTDEE: number | null; goal: string } | null;
type Log = { id: string; date: string; calories: number; protein: number; carbs: number; fat: number; calorieTarget: number };

export default function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [targets, setTargets] = useState<Target>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "log">("overview");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/meals?days=30");
      if (res.ok) {
        const json = await res.json();
        setMeals(json.meals);
        setTargets(json.targets);
        setLogs(json.logs);
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

  const todayStr = new Date().toDateString();
  const todayLog = logs.find((l) => new Date(l.date).toDateString() === todayStr);
  const caloriesTarget = targets?.calories ?? 2600;
  const proteinTarget = Math.round(targets?.protein ?? 180);
  const carbsTarget = Math.round(targets?.carbs ?? 310);
  const fatTarget = Math.round(targets?.fat ?? 80);

  const calories = todayLog?.calories ?? 0;
  const protein = Math.round(todayLog?.protein ?? 0);
  const carbs = Math.round(todayLog?.carbs ?? 0);
  const fat = Math.round(todayLog?.fat ?? 0);

  const logMap = new Map(logs.map((l) => [new Date(l.date).toDateString(), l]));
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const l = logMap.get(d.toDateString());
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      consumed: l?.calories ?? 0,
      target: l?.calorieTarget ?? caloriesTarget,
      protein: Math.round(l?.protein ?? 0),
    };
  });

  const recentMeals = meals.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Nutrition</h1>
          <p className="text-sm text-ink-muted mt-1">Adaptive macro coaching, MacroFactor-style</p>
        </div>
        <Button size="sm" onClick={() => setActiveTab("log")}>
          <Plus className="w-4 h-4 mr-1" /> Log Meal
        </Button>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MacroTile label="Calories" value={calories} target={caloriesTarget} color="amber" />
            <MacroTile label="Protein" value={protein} target={proteinTarget} color="green" unit="g" />
            <MacroTile label="Carbs" value={carbs} target={carbsTarget} color="blue" unit="g" />
            <MacroTile label="Fat" value={fat} target={fatTarget} color="accent" unit="g" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length >= 1 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="day" stroke="var(--color-ink-faint)" fontSize={11} />
                      <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                      <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                      <Bar dataKey="consumed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Consumed" />
                      <Bar dataKey="target" fill="var(--color-border)" radius={[4, 4, 0, 0]} name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty label="Log meals to unlock your weekly view" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calories vs Target</CardTitle>
              </CardHeader>
              <CardContent>
                {logs.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={logs.map((l) => ({ date: new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }), calories: l.calories, target: l.calorieTarget }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={11} />
                      <YAxis stroke="var(--color-ink-faint)" fontSize={11} />
                      <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="calories" stroke="var(--color-amber)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="target" stroke="var(--color-border)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty label="A few more days of data will reveal your trend" />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Adaptive Coaching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-subtle border border-green/20">
                <Scale className="w-5 h-5 text-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-ink font-medium capitalize">
                    {targets?.goal ?? "maintain"} phase · {logs.length} days of data
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    {logs.length >= 7
                      ? `Estimated TDEE ${targets?.estimatedTDEE ?? caloriesTarget} kcal. Your targets update weekly from logged weight and intake.`
                      : "Log meals and weight for 7+ days and GRIT will estimate your true energy expenditure and adapt your macros automatically."}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="green">{targets?.goal ?? "maintain"}</Badge>
                    <Badge variant="amber">{caloriesTarget} kcal target</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Meals</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMeals.length > 0 ? (
                <div className="space-y-2">
                  {recentMeals.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate capitalize">
                          {m.mealType} — {m.name}
                        </p>
                        <p className="text-xs text-ink-faint">{new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      </div>
                      <div className="flex gap-3 text-xs font-mono">
                        <span className="text-amber">{m.totalCalories} cal</span>
                        <span className="text-green">{Math.round(m.totalProtein)}P</span>
                        <span className="text-blue">{Math.round(m.totalCarbs)}C</span>
                        <span className="text-accent">{Math.round(m.totalFat)}F</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted py-8 text-center">No meals logged yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "log" && (
        <MealLog onDone={() => { setActiveTab("overview"); load(); }} />
      )}
    </div>
  );
}

function MacroTile({ label, value, target, color, unit = "" }: { label: string; value: number; target: number; color: string; unit?: string }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const colorMap: Record<string, string> = { amber: "var(--color-amber)", green: "var(--color-green)", blue: "var(--color-blue)", accent: "var(--color-accent)" };
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <p className="text-xs text-ink-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display font-bold text-ink mt-1">
        {value.toLocaleString()}{unit}
      </p>
      <p className="text-xs text-ink-muted font-mono">/ {target.toLocaleString()}{unit} target</p>
      <div className="h-2 bg-surface-elevated rounded-full overflow-hidden mt-2">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colorMap[color] }} />
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="h-[240px] flex items-center justify-center border border-dashed border-border rounded-lg">
      <p className="text-sm text-ink-faint px-6 text-center">{label}</p>
    </div>
  );
}

function MealLog({ onDone }: { onDone: () => void }) {
  const [mealType, setMealType] = useState("breakfast");
  const [name, setName] = useState("");
  const [foods, setFoods] = useState([{ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fat: acc.fat + (f.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || mealType,
          date: new Date().toISOString(),
          mealType,
          foods,
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFat: totals.fat,
        }),
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
        <CardTitle>Log Meal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Meal Type</label>
            <select className="input" value={mealType} onChange={(e) => setMealType(e.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="preworkout">Pre-Workout</option>
              <option value="postworkout">Post-Workout</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Meal Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oatmeal & Eggs" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {foods.map((food, i) => (
            <div key={i} className="grid grid-cols-6 gap-2">
              <input className="input col-span-2" placeholder="Food" value={food.name} onChange={(e) => { const f = [...foods]; f[i] = { ...f[i], name: e.target.value }; setFoods(f); }} />
              <input type="number" className="input" placeholder="cal" value={food.calories || ""} onChange={(e) => { const f = [...foods]; f[i] = { ...f[i], calories: +e.target.value }; setFoods(f); }} />
              <input type="number" className="input" placeholder="P" value={food.protein || ""} onChange={(e) => { const f = [...foods]; f[i] = { ...f[i], protein: +e.target.value }; setFoods(f); }} />
              <input type="number" className="input" placeholder="C" value={food.carbs || ""} onChange={(e) => { const f = [...foods]; f[i] = { ...f[i], carbs: +e.target.value }; setFoods(f); }} />
              <input type="number" className="input" placeholder="F" value={food.fat || ""} onChange={(e) => { const f = [...foods]; f[i] = { ...f[i], fat: +e.target.value }; setFoods(f); }} />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setFoods([...foods, { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }])}>
            + Add Food
          </Button>
        </div>

        <div className="flex items-center justify-between mt-6 p-3 rounded-lg bg-surface-elevated">
          <span className="text-sm text-ink-muted">Totals</span>
          <div className="flex gap-4 text-sm font-mono">
            <span className="text-amber">{totals.calories} cal</span>
            <span className="text-green">{totals.protein}g P</span>
            <span className="text-blue">{totals.carbs}g C</span>
            <span className="text-accent">{totals.fat}g F</span>
          </div>
        </div>

        {error && <p className="text-sm text-red mt-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Meal"}
          </Button>
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
