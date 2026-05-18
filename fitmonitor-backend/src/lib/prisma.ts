import dotenv from 'dotenv';
const { PrismaClient } = require('@prisma/client');
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL не задано. Створи .env на основі .env');
}

const adapter = new PrismaPg({ connectionString });
const globalForPrisma = globalThis as unknown as { prisma?: any };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
