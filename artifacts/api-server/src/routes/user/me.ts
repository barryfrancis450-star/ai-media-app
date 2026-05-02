import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable, generatedImagesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export const userRouter = Router();

const FREE_DAILY_LIMIT = 5;

userRouter.get("/user/me", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const existingUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, userId));

  let user = existingUsers[0];
  if (!user) {
    const [created] = await db
      .insert(usersTable)
      .values({ clerkUserId: userId, isPro: false })
      .returning();
    user = created;
  }

  const [todayResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generatedImagesTable)
    .where(
      sql`clerk_user_id = ${userId} AND date_trunc('day', created_at) = date_trunc('day', now())`,
    );

  const todayCount = todayResult?.count ?? 0;
  const isPro = user.isPro;
  const dailyLimit = isPro ? -1 : FREE_DAILY_LIMIT;
  const remainingToday = isPro ? -1 : Math.max(0, FREE_DAILY_LIMIT - todayCount);

  res.json({
    clerkUserId: userId,
    isPro,
    todayCount,
    dailyLimit,
    remainingToday,
  });
});
