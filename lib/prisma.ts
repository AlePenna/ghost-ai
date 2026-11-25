import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "@/app/generated/prisma/client";

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (url.startsWith("prisma+postgres://")) {
    return new PrismaClient({ datasourceUrl: url }).$extends(
      withAccelerate(),
    ) as unknown as PrismaClient;
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

type PrismaClientSingleton = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientSingleton;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
