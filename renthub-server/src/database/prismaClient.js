import { PrismaClient } from '@prisma/client';

// Singleton pattern: create PrismaClient only once.
// This prevents multiple connection pools and ensures consistent behavior.
const prisma = global.prisma || new PrismaClient();

// Store the instance globally in development only, so hot-reload
// environments do not accumulate multiple clients.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
export default prisma;
