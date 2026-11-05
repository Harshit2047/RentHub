/** Jest setup file for RentHub server tests - mocks Prisma client */
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  apartment: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
  },
  favourite: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  inquiry: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

// Mock the prisma client module
jest.mock('../src/database/prismaClient.js', () => {
  return jest.fn(() => mockPrisma);
});