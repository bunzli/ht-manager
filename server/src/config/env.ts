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

// Resolve DATABASE_URL to absolute path if it's a relative file path
const resolveDatabaseUrl = (url: string): string => {
  if (url.startsWith("file:")) {
    const filePath = url.replace(/^file:/, "");
    // If it's already absolute, return as-is
    if (path.isAbsolute(filePath)) {
      return url;
    }
    // Try resolving relative to current working directory first
    const cwdPath = path.resolve(process.cwd(), filePath);
    if (existsSync(cwdPath)) {
      return `file:${cwdPath}`;
    }
    // Try resolving relative to server directory (where this file is)
    // __dirname is server/src/config, so ../.. is server/
    const serverDir = path.resolve(__dirname, "../..");
    const serverPath = path.resolve(serverDir, filePath);
    if (existsSync(serverPath)) {
      return `file:${serverPath}`;
    }
    // Try resolving relative to project root (one level up from server)
    const projectRoot = path.resolve(serverDir, "..");
    const rootPath = path.resolve(projectRoot, filePath);
    if (existsSync(rootPath)) {
      return `file:${rootPath}`;
    }
    // If none found, return original (will error later with better message)
    return url;
  }
  return url;
};

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().default("file:./prisma/dev.db"),
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

// Resolve DATABASE_URL to absolute path
const resolvedEnv = {
  ...parsed.data,
  DATABASE_URL: resolveDatabaseUrl(parsed.data.DATABASE_URL)
};

export const env = resolvedEnv;
