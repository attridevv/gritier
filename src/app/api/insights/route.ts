import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ok, serverError, unauthorized } from "@/lib/api";
import { calcInjuryRisk, calcTrainingLoad } from "@/lib/engines";

export async function GET() {
  try {
    const user = await requireCurrentDbUser();
    const insights = await prisma.aIInsight.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return ok({ insights });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/insights", err);
    return serverError();
  }
}

export async function POST() {
  try {
    const user = await requireCurrentDbUser();

    const [profile, checkIns, activities, injuries, readiness, loads, planDays] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.checkIn.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 14 }),
      prisma.activity.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 }),
      prisma.injury.findMany({ where: { userId: user.id, status: { not: "recovered" } } }),
      prisma.readinessScore.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 14 }),
      prisma.trainingLoad.findMany({ where: { userId: user.id }, orderBy: { date: "asc" }, take: 60 }),
      prisma.planDay.findMany({
        where: { userId: user.id, date: { lte: new Date() } },
        orderBy: { date: "desc" },
        take: 14,
      }),
    ]);

    const loadResult = calcTrainingLoad(
      loads.map((l) => ({ date: l.date, load: l.load ?? 0 }))
    );

    const painAverages: Record<string, number> = {};
    for (const c of checkIns) {
      painAverages.groin = (painAverages.groin ?? 0) + c.groinPain;
      painAverages.lowerBack = (painAverages.lowerBack ?? 0) + c.lowerBackPain;
      painAverages.shoulder = (painAverages.shoulder ?? 0) + c.shoulderPain;
      painAverages.knee = (painAverages.knee ?? 0) + c.kneePain;
      painAverages.hamstring = (painAverages.hamstring ?? 0) + c.hamstringTightness;
    }
    const n = checkIns.length || 1;
    for (const k of Object.keys(painAverages)) painAverages[k] = painAverages[k] / n;

    const mobilityCompliance =
      checkIns.length > 0
        ? (checkIns.filter((c) => c.mobilityCompleted).length / checkIns.length) * 100
        : 100;
    const avgRPE = activities.filter((a) => a.rpe).reduce((s, a) => s + (a.rpe ?? 0), 0) /
      (activities.filter((a) => a.rpe).length || 1);

    const injuryRisk = calcInjuryRisk(
      painAverages,
      mobilityCompliance,
      avgRPE,
      loadResult.acwr,
      injuries.map((i) => i.location)
    );

    const latestReadiness = readiness[0]?.overall ?? null;
    const avgReadiness =
      readiness.length > 0
        ? Math.round(readiness.reduce((s, r) => s + r.overall, 0) / readiness.length)
        : null;
    const weekRuns = activities.filter(
      (a) => a.type === "run" && a.date >= new Date(Date.now() - 7 * 86400000)
    );
    const weekDistance = Math.round(weekRuns.reduce((s, a) => s + (a.distance ?? 0), 0) * 10) / 10;
    const compliance =
      planDays.length > 0
        ? Math.round((planDays.filter((d) => d.completed).length / planDays.length) * 100)
        : 100;

    const metadata = {
      readiness: latestReadiness,
      avgReadiness,
      acwr: loadResult.acwr,
      injuryRisk: injuryRisk.level,
      weeklyDistance: weekDistance,
      compliance,
    };

    const recommendations: string[] = [];
    if (loadResult.acwr > 1.5) recommendations.push("Reduce training load this week — ACWR is elevated");
    else if (loadResult.acwr < 0.8) recommendations.push("You can safely add volume — training load is low");
    else recommendations.push("Training load is in the optimal range — maintain this progression");
    if (latestReadiness !== null && latestReadiness < 60) recommendations.push("Prioritize recovery: sleep and mobility");
    if (injuryRisk.level === "moderate" || injuryRisk.level === "high")
      recommendations.push("Address pain signals with mobility and load management");
    if (compliance < 70) recommendations.push("Improve plan adherence — reduce weekly volume to rebuild consistency");

    let content: string;
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are an elite hybrid athlete coach. Analyze this athlete's data and write a concise weekly coaching report (3 short paragraphs) followed by 3 bullet recommendations.
Data: ${JSON.stringify({ profile: { raceGoal: profile?.raceGoal, vo2Max: profile?.vo2Max }, latestReadiness, avgReadiness, ...loadResult, injuryRisk: injuryRisk.level, weeklyDistance: weekDistance, compliance, painAverages })}`;
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });
        const json = await res.json();
        content = json?.choices?.[0]?.message?.content ?? "";
      } catch {
        content = "";
      }
    } else {
      content = "";
    }

    if (!content) {
      content = [
        `Your latest readiness is ${latestReadiness ?? "—"}${avgReadiness ? ` (14-day average ${avgReadiness})` : ""}. ${
          latestReadiness !== null && latestReadiness >= 80
            ? "You are primed to train hard — take advantage of this window."
            : latestReadiness !== null && latestReadiness >= 60
              ? "You are in a moderate state — maintain volume and manage intensity."
              : "Recovery is the priority right now — back off intensity and focus on sleep."
        }`,
        `Training load sits at an ACWR of ${loadResult.acwr} (${loadResult.status}). Acute load ${loadResult.acuteLoad}, chronic load ${loadResult.chronicLoad}. This week you covered ${weekDistance} km across ${weekRuns.length} runs.`,
        `Plan compliance is ${compliance}%. Injury risk is ${injuryRisk.level}. ${
          injuryRisk.level === "low"
            ? "No red flags detected — keep building."
            : "Some risk indicators are present — monitor pain and prioritize mobility."
        }`,
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    const insight = await prisma.aIInsight.create({
      data: {
        userId: user.id,
        type: "weekly",
        content,
        metadata: metadata as any,
        categories: ["training", "recovery", "nutrition"] as any,
        recommendations: recommendations as any,
      },
    });

    return ok({ insight }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/insights", err);
    return serverError();
  }
}
