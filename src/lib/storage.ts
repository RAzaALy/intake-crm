import type { z } from "zod";

// Bump the version when the stored shape changes, so old data is ignored instead of crashing.
export const DATABASE_KEY = "intake-crm:v1";
export const SIMULATE_FAILURE_KEY = "intake-crm:simulate-failure";

/**
 * Reads and validates a JSON value. Returns null when the key is empty, the JSON is broken,
 * or the value no longer matches the schema.
 * Only call this from query functions, mutations or effects: localStorage does not exist on the server.
 */
export function readItem<Schema extends z.ZodType>(
  key: string,
  schema: Schema,
): z.infer<Schema> | null {
  const raw = window.localStorage.getItem(key);
  if (raw === null) return null;

  try {
    const result = schema.safeParse(JSON.parse(raw));
    if (result.success) return result.data;
    // Warn, because the caller may replace unreadable data (the repository reseeds).
    console.warn(`Stored "${key}" does not match the expected shape and was ignored.`);
    return null;
  } catch {
    console.warn(`Stored "${key}" is not valid JSON and was ignored.`);
    return null;
  }
}

export function writeItem(key: string, value: unknown): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}
