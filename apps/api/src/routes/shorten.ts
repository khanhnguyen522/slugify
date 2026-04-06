import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { generateSlug, isValidSlug } from "../lib/base62";

const router = Router();

router.post("/shorten", async (req: Request, res: Response) => {
  const { originalUrl, customSlug, expiresAt } = req.body;

  if (!originalUrl) {
    res.status(400).json({ error: "OriginalUrl is required" });
    return;
  }

  try {
    new URL(originalUrl);
  } catch {
    res.status(400).json({ error: "Invalid URL format" });
    return;
  }

  if (customSlug && !isValidSlug(customSlug)) {
    res.status(400).json({
      error: "Slug only allows letters, numbers, - and _. Length 3-50 chars.",
    });
    return;
  }

  let slug = customSlug || generateSlug();

  if (!customSlug) {
    let exists = await prisma.url.findUnique({ where: { slug } });
    while (exists) {
      slug = generateSlug();
      exists = await prisma.url.findUnique({ where: { slug } });
    }
  } else {
    const exists = await prisma.url.findUnique({ where: { slug } });
    if (exists) {
      res.status(409).json({ error: "This slug is already taken" });
      return;
    }
  }

  const url = await prisma.url.create({
    data: {
      slug,
      originalUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  const baseUrl = process.env.BASE_URL || "http://localhost:3001";

  res.status(201).json({
    slug: url.slug,
    shortUrl: `${baseUrl}/${url.slug}`,
    originalUrl: url.originalUrl,
    expiresAt: url.expiresAt,
    createdAt: url.createdAt,
  });
});

export default router;
