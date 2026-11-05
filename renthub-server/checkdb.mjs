import 'dotenv/config';
import prisma from './src/database/prismaClient.js';

const tables = await prisma.$queryRawUnsafe(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log('DATABASE_URL =', process.env.DATABASE_URL);
console.log('cwd =', process.cwd());
console.log('TABLES =', tables);
await prisma.$disconnect();
