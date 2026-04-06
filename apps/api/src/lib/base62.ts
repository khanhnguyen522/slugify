const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateSlug(length = 7): string {
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return slug;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-_]{3,50}$/.test(slug);
}
