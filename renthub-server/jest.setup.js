/** Jest setup file for RentHub server tests */
const prisma = require('../src/database/prismaClient.js');

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.$executeRaw`DELETE FROM "Inquiry"`;
  await prisma.$executeRaw`DELETE FROM "Comment"`;
  await prisma.$executeRaw`DELETE FROM "Favourite"`;
  await prisma.$executeRaw`DELETE FROM "Apartment"`;
  await prisma.$executeRaw`DELETE FROM "User"`;
});