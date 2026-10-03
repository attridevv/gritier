import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok, serverError, unauthorized } from "@/lib/api";
import { planSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM

    const plan = await prisma.trainingPlan.findFirst({
      where: { userId: user.id, status: { in: ["active", "paused"] } },
      orderBy: { createdAt: "desc" },
      include: {
        days: {
          where: month
            ? {
                date: {
                  gte: new Date(`${month}-01T00:00:00.000Z`),
                  lt: new Date(new Date(`${month}-01T00:00:00.000Z`).setMonth(new Date(`${month}-01T00:00:00.000Z`).getMonth() + 1)),
                },
              }
            : undefined,
          orderBy: { date: "asc" },
        },
      },
    });

    return ok({ plan });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/plan", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const d = parsed.data;
    const plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: d.name,
        type: d.type,
        phase: d.phase,
        distance: d.distance,
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        raceDate: d.raceDate ? new Date(d.raceDate) : undefined,
        totalWeeks: d.totalWeeks,
        weeksPerMesocycle: d.weeksPerMesocycle,
        isAdaptive: d.isAdaptive ?? true,
        autoProgress: d.autoProgress ?? true,
        baselineFitness: d.baselineFitness as any,
        preferredPaces: d.preferredPaces as any,
      },
    });

    return ok({ plan }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/plan", err);
    return serverError();
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const { planDayId, completed, actualDistance, actualDuration, actualRPE, feel, skipReason } = body;
    if (!planDayId) return fail("planDayId is required");

    const existing = await prisma.planDay.findFirst({
      where: { id: planDayId, userId: user.id },
    });
    if (!existing) return fail("Plan day not found", 404);

    const planDay = await prisma.planDay.update({
      where: { id: planDayId },
      data: {
        completed: completed ?? existing.completed,
        completedAt: completed ? new Date() : null,
        actualDistance,
        actualDuration,
        actualRPE,
        feel,
        skipReason,
      },
    });

    return ok({ planDay });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("PATCH /api/plan", err);
    return serverError();
  }
}
