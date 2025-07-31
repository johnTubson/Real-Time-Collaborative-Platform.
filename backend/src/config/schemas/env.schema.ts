import { z } from "zod";

export const envSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USERNAME: z.string(),
  EMAIL_FROM: z.string(),
  JWT_EXPIRATION_TIME: z.string().default("15m"),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  OTP_VERIFICATION_JWT_EXPIRATION_TIME: z.string(),
  OTP_VERIFICATION_JWT_SECRET: z.string().default("15m"),
  PORT: z.coerce.number().default(3000),
  TERMII_API_TOKEN: z.string(),
  TERMII_API_URL: z.url(),
  ZEPTO_API_TOKEN: z.string(),
  ZEPTO_API_URL: z.string(),
});

// Infer the type from the schema
export type EnvSchema = z.infer<typeof envSchema>;
