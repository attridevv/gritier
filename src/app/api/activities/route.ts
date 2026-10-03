import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok, serverError, unauthorized } from "@/lib/api";
import { activitySchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);

    const activities = await prisma.activity.findMany({
      where: { userId: user.id, ...(type ? { type } : {}) },
      include: { exercises: true },
      orderBy: { date: "desc" },
      take: limit,
    });

    return ok({ activities });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/activities", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const parsed = activitySchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const durationMinutes = data.duration / 60;
    const trainingLoad = data.rpe ? Math.round(durationMinutes * data.rpe) : null;
    const pace = data.distance && data.distance > 0 ? data.duration / 60 / data.distance : null;

    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        type: data.type,
        name: data.name,
        date: new Date(data.date),
        duration: data.duration,
        rpe: data.rpe,
        distance: data.distance,
        elevation: data.elevation,
        calories: data.calories,
        avgHr: data.avgHr,
        maxHr: data.maxHr,
        cadence: data.cadence,
        notes: data.notes,
        weather: data.weather as any,
        terrain: data.terrain,
        isPublic: data.isPublic ?? false,
        trainingLoad,
        pace,
        exercises: data.exercises?.length
          ? {
              create: data.exercises.map((ex) => {
                const estimated1RM =
                  ex.weight && ex.reps ? ex.weight * (1 + ex.reps / 30) : null;
                const volumeLoad =
                  ex.weight && ex.sets && ex.reps ? ex.weight * ex.sets * ex.reps : null;
                return {
                  name: ex.name,
                  category: ex.category,
                  weight: ex.weight,
                  sets: ex.sets,
                  reps: ex.reps,
                  rpe: ex.rpe,
                  tempo: ex.tempo,
                  rest: ex.rest,
                  estimated1RM,
                  volumeLoad,
                  painNotes: ex.painNotes,
                  fatigueNotes: ex.fatigueNotes,
                };
              }),
            }
          : undefined,
      },
      include: { exercises: true },
    });

    if (trainingLoad) {
      const dateOnly = new Date(new Date(data.date).toDateString());
      await prisma.trainingLoad.upsert({
        where: {
          userId_date_type: {
            userId: user.id,
            date: dateOnly,
            type: data.type === "run" ? "endurance" : data.type === "strength" ? "strength" : "mixed",
          },
        },
        update: { sessionRPE: data.rpe, duration: Math.round(durationMinutes), load: trainingLoad },
        create: {
          userId: user.id,
          date: dateOnly,
          sessionRPE: data.rpe,
          duration: Math.round(durationMinutes),
          load: trainingLoad,
          type: data.type === "run" ? "endurance" : data.type === "strength" ? "strength" : "mixed",
        },
      });
    }

    if (data.isPublic) {
      await prisma.socialPost.create({
        data: { userId: user.id, activityId: activity.id, visibility: "public" },
      });
    }

    return ok({ activity }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/activities", err);
    return serverError();
  }
}
