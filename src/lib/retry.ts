import { prisma } from "./db";

const MAX_RETRIES = 5;
const BASE_DELAY = 2000;

export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (err?.code === "ECONNREFUSED" || err?.code === "57P03" || err?.message?.includes("password")) {
        await new Promise((r) => setTimeout(r, BASE_DELAY * Math.pow(2, i)));
        continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error("Database connection failed after retries");
}
