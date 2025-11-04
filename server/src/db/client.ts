import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const createClient = () =>
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL
      }
    }
  });

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prismaClient ?? (global.__prismaClient = createClient());

export async function disconnectPrisma() {
  if (global.__prismaClient) {
    await global.__prismaClient.$disconnect();
    global.__prismaClient = undefined;
  }
}
