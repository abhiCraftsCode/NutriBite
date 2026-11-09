import { config } from "./config.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({
  url: config.databaseUrl,
});

export const prisma = new PrismaClient({ adapter });
