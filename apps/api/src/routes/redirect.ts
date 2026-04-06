import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

const router = Router();
const CACHE_TTL = 3600;

router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;

  const cached = await redis.get(`url:${slug}`);

  if (cached) {
    res.redirect(302, cached);
    return;
  }

  const url = await prisma.url.findUnique({
    where: { slug },
  });

  if (!url) {
    res.status(404).json({ error: "Link not found." });
    return;
  }

  if (url.expiresAt && url.expiresAt < new Date()) {
    res.status(410).json({ error: "This link has expired." });
    return;
  }

  await redis.setex(`url:${slug}`, CACHE_TTL, url.originalUrl);

  res.redirect(302, url.originalUrl);
});

export default router;
