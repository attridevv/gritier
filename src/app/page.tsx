import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Activity,
  Dumbbell,
  Target,
  BarChart3,
  Zap,
  ArrowRight,
  Check,
  Shield,
  TrendingUp,
  Heart,
} from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-gradient">GRIT</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-accent text-background px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-mono mb-6">
            <Zap className="w-3 h-3" />
            Train like Runna. Track like Strava. Coach like MacroFactor.
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-bold text-ink leading-tight">
            One OS for
            <br />
            <span className="text-gradient">every rep, every mile.</span>
          </h1>
          <p className="mt-6 text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
            Adaptive training plans. Precision nutrition coaching. Social accountability.
            <br />
            All fused into a single dashboard that actually works.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="bg-accent text-background px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-accent-hover transition-all flex items-center gap-2 glow-accent"
            >
              Start Training <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="text-ink-muted hover:text-ink transition-colors text-sm flex items-center gap-1"
            >
              See features <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-ink">Everything you need.</h2>
            <p className="text-ink-muted mt-2">No more app-hopping. No more data silos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                title: "Adaptive Training Plans",
                desc: "Runna-style plans that adjust to your readiness, ACWR, and real-world performance. 5K to ultra.",
                color: "text-accent",
                bg: "bg-accent-subtle",
              },
              {
                icon: Activity,
                title: "Activity Logging",
                desc: "Log runs, lifts, cycles, swims. Auto-calculated training load, pace, efficiency metrics.",
                color: "text-blue",
                bg: "bg-blue-subtle",
              },
              {
                icon: Dumbbell,
                title: "Strength Tracking",
                desc: "Exercise-level detail: sets, reps, RPE, tempo. Auto 1RM estimates and volume load.",
                color: "text-amber",
                bg: "bg-amber-subtle",
              },
              {
                icon: Heart,
                title: "Nutrition Coaching",
                desc: "MacroFactor-style adaptive coaching. TDEE estimation, weekly macro adjustments, meal logging.",
                color: "text-green",
                bg: "bg-green-subtle",
              },
              {
                icon: BarChart3,
                title: "Readiness & Analytics",
                desc: "Daily readiness scores, ACWR tracking, injury risk, race predictions, trend analysis.",
                color: "text-red",
                bg: "bg-red-subtle",
              },
              {
                icon: Shield,
                title: "Social & Accountability",
                desc: "Strava-style feed, kudos, comments. Streaks, achievements, public profiles.",
                color: "text-accent",
                bg: "bg-accent-subtle",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-surface rounded-xl border border-border p-6 hover:border-accent/30 transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-ink">How it works</h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Check in every morning",
                desc: "Log sleep, energy, pain, mood. GRIT calculates your readiness score.",
              },
              {
                step: "02",
                title: "Follow your adaptive plan",
                desc: "Your plan adjusts based on readiness, training load, and progress. No guesswork.",
              },
              {
                step: "03",
                title: "Log everything",
                desc: "Runs, workouts, meals, weight. All in one place, all connected.",
              },
              {
                step: "04",
                title: "Get smarter over time",
                desc: "AI insights, trend analysis, and coaching recommendations that actually help.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-subtle border border-accent/20 flex items-center justify-center">
                  <span className="text-accent font-display font-bold text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ink mb-1">{item.title}</h3>
                  <p className="text-sm text-ink-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Social Proof */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "13", label: "Data Models" },
              { value: "5", label: "Analytics Engines" },
              { value: "∞", label: "Training Plans" },
              { value: "1", label: "Platform" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-display font-bold text-gradient">{stat.value}</p>
                <p className="text-sm text-ink-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center bg-surface rounded-2xl border border-border p-12">
          <h2 className="text-3xl font-display font-bold text-ink mb-3">
            Your data deserves a better home.
          </h2>
          <p className="text-ink-muted mb-8">
            Stop juggling Strava, MyFitnessPal, and a training plan spreadsheet.
            <br />
            GRIT is the OS your training has been missing.
          </p>
          <Link
            href="/sign-up"
            className="bg-accent text-background px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-accent-hover transition-all inline-flex items-center gap-2"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-faint">
            GRIT — Built by{" "}
            <a href="https://attridevv.com" className="text-ink-muted hover:text-accent transition-colors">
              Dev Attri
            </a>
          </p>
          <div className="flex items-center gap-6 text-xs text-ink-faint">
            <span>Next.js 16</span>
            <span>Prisma 7</span>
            <span>Supabase</span>
            <span>Clerk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
