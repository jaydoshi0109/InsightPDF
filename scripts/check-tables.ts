import { PrismaClient } from '@prisma/client';
async function checkTables() {
  const prisma = new PrismaClient();
  try {
    // Test the connection
    await prisma.$connect();
    ;
    // Get all tables in the public schema
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    ;
    ;
  } catch (error) {
    ;
  } finally {
    await prisma.$disconnect();
  }
}
checkTables();
