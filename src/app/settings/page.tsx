"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, Palette, Database, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "data">("profile");

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

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ink-muted block mb-1">Height (cm)</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={175} />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Weight (kg)</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={72} />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Body Fat (%)</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={15} />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Age</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={20} />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Resting HR (bpm)</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={55} />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">VO2 Max</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={52} />
              </div>
              <div className="sm:col-span-2 flex justify-end mt-2">
                <Button>Save Profile</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "preferences" && (
        <Card>
          <CardHeader>
            <CardTitle>Training Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ink-muted block mb-1">Weekly Availability (hours)</label>
                <input type="number" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue={8} />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Recovery Capacity</label>
                <select className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue="medium">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Race Goal</label>
                <input type="text" className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue="Sub-1:40 Half Marathon" />
              </div>
              <div>
                <label className="text-xs text-ink-muted block mb-1">Race Distance</label>
                <select className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-ink text-sm" defaultValue="half">
                  <option value="5k">5K</option>
                  <option value="10k">10K</option>
                  <option value="half">Half Marathon</option>
                  <option value="marathon">Marathon</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end mt-2">
                <Button>Save Preferences</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "data" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-muted mb-4">Download all your training, nutrition, and health data as JSON.</p>
              <Button variant="secondary">Export All Data</Button>
            </CardContent>
          </Card>

          <Card className="border-red/20">
            <CardHeader>
              <CardTitle className="text-red">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ink-muted mb-4">Permanently delete all your data. This cannot be undone.</p>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-1" /> Delete All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
