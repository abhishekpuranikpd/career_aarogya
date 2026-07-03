const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobPostId = '6a1ce85bb05d0fa187cf733a';
  const usersWithJobPostId = await prisma.user.count({
    where: {
      jobPostId: jobPostId
    }
  });

  const appsWithJobPostId = await prisma.application.count({
    where: {
      jobPostId: jobPostId
    }
  });

  console.log("Users with jobPostId =", usersWithJobPostId);
  console.log("Applications with jobPostId =", appsWithJobPostId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
