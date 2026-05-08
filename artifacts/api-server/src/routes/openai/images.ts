import { Router } from "express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { db } from "@workspace/db";
import { generatedImagesTable } from "@workspace/db";
import { GenerateImageBody, DeleteGeneratedImageParams } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

export const imagesRouter = Router();

imagesRouter.post("/openai/images/generate", async (req, res) => {
  const parsed = GenerateImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
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
    .values({ prompt: fullPrompt, size: imageSize, b64Json })
    .returning();

  res.json({
    id: record.id,
    prompt: record.prompt,
    b64_json: record.b64Json,
    size: record.size,
    createdAt: record.createdAt,
  });
});

imagesRouter.get("/openai/images", async (_req, res) => {
  const images = await db
    .select({
      id: generatedImagesTable.id,
      prompt: generatedImagesTable.prompt,
      size: generatedImagesTable.size,
      createdAt: generatedImagesTable.createdAt,
    })
    .from(generatedImagesTable)
    .orderBy(generatedImagesTable.createdAt);

  res.json(images.reverse());
});

imagesRouter.delete("/openai/images/:id", async (req, res) => {
  const parsed = DeleteGeneratedImageParams.safeParse({ id: req.params.id });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(generatedImagesTable).where(eq(generatedImagesTable.id, parsed.data.id));
  res.json({ success: true });
});

imagesRouter.get("/openai/images/stats", async (_req, res) => {
  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generatedImagesTable);

  const todayResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generatedImagesTable)
    .where(sql`date_trunc('day', created_at) = date_trunc('day', now())`);

  const bySizeResult = await db
    .select({
      size: generatedImagesTable.size,
      count: sql<number>`count(*)::int`,
    })
    .from(generatedImagesTable)
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
