import { existsSync } from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";
import { z } from "zod";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(__dirname, "../../.env")
];

for (const candidate of envCandidates) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate });
    break;
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().default("file:./server/prisma/dev.db"),
  CHPP_CONSUMER_KEY: z.string(),
  CHPP_CONSUMER_SECRET: z.string(),
  CHPP_ACCESS_TOKEN: z.string(),
  CHPP_ACCESS_TOKEN_SECRET: z.string(),
  CHPP_TEAM_ID: z.string()
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
