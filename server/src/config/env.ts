import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
