import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(__dirname, "../../.env"),
  path.resolve(__dirname, "../../../.env"),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

function requiredEnv(name: string, minLength = 1) {
  return z
    .string({
      required_error: `${name} is required`,
      invalid_type_error: `${name} is required`,
    })
    .trim()
    .min(minLength, `${name} is required`);
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  JWT_SECRET: requiredEnv("JWT_SECRET", 8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = [
    ...new Set(
      parsed.error.issues.map((issue) => issue.path.join(".") || issue.message),
    ),
  ];

  console.error("\n[env] Server failed to start: missing or invalid environment variables.\n");
  console.error(`  Missing/invalid: ${missing.join(", ")}\n`);
  console.error("  Local development:");
  console.error("    cp .env.example server/.env");
  console.error("    # Edit server/.env with your PostgreSQL URL and JWT secret\n");
  console.error("  Docker / cloud deployment:");
  console.error("    Set DATABASE_URL and JWT_SECRET in your platform environment settings.");
  console.error("    Example: DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public");
  console.error("             JWT_SECRET=<long-random-string-at-least-8-chars>\n");

  throw parsed.error;
}

export const env = parsed.data;
