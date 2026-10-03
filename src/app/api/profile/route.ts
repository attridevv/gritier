import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok, serverError, unauthorized } from "@/lib/api";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireCurrentDbUser();
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return ok({ profile, user: { email: user.email, name: user.name, image: user.image } });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/profile", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const { raceDate, prs, strengthPriorities, endurancePriorities, preferredSplit, equipmentAccess, allergies, ...rest } =
      parsed.data;

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        ...rest,
        raceDate: raceDate ? new Date(raceDate) : undefined,
        prs: prs as any,
        strengthPriorities: strengthPriorities as any,
        endurancePriorities: endurancePriorities as any,
        preferredSplit: preferredSplit as any,
        equipmentAccess: equipmentAccess as any,
        allergies: allergies as any,
      },
      create: {
        userId: user.id,
        ...rest,
        raceDate: raceDate ? new Date(raceDate) : undefined,
        prs: prs as any,
        strengthPriorities: strengthPriorities as any,
        endurancePriorities: endurancePriorities as any,
        preferredSplit: preferredSplit as any,
        equipmentAccess: equipmentAccess as any,
        allergies: allergies as any,
      },
    });

    return ok({ profile });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/profile", err);
    return serverError();
  }
}
