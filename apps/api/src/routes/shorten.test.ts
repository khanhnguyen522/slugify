import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.url.deleteMany({
    where: { originalUrl: "https://google.com" },
  });
  await prisma.$disconnect();
  await redis.quit();
});

describe("POST /api/shorten", () => {
  it("creates a short url successfully", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "https://google.com" });

    expect(res.status).toBe(201);
    expect(res.body.slug).toBeDefined();
    expect(res.body.shortUrl).toContain(res.body.slug);
    expect(res.body.originalUrl).toBe("https://google.com");
  });

  it("rejects missing originalUrl", async () => {
    const res = await request(app).post("/api/shorten").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("rejects invalid url format", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "not-a-url" });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate custom slug", async () => {
    await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "https://google.com", customSlug: "test-slug" });

    const res = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "https://google.com", customSlug: "test-slug" });

    expect(res.status).toBe(409);
  });
});

describe("GET /:slug", () => {
  it("redirects to original url", async () => {
    const createRes = await request(app)
      .post("/api/shorten")
      .send({ originalUrl: "https://google.com" });

    const { slug } = createRes.body;

    const res = await request(app).get(`/${slug}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://google.com");
  });

  it("returns 404 for unknown slug", async () => {
    const res = await request(app).get("/slug-that-does-not-exist");

    expect(res.status).toBe(404);
  });
});
