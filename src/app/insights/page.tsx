"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Brain, Zap, TrendingUp, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

const mockInsights = [
  {
    id: 1,
    type: "weekly",
    date: "Sep 20, 2026",
    title: "Week 6 Review — Training load optimal, push tempo",
    readiness: 78,
    acwr: 1.12,
    injuryRisk: "low",
    content:
      "Your training load has been in the sweet spot all week (ACWR 1.12). Readiness scores averaged 76, with good sleep (7.2h avg) and stable RHR. Your tempo run on Thursday had great pace consistency — consider extending the tempo block by 1km next week.\n\nNutrition is tracking well at 90% calorie compliance. Protein intake is solid. Consider adding a post-run carb source to support recovery.\n\nNo injury flags detected. Groin pain at 1/10 is negligible. Keep up the mobility work — you logged 4/7 sessions this week.",
    recommendations: [
      "Extend Thursday tempo by 1km next week",
      "Add 30g post-run carbs",
      "Maintain mobility at 4+ sessions/week",
    ],
    categories: ["training", "nutrition", "recovery"],
  },
  {
    id: 2,
    type: "daily",
    date: "Sep 19, 2026",
    title: "Today's Readiness — Good to train",
    readiness: 82,
    acwr: 1.08,
    injuryRisk: "low",
    content:
      "Readiness at 82 — you're in the green. Sleep was solid (7.8h, quality 8/10). RHR at baseline. Energy and motivation both 8/10. Go for the planned tempo session.\n\nMinor hamstring tightness (2/10) — add 5 min dynamic warmup focusing on hip mobility.",
    recommendations: ["Proceed with tempo session", "Add 5 min hip mobility warmup"],
    categories: ["readiness", "training"],
  },
  {
    id: 3,
    type: "nutrition",
    date: "Sep 18, 2026",
    title: "Nutrition Insight — TDEE recalibrated",
    readiness: null,
    acwr: null,
    injuryRisk: null,
    content:
      "Based on your last 14 days of weight and nutrition data, your estimated TDEE has been recalibrated from 2,700 to 2,650 kcal/day. This suggests a slight metabolic adaptation — normal during a cut.\n\nYour current intake of 2,420 kcal/day puts you at a ~230 kcal deficit, producing ~0.2 kg/week loss. To hit your target of 0.5 kg/week, consider reducing by another 150-200 kcal or adding 20 min of light cardio 3x/week.",
    recommendations: [
      "Reduce intake by 150-200 kcal OR add light cardio",
      "Monitor weight trend for 7 days",
    ],
    categories: ["nutrition"],
  },
];

export default function InsightsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Insights</h1>
          <p className="text-sm text-ink-muted mt-1">AI-powered coaching analysis</p>
        </div>
        <Button size="sm">
          <Zap className="w-4 h-4 mr-1" /> Generate Report
        </Button>
      </div>

      {/* Latest Insight */}
      {mockInsights.map((insight) => (
        <Card key={insight.id} className={insight.id === 1 ? "border-accent/30" : ""}>
          <CardHeader
            className="cursor-pointer flex flex-row items-center justify-between"
            onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
          >
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    insight.type === "weekly"
                      ? "blue"
                      : insight.type === "daily"
                        ? "green"
                        : "amber"
                  }
                >
                  {insight.type}
                </Badge>
                <span className="text-xs text-ink-faint">{insight.date}</span>
              </div>
              <h3 className="text-base font-semibold text-ink mt-2">{insight.title}</h3>
            </div>
            {expandedId === insight.id ? (
              <ChevronUp className="w-4 h-4 text-ink-muted flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-ink-muted flex-shrink-0" />
            )}
          </CardHeader>

          {expandedId === insight.id && (
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {insight.readiness && (
                  <Badge variant={insight.readiness >= 80 ? "green" : insight.readiness >= 60 ? "amber" : "red"}>
                    Readiness: {insight.readiness}
                  </Badge>
                )}
                {insight.acwr && (
                  <Badge variant={insight.acwr <= 1.3 ? "green" : insight.acwr > 1.5 ? "red" : "amber"}>
                    ACWR: {insight.acwr}
                  </Badge>
                )}
                {insight.injuryRisk && (
                  <Badge variant={insight.injuryRisk === "low" ? "green" : insight.injuryRisk === "moderate" ? "amber" : "red"}>
                    Injury Risk: {insight.injuryRisk}
                  </Badge>
                )}
              </div>

              <div className="prose prose-sm prose-invert max-w-none">
                {insight.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm text-ink-muted leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {insight.recommendations.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-accent-subtle border border-accent/20">
                  <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Recommendations
                  </p>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-ink-muted flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
