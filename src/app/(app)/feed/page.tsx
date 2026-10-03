"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Activity, Dumbbell, Loader2 } from "lucide-react";

type Post = {
  id: string;
  text: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  user: { id: string; name: string | null; image: string | null };
  activity: {
    id: string;
    type: string;
    name: string;
    distance: number | null;
    duration: number;
    pace: number | null;
    avgHr: number | null;
    rpe: number | null;
    exercises: { id: string; name: string }[];
  } | null;
  comments: { id: string; text: string; createdAt: string; user: { name: string | null } }[];
};

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
}

function fmtPace(p: number | null) {
  if (!p) return null;
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/feed");
      if (res.ok) {
        const json = await res.json();
        setPosts(json.posts);
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

  const submitPost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, visibility: "public" }),
      });
      if (res.ok) {
        setText("");
        load();
      }
    } finally {
      setPosting(false);
    }
  };

  const like = async (post: Post) => {
    setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) } : p)));
    await fetch("/api/feed", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", postId: post.id }),
    });
  };

  const comment = async (postId: string) => {
    const t = commentText[postId];
    if (!t?.trim()) return;
    const res = await fetch("/api/feed", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", postId, text: t }),
    });
    if (res.ok) {
      setCommentText((c) => ({ ...c, [postId]: "" }));
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Activity Feed</h1>
        <p className="text-sm text-ink-muted mt-1">Your training, shared</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-accent-subtle flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
              {(posts[0]?.user.name ?? "G").charAt(0)}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent border-none text-ink text-sm resize-none placeholder:text-ink-faint focus:outline-none"
                placeholder="Share your training..."
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="flex items-center justify-end mt-2 pt-2 border-t border-border">
                <Button size="sm" onClick={submitPost} disabled={posting || !text.trim()}>
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="h-48 bg-surface rounded-xl border border-border animate-pulse" />
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="w-8 h-8 text-ink-faint mx-auto mb-3" />
            <p className="text-ink font-medium">Nothing here yet</p>
            <p className="text-sm text-ink-muted mt-1">Log a public activity or write a post to start your feed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center text-ink font-bold text-sm flex-shrink-0">
                    {(post.user.name ?? "A").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{post.user.name ?? "Athlete"}</span>
                      <span className="text-xs text-ink-faint">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric" })}
                      </span>
                    </div>
                    {post.text && <p className="text-sm text-ink-muted mt-1">{post.text}</p>}

                    {post.activity && (
                      <div className="mt-3 p-3 rounded-lg bg-surface-elevated border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          {post.activity.type === "run" ? (
                            <Activity className="w-4 h-4 text-blue" />
                          ) : (
                            <Dumbbell className="w-4 h-4 text-amber" />
                          )}
                          <span className="text-sm font-medium text-ink">{post.activity.name}</span>
                          {post.activity.rpe && (
                            <Badge variant={post.activity.rpe > 6 ? "red" : post.activity.rpe > 4 ? "amber" : "green"}>
                              RPE {post.activity.rpe}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {post.activity.distance != null && (
                            <Stat label="Distance" value={`${post.activity.distance.toFixed(2)} km`} />
                          )}
                          <Stat label="Duration" value={fmtDuration(post.activity.duration)} />
                          {fmtPace(post.activity.pace) && <Stat label="Pace" value={fmtPace(post.activity.pace)!} />}
                          {post.activity.avgHr && <Stat label="Avg HR" value={`${post.activity.avgHr} bpm`} />}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => like(post)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${post.likedByMe ? "text-red" : "text-ink-muted hover:text-red"}`}
                      >
                        <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-current" : ""}`} />
                        {post.likesCount}
                      </button>
                      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <MessageSquare className="w-4 h-4" />
                        {post.commentsCount}
                      </span>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="mt-3 space-y-2 pl-2 border-l border-border">
                        {post.comments.map((c) => (
                          <p key={c.id} className="text-xs text-ink-muted">
                            <span className="text-ink font-medium">{c.user.name ?? "Athlete"}</span> {c.text}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <input
                        className="input flex-1"
                        placeholder="Add a comment..."
                        value={commentText[post.id] ?? ""}
                        onChange={(e) => setCommentText((c) => ({ ...c, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && comment(post.id)}
                      />
                      <Button size="sm" variant="secondary" onClick={() => comment(post.id)}>
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink-faint">{label}</p>
      <p className="text-ink font-mono">{value}</p>
    </div>
  );
}
