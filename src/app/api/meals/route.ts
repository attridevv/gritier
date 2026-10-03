import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok, serverError, unauthorized } from "@/lib/api";
import { mealSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const days = Math.min(Number(searchParams.get("days") ?? 7), 90);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [meals, targets, logs] = await Promise.all([
      prisma.meal.findMany({
        where: { userId: user.id, date: { gte: since } },
        orderBy: { date: "desc" },
      }),
      prisma.nutritionTarget.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.nutritionLog.findMany({
        where: { userId: user.id, date: { gte: since } },
        orderBy: { date: "asc" },
      }),
    ]);

    return ok({ meals, targets, logs });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/meals", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const parsed = mealSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const meal = await prisma.meal.create({
      data: {
        userId: user.id,
        name: data.name,
        date: new Date(data.date),
        mealType: data.mealType,
        foods: data.foods as any,
        totalCalories: data.totalCalories,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFat: data.totalFat,
        totalFiber: data.totalFiber,
        notes: data.notes,
      },
    });

    // Roll up into the daily nutrition log
    const dateOnly = new Date(new Date(data.date).toDateString());
    const dayMeals = await prisma.meal.findMany({
      where: {
        userId: user.id,
        date: { gte: dateOnly, lt: new Date(dateOnly.getTime() + 86400000) },
      },
    });
    const totals = dayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.totalCalories,
        protein: acc.protein + m.totalProtein,
        carbs: acc.carbs + m.totalCarbs,
        fat: acc.fat + m.totalFat,
        fiber: acc.fiber + (m.totalFiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const target = await prisma.nutritionTarget.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    await prisma.nutritionLog.upsert({
      where: { userId_date: { userId: user.id, date: dateOnly } },
      update: {
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        fiber: totals.fiber,
      },
      create: {
        userId: user.id,
        date: dateOnly,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fat: totals.fat,
        fiber: totals.fiber,
        calorieTarget: target?.calories ?? 2400,
        proteinTarget: target?.protein ?? 160,
        carbsTarget: target?.carbs ?? 280,
        fatTarget: target?.fat ?? 70,
      },
    });

    return ok({ meal }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/meals", err);
    return serverError();
  }
}
