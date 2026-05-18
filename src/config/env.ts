import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3002),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVICE_NAME: z.string().default("shoplite-inventory-service")
});

export const env = envSchema.parse(process.env);
