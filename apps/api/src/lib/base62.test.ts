import { describe, it, expect } from "vitest";
import { generateSlug, isValidSlug } from "./base62";

describe("genereateSlug", () => {
  it("generate correct length", () => {
    expect(generateSlug(7)).toHaveLength(7);
  });

  it("only contains base62 characters", () => {
    const slug = generateSlug(7);
    expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("generates unique slugs", () => {
    const slugs = new Set(Array.from({ length: 100 }, () => generateSlug()));
    expect(slugs.size).toBeGreaterThan(95);
  });
});

describe("isValidSlug", () => {
  it("accepts valid slug", () => {
    expect(isValidSlug("my-link")).toBe(true);
    expect(isValidSlug("abc123")).toBe(true);
  });

  it("rejects slug that is too short", () => {
    expect(isValidSlug("ab")).toBe(false);
  });

  it("rejects special characters", () => {
    expect(isValidSlug("my link!")).toBe(false);
  });
});
