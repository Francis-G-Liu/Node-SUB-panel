
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  console.log(`User count: ${users}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
