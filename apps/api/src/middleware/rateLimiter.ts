import { Request, Response, NextFunction } from "express";
import { redis } from "../lib/redis";

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const ip = req.ip || "unknown";
  const key = `rate:${ip}`;
  const LIMIT = 100;
  const WINDOW = 60;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, WINDOW);
  }

  if (current > LIMIT) {
    res
      .status(429)
      .json({ error: "Too many requests. Try again in a minute." });
    return;
  }
  next();
}
