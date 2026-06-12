import { z } from "zod";

export const WHITESPACE_ONLY_MESSAGE = "Value cannot be empty or whitespace only";

/** Trim input and require minimum length after trim. */
export function trimmedText(min: number, max?: number) {
  let schema = z.string().trim();
  if (max !== undefined) {
    schema = schema.max(max);
  }
  return schema.min(min, min === 1 ? WHITESPACE_ONLY_MESSAGE : undefined);
}

export function optionalTrimmedText(min: number, max?: number) {
  return trimmedText(min, max).optional();
}

/** Reject whitespace-only values without trimming (e.g. passwords). */
export function nonWhitespaceOnly(min = 1, message = WHITESPACE_ONLY_MESSAGE) {
  return z
    .string()
    .min(min)
    .refine((value) => value.trim().length > 0, { message });
}

export function trimmedEmail() {
  return z.string().trim().email();
}

export function trimmedId() {
  return trimmedText(1);
}
