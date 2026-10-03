"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Palette, Database, Loader2, Check } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "data">("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>({
    height: "",
    weight: "",
    bodyFat: "",
    age: "",
    sex: "male",
    restingHR: "",
    vo2Max: "",
    trainingAge: "",
    raceGoal: "",
    raceDistance: "half",
    weeklyAvailability: "",
    recoveryCapacity: "medium",
    dietaryPreference: "balanced",
    bio: "",
    location: "",
    isPublic: false,
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const json = await res.json();
        if (json.profile) {
          const p = json.profile;
          setForm((f: any) => ({
            ...f,
            ...Object.fromEntries(Object.entries(p).filter(([, v]) => v !== null && v !== undefined)),
          }));
        }
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

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const numeric = ["height", "weight", "bodyFat", "age", "restingHR", "vo2Max", "trainingAge", "weeklyAvailability"];
      const payload: any = { ...form };
      for (const k of numeric) {
        if (payload[k] === "" || payload[k] == null) delete payload[k];
        else payload[k] = Number(payload[k]);
      }
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  const set = (k: string) => (e: any) =>
    setForm((f: any) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-ink">Settings</h1>
        <div className="h-64 bg-surface rounded-xl border border-border animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {[
          { key: "profile", label: "Profile", icon: User },
          { key: "preferences", label: "Preferences", icon: Palette },
          { key: "data", label: "Data", icon: Database },
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

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Height (cm)"><input className="input" type="number" value={form.height} onChange={set("height")} /></Field>
              <Field label="Weight (kg)"><input className="input" type="number" step="0.1" value={form.weight} onChange={set("weight")} /></Field>
              <Field label="Body Fat (%)"><input className="input" type="number" value={form.bodyFat} onChange={set("bodyFat")} /></Field>
              <Field label="Age"><input className="input" type="number" value={form.age} onChange={set("age")} /></Field>
              <Field label="Sex">
                <select className="input" value={form.sex} onChange={set("sex")}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Resting HR (bpm)"><input className="input" type="number" value={form.restingHR} onChange={set("restingHR")} /></Field>
              <Field label="VO₂ Max"><input className="input" type="number" step="0.1" value={form.vo2Max} onChange={set("vo2Max")} /></Field>
              <Field label="Training Age (years)"><input className="input" type="number" step="0.5" value={form.trainingAge} onChange={set("trainingAge")} /></Field>
              <Field label="Bio"><input className="input" value={form.bio} onChange={set("bio")} placeholder="A line about you" /></Field>
              <Field label="Location"><input className="input" value={form.location} onChange={set("location")} placeholder="City, Country" /></Field>
            </div>
            <SaveRow saving={saving} saved={saved} onSave={save} />
          </CardContent>
        </Card>
      )}

      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle>Training Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Weekly Availability (hours)"><input className="input" type="number" value={form.weeklyAvailability} onChange={set("weeklyAvailability")} /></Field>
              <Field label="Recovery Capacity">
                <select className="input" value={form.recoveryCapacity} onChange={set("recoveryCapacity")}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Field label="Race Goal"><input className="input" value={form.raceGoal} onChange={set("raceGoal")} placeholder="Sub-1:40 Half Marathon" /></Field>
              <Field label="Race Distance">
                <select className="input" value={form.raceDistance} onChange={set("raceDistance")}>
                  <option value="5k">5K</option>
                  <option value="10k">10K</option>
                  <option value="half">Half Marathon</option>
                  <option value="marathon">Marathon</option>
                  <option value="ultra">Ultra</option>
                </select>
              </Field>
              <Field label="Dietary Preference">
                <select className="input" value={form.dietaryPreference} onChange={set("dietaryPreference")}>
                  <option value="balanced">Balanced</option>
                  <option value="highprotein">High Protein</option>
                  <option value="lowcarb">Low Carb</option>
                  <option value="keto">Keto</option>
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink-muted mt-6">
                <input type="checkbox" checked={form.isPublic} onChange={set("isPublic")} className="accent-[var(--color-accent)]" />
                Public profile
              </label>
            </div>
            <SaveRow saving={saving} saved={saved} onSave={save} />
          </CardContent>
        </Card>
      )}

      {activeTab === "data" && (
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-muted mb-4">Download all your training, nutrition, and health data as JSON.</p>
            <Button
              variant="secondary"
              onClick={async () => {
                const [a, m, i] = await Promise.all([
                  fetch("/api/activities?limit=200").then((r) => r.json()),
                  fetch("/api/meals?days=90").then((r) => r.json()),
                  fetch("/api/insights").then((r) => r.json()),
                ]);
                const blob = new Blob([JSON.stringify({ activities: a.activities, meals: m.meals, insights: i.insights }, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "grit-export.json";
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export All Data
            </Button>
          </CardContent>
        </Card>
      )}
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

function SaveRow({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="flex justify-end items-center gap-3 mt-4">
      {saved && (
        <span className="text-sm text-green flex items-center gap-1">
          <Check className="w-4 h-4" /> Saved
        </span>
      )}
      <Button onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
      </Button>
    </div>
  );
}
