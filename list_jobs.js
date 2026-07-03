const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.jobPost.findMany({
    select: { id: true, title: true }
  });
  console.log("All Job Posts:", jobs);
}
main();
