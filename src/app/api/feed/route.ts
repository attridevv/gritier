import { requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fail, ok, serverError, unauthorized } from "@/lib/api";
import { socialPostSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireCurrentDbUser();

    const posts = await prisma.socialPost.findMany({
      where: {
        OR: [{ visibility: "public" }, { userId: user.id }],
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        activity: { include: { exercises: true } },
        comments: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "asc" },
          take: 20,
        },
        reactions: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const enriched = posts.map((p) => ({
      ...p,
      likedByMe: p.reactions.some((r) => r.userId === user.id),
    }));

    return ok({ posts: enriched });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("GET /api/feed", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const parsed = socialPostSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");

    const post = await prisma.socialPost.create({
      data: {
        userId: user.id,
        text: parsed.data.text,
        activityId: parsed.data.activityId,
        images: parsed.data.images as any,
        visibility: parsed.data.visibility,
        tags: parsed.data.tags as any,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        activity: true,
        comments: true,
        reactions: true,
      },
    });

    return ok({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("POST /api/feed", err);
    return serverError();
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireCurrentDbUser();
    const body = await req.json();
    const { action, postId, text } = body;
    if (!postId) return fail("postId is required");

    if (action === "like") {
      const existing = await prisma.socialReaction.findUnique({
        where: { postId_userId_type: { postId, userId: user.id, type: "like" } },
      });

      if (existing) {
        await prisma.socialReaction.delete({ where: { id: existing.id } });
        await prisma.socialPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
        return ok({ liked: false });
      }

      await prisma.socialReaction.create({
        data: { postId, userId: user.id, type: "like" },
      });
      await prisma.socialPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      return ok({ liked: true });
    }

    if (action === "comment") {
      if (!text) return fail("text is required");
      const comment = await prisma.socialComment.create({
        data: { postId, userId: user.id, text },
        include: { user: { select: { id: true, name: true, image: true } } },
      });
      await prisma.socialPost.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      });
      return ok({ comment }, { status: 201 });
    }

    return fail("Unknown action");
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") return unauthorized();
    console.error("PATCH /api/feed", err);
    return serverError();
  }
}
