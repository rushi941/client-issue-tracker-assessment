import { z } from "zod";

export const WHITESPACE_ONLY_MESSAGE = "Value cannot be empty or whitespace only";

export function trimmedText(min: number, max?: number, minMessage?: string) {
  let schema = z.string().trim();
  if (max !== undefined) {
    schema = schema.max(max);
  }
  return schema.min(min, minMessage ?? (min === 1 ? WHITESPACE_ONLY_MESSAGE : undefined));
}

export function nonWhitespaceOnly(min = 1, message = WHITESPACE_ONLY_MESSAGE) {
  return z
    .string()
    .min(min)
    .refine((value) => value.trim().length > 0, { message });
}

export function trimmedEmail(message = "Enter a valid email") {
  return z.string().trim().email(message);
}
