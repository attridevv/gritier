import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok, serverError, unauthorized } from "@/lib/api";
import { checkInSchema } from "@/lib/validation";
import { calcReadiness } from "@/lib/engines";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 90), 365);
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: limit,
    });
    return ok({ checkIns });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/checkin", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const parsed = checkInSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const dateOnly = new Date(new Date().toDateString());

    const [profile, lastLoad] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.trainingLoad.findFirst({
        where: { userId: user.id },
        orderBy: { date: "desc" },
      }),
    ]);

    const readiness = calcReadiness(data, lastLoad?.load ?? undefined, profile?.restingHR ?? undefined);

    const checkIn = await prisma.checkIn.upsert({
      where: { userId_date: { userId: user.id, date: dateOnly } },
      update: { ...data, habits: data.habits as any },
      create: { userId: user.id, ...data, date: dateOnly, habits: data.habits as any },
    });

    const score = await prisma.readinessScore.upsert({
      where: { userId_date: { userId: user.id, date: dateOnly } },
      update: {
        overall: readiness.overall,
        sleepScore: readiness.sleepScore,
        hrRecoveryScore: readiness.hrRecoveryScore,
        energyScore: readiness.energyScore,
        sorenessScore: readiness.sorenessScore,
        painPenalty: readiness.painPenalty,
        trainingRecovery: readiness.trainingRecovery,
        zone: readiness.zone,
        insights: readiness.insights as any,
      },
      create: {
        userId: user.id,
        date: dateOnly,
        overall: readiness.overall,
        sleepScore: readiness.sleepScore,
        hrRecoveryScore: readiness.hrRecoveryScore,
        energyScore: readiness.energyScore,
        sorenessScore: readiness.sorenessScore,
        painPenalty: readiness.painPenalty,
        trainingRecovery: readiness.trainingRecovery,
        zone: readiness.zone,
        insights: readiness.insights as any,
      },
    });

    return ok({ checkIn, score }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/checkin", err);
    return serverError();
  }
}
