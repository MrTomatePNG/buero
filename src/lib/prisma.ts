import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "$env/dynamic/private";
import { PrismaClient } from "$lib/genereted/prisma/client";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
