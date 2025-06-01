import { PrismaClient } from '@prisma/client';
declare global {
  var prisma: PrismaClient | undefined;
}
// Prevent multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
export { prisma };
