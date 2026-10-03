import { prisma } from "./db";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentDbUser() {
  const { userId, sessionClaims } = await auth();

  if (!userId) return null;

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: (sessionClaims?.email as string) ?? "",
        name: (sessionClaims?.name as string) ?? null,
        image: (sessionClaims?.image as string) ?? null,
      },
      include: { profile: true },
    });
  } else {
    const clerkMeta = await auth();
    if (
      (clerkMeta.sessionClaims?.name && user.name !== clerkMeta.sessionClaims?.name) ||
      (clerkMeta.sessionClaims?.image && user.image !== clerkMeta.sessionClaims?.image)
    ) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: (clerkMeta.sessionClaims?.name as string) ?? user.name,
          image: (clerkMeta.sessionClaims?.image as string) ?? user.image,
        },
      });
    }
  }

  return user;
}

export async function requireCurrentDbUser() {
  const user = await getCurrentDbUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
