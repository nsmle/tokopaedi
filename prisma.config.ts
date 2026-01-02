import "dotenv/config";
import path from "node:path";
import { env, type PrismaConfig } from "prisma/config";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: `bun run ${path.join("prisma", "seed", "seed.ts")} -- --environment development`,
  },
  views: {
    path: path.join("prisma", "views"),
  },
  typedSql: {
    path: path.join("prisma", "queries"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
} satisfies PrismaConfig;
