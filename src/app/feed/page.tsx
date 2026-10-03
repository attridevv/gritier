"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Activity, Dumbbell, Flame, Trophy, MoreHorizontal } from "lucide-react";

const mockPosts = [
  {
    id: 1,
    user: "Dev Attri",
    avatar: "D",
    time: "2h ago",
    type: "run",
    activity: "Easy Morning Run",
    distance: "5.2 km",
    duration: "28:14",
    pace: "5:26 /km",
    hr: 142,
    rpe: 4,
    likes: 12,
    comments: 3,
    text: "Felt great this morning. Cool weather, easy legs.",
  },
  {
    id: 2,
    user: "Shubham A.",
    avatar: "S",
    time: "4h ago",
    type: "strength",
    activity: "Bench PR",
    distance: null,
    duration: "45 min",
    pace: null,
    rpe: 9,
    likes: 28,
    comments: 7,
    text: "Finally hit 100kg on bench! 2x1x95 last week to 1x100 today. Progressive overload works.",
  },
  {
    id: 3,
    user: "Hans T.",
    avatar: "H",
    time: "6h ago",
    type: "run",
    activity: "Long Run",
    distance: "18.3 km",
    duration: "1:42:30",
    pace: "5:36 /km",
    hr: 148,
    rpe: 6,
    likes: 15,
    comments: 2,
    text: "Marathon build week 10. Long run feeling stronger each week. Race date can't come soon enough.",
  },
];

export default function FeedPage() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">Activity Feed</h1>
          <p className="text-sm text-ink-muted mt-1">What your network has been up to</p>
        </div>
      </div>

      {/* Compose */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-subtle flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
              G
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent border-none text-ink text-sm resize-none placeholder:text-ink-faint"
                placeholder="Share your training..."
                rows={2}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <div className="flex gap-2">
                  <button className="text-ink-faint hover:text-ink transition-colors text-xs flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Attach Run
                  </button>
                  <button className="text-ink-faint hover:text-ink transition-colors text-xs flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5" /> Attach Workout
                  </button>
                </div>
                <Button size="sm">Post</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {mockPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center text-ink font-bold text-sm flex-shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{post.user}</span>
                    <span className="text-xs text-ink-faint">{post.time}</span>
                  </div>
                  {post.text && <p className="text-sm text-ink-muted mt-1">{post.text}</p>}

                  {/* Activity Card */}
                  <div className="mt-3 p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      {post.type === "run" ? (
                        <Activity className="w-4 h-4 text-blue" />
                      ) : (
                        <Dumbbell className="w-4 h-4 text-amber" />
                      )}
                      <span className="text-sm font-medium text-ink">{post.activity}</span>
                      <Badge variant={post.rpe > 6 ? "red" : post.rpe > 4 ? "amber" : "green"}>
                        RPE {post.rpe}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {post.distance && (
                        <div>
                          <p className="text-ink-faint">Distance</p>
                          <p className="text-ink font-mono">{post.distance}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-ink-faint">Duration</p>
                        <p className="text-ink font-mono">{post.duration}</p>
                      </div>
                      {post.pace && (
                        <div>
                          <p className="text-ink-faint">Pace</p>
                          <p className="text-ink font-mono">{post.pace}</p>
                        </div>
                      )}
                      {post.hr && (
                        <div>
                          <p className="text-ink-faint">Avg HR</p>
                          <p className="text-ink font-mono">{post.hr} bpm</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        likedPosts.has(post.id) ? "text-red" : "text-ink-muted hover:text-red"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
