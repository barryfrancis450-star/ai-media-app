import { Router } from "express";
import { getAuth } from "@clerk/express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { db } from "@workspace/db";
import { generatedImagesTable, usersTable } from "@workspace/db";
import { GenerateImageBody, DeleteGeneratedImageParams } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

export const imagesRouter = Router();

const FREE_DAILY_LIMIT = 5;

async function getUserAndUsage(userId: string) {
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

  return { user, todayCount: todayResult?.count ?? 0 };
}

imagesRouter.post("/openai/images/generate", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GenerateImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
    return;
  }

  const { user, todayCount } = await getUserAndUsage(userId);

  if (!user.isPro && todayCount >= FREE_DAILY_LIMIT) {
    res.status(429).json({
      error: "Daily limit reached",
      message: `Free users can generate ${FREE_DAILY_LIMIT} images per day. Upgrade to Pro for unlimited generations.`,
      todayCount,
      dailyLimit: FREE_DAILY_LIMIT,
    });
    return;
  }

  const { prompt, size = "1024x1024", style } = parsed.data;
  const fullPrompt = style ? `${prompt}, ${style}` : prompt;

  const validSizes = ["1024x1024", "1536x1024", "1024x1536"] as const;
  const imageSize = validSizes.includes(size as (typeof validSizes)[number])
    ? (size as (typeof validSizes)[number])
    : "1024x1024";

  const buffer = await generateImageBuffer(fullPrompt, imageSize);
  const b64Json = buffer.toString("base64");

  const [record] = await db
    .insert(generatedImagesTable)
    .values({ clerkUserId: userId, prompt: fullPrompt, size: imageSize, b64Json })
    .returning();

  res.json({
    id: record.id,
    prompt: record.prompt,
    b64_json: record.b64Json,
    size: record.size,
    createdAt: record.createdAt,
  });
});

imagesRouter.get("/openai/images", async (req, res) => {
  const { userId } = getAuth(req);

  const images = userId
    ? await db
        .select({
          id: generatedImagesTable.id,
          prompt: generatedImagesTable.prompt,
          size: generatedImagesTable.size,
          createdAt: generatedImagesTable.createdAt,
        })
        .from(generatedImagesTable)
        .where(eq(generatedImagesTable.clerkUserId, userId))
        .orderBy(generatedImagesTable.createdAt)
    : [];

  res.json(images.reverse());
});

imagesRouter.delete("/openai/images/:id", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = DeleteGeneratedImageParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db
    .delete(generatedImagesTable)
    .where(
      sql`id = ${parsed.data.id} AND clerk_user_id = ${userId}`,
    );
  res.json({ success: true });
});

imagesRouter.get("/openai/images/stats", async (req, res) => {
  const { userId } = getAuth(req);

  const whereClause = userId
    ? sql`clerk_user_id = ${userId}`
    : sql`1=1`;

  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generatedImagesTable)
    .where(whereClause);

  const todayResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generatedImagesTable)
    .where(
      userId
        ? sql`clerk_user_id = ${userId} AND date_trunc('day', created_at) = date_trunc('day', now())`
        : sql`date_trunc('day', created_at) = date_trunc('day', now())`,
    );

  const bySizeResult = await db
    .select({
      size: generatedImagesTable.size,
      count: sql<number>`count(*)::int`,
    })
    .from(generatedImagesTable)
    .where(whereClause)
    .groupBy(generatedImagesTable.size);

  const bySize: Record<string, number> = {};
  for (const row of bySizeResult) {
    bySize[row.size] = row.count;
  }

  res.json({
    total: totalResult[0]?.count ?? 0,
    today: todayResult[0]?.count ?? 0,
    bySize,
  });
});
