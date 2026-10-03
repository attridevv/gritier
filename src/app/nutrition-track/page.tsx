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
  AreaChart,
  Area,
} from "recharts";
import { Plus, TrendingUp, Scale, Utensils } from "lucide-react";
import { format, subDays } from "date-fns";

const weightData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "MMM d"),
  weight: 72 + Math.random() * 3 - 1.5 - (i * 0.02),
  tdee: 2650 + Math.random() * 100 - 50,
}));

const calorieData = Array.from({ length: 7 }, (_, i) => ({
  day: format(subDays(new Date(), 6 - i), "EEE"),
  consumed: 2200 + Math.random() * 600,
  target: 2600,
  protein: 140 + Math.random() * 60,
  carbs: 200 + Math.random() * 100,
  fat: 60 + Math.random() * 30,
}));

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "log">("overview");

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
          {/* MacroFactor-style Hat */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs text-ink-muted uppercase tracking-wider">Calories</p>
              <p className="text-2xl font-display font-bold text-ink mt-1">2,340</p>
              <p className="text-xs text-ink-muted font-mono">/ 2,600 target</p>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden mt-2">
                <div className="h-full bg-amber rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs text-ink-muted uppercase tracking-wider">Protein</p>
              <p className="text-2xl font-display font-bold text-green mt-1">168g</p>
              <p className="text-xs text-ink-muted font-mono">/ 180g target</p>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden mt-2">
                <div className="h-full bg-green rounded-full" style={{ width: "93%" }} />
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs text-ink-muted uppercase tracking-wider">Carbs</p>
              <p className="text-2xl font-display font-bold text-ink mt-1">280g</p>
              <p className="text-xs text-ink-muted font-mono">/ 310g target</p>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden mt-2">
                <div className="h-full bg-blue rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs text-ink-muted uppercase tracking-wider">Fat</p>
              <p className="text-2xl font-display font-bold text-ink mt-1">72g</p>
              <p className="text-xs text-ink-muted font-mono">/ 80g target</p>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden mt-2">
                <div className="h-full bg-accent rounded-full" style={{ width: "90%" }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weight Trend + TDEE */}
            <Card>
              <CardHeader>
                <CardTitle>Weight & Energy Expenditure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-ink-faint)" fontSize={10} tick={{ transform: "rotate(-30)" }} />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} yAxisId="weight" />
                    <YAxis stroke="var(--color-ink-faint)" fontSize={11} yAxisId="tdee" orientation="right" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area yAxisId="weight" type="monotone" dataKey="weight" stroke="var(--color-accent)" strokeWidth={2} fill="url(#weightGrad)" />
                    <Line yAxisId="tdee" type="monotone" dataKey="tdee" stroke="var(--color-green)" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-3 text-xs text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-accent rounded" />
                    <span>Weight (kg)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-green rounded" style={{ borderTop: "1px dashed" }} />
                    <span>Est. TDEE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Nutrition */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={calorieData}>
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
                    <Bar dataKey="consumed" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Consumed" />
                    <Bar dataKey="target" fill="var(--color-border)" radius={[4, 4, 0, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Avg Daily Calories</span>
                    <span className="text-ink font-mono">2,420</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Avg Protein</span>
                    <span className="text-green font-mono">165g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Weight Trend</span>
                    <span className="text-amber font-mono">-0.3 kg/wk</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coaching Insight */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Coaching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-subtle border border-green/20">
                <Scale className="w-5 h-5 text-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-ink font-medium">You&apos;re on track for your cut</p>
                  <p className="text-xs text-ink-muted mt-1">
                    Estimated TDEE: 2,650 kcal. Current intake averaging 2,420 kcal/day.
                    Weight trend at -0.3 kg/week — slightly below target of -0.5 kg/week.
                    Consider increasing intake by 100 kcal if trend doesn&apos;t adjust in 5-7 days.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="green">Cut Phase</Badge>
                    <Badge variant="amber">Adjust +100 kcal if needed</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "log" && <MealLog onClose={() => setActiveTab("overview")} />}
    </div>
  );
}

function MealLog({ onClose }: { onClose: () => void }) {
  const [foods, setFoods] = useState([{ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }]);

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Meal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Meal Type</label>
            <select className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
              <option>Pre-Workout</option>
              <option>Post-Workout</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Meal Name</label>
            <input type="text" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="e.g. Oatmeal & Eggs" />
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Quick Add (calories)</label>
            <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" placeholder="400" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-5 gap-2 text-xs text-ink-faint px-2">
            <span className="col-span-2">Food</span>
            <span>Calories</span>
            <span>Protein (g)</span>
            <span>Carbs (g) / Fat (g)</span>
          </div>
          {foods.map((food, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
              <input
                className="col-span-2 bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm"
                placeholder="Search or enter food"
                value={food.name}
                onChange={(e) => {
                  const updated = [...foods];
                  updated[i] = { ...updated[i], name: e.target.value };
                  setFoods(updated);
                }}
              />
              <input
                type="number"
                className="bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm"
                placeholder="cal"
                value={food.calories || ""}
                onChange={(e) => {
                  const updated = [...foods];
                  updated[i] = { ...updated[i], calories: +e.target.value };
                  setFoods(updated);
                }}
              />
              <input
                type="number"
                className="bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm"
                placeholder="protein"
                value={food.protein || ""}
                onChange={(e) => {
                  const updated = [...foods];
                  updated[i] = { ...updated[i], protein: +e.target.value };
                  setFoods(updated);
                }}
              />
              <div className="flex gap-1.5">
                <input
                  type="number"
                  className="flex-1 bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm"
                  placeholder="carbs"
                  value={food.carbs || ""}
                  onChange={(e) => {
                    const updated = [...foods];
                    updated[i] = { ...updated[i], carbs: +e.target.value };
                    setFoods(updated);
                  }}
                />
                <input
                  type="number"
                  className="flex-1 bg-surface-elevated border border-border rounded px-2 py-1.5 text-ink text-sm"
                  placeholder="fat"
                  value={food.fat || ""}
                  onChange={(e) => {
                    const updated = [...foods];
                    updated[i] = { ...updated[i], fat: +e.target.value };
                    setFoods(updated);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="ghost" size="sm" onClick={() => setFoods([...foods, { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }])}>
          + Add Food
        </Button>

        <div className="flex items-center justify-between mt-6 p-3 rounded-lg bg-surface-elevated">
          <span className="text-sm text-ink-muted">Totals</span>
          <div className="flex gap-4 text-sm font-mono">
            <span className="text-amber">{totals.calories} cal</span>
            <span className="text-green">{totals.protein}g P</span>
            <span className="text-blue">{totals.carbs}g C</span>
            <span className="text-accent">{totals.fat}g F</span>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button onClick={onClose}>Save Meal</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
