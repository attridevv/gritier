"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Zap, Lightbulb, ChevronDown, ChevronUp, Loader2, Brain } from "lucide-react";

type Insight = {
  id: string;
  type: string;
  content: string;
  metadata: { readiness?: number; acwr?: number; injuryRisk?: string } | null;
  recommendations: string[] | null;
  createdAt: string;
};

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/insights");
      if (res.ok) {
        const json = await res.json();
        setInsights(json.insights);
        if (json.insights[0]) setExpandedId(json.insights[0].id);
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

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setInsights((prev) => [json.insight, ...prev]);
        setExpandedId(json.insight.id);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Insights</h1>
          <p className="text-sm text-ink-muted mt-1">AI-powered coaching analysis</p>
        </div>
        <Button size="sm" onClick={generate} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
          Generate Report
        </Button>
      </div>

      {loading ? (
        <div className="h-48 bg-surface rounded-xl border border-border animate-pulse" />
      ) : insights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="w-8 h-8 text-ink-faint mx-auto mb-3" />
            <p className="text-ink font-medium">No insights yet</p>
            <p className="text-sm text-ink-muted mt-1">Generate your first coaching report from your latest training data.</p>
            <Button className="mt-4" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
              Generate Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        insights.map((insight, idx) => (
          <Card key={insight.id} className={idx === 0 ? "border-accent/30" : ""}>
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between"
              onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={insight.type === "weekly" ? "blue" : insight.type === "nutrition" ? "amber" : "green"}>
                    {insight.type}
                  </Badge>
                  <span className="text-xs text-ink-faint">
                    {new Date(insight.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-ink mt-2">
                  {idx === 0 ? "Latest Coaching Report" : `${insight.type} analysis`}
                </h3>
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
                  {insight.metadata?.readiness != null && (
                    <Badge variant={insight.metadata.readiness >= 80 ? "green" : insight.metadata.readiness >= 60 ? "amber" : "red"}>
                      Readiness: {insight.metadata.readiness}
                    </Badge>
                  )}
                  {insight.metadata?.acwr != null && (
                    <Badge variant={insight.metadata.acwr <= 1.3 ? "green" : insight.metadata.acwr > 1.5 ? "red" : "amber"}>
                      ACWR: {insight.metadata.acwr}
                    </Badge>
                  )}
                  {insight.metadata?.injuryRisk && (
                    <Badge variant={insight.metadata.injuryRisk === "low" ? "green" : insight.metadata.injuryRisk === "moderate" ? "amber" : "red"}>
                      Injury Risk: {insight.metadata.injuryRisk}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  {insight.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-sm text-ink-muted leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {insight.recommendations && insight.recommendations.length > 0 && (
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
        ))
      )}
    </div>
  );
}
