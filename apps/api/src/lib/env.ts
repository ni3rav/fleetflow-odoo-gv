import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CORS_ORIGIN: z.url(),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  /** Resend API key for sending password reset emails. If set, reset emails are sent via Resend. */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** Verified domain for sending emails (e.g. emails.example.com). Used as From address host. */
  EMAIL_DOMAIN: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
