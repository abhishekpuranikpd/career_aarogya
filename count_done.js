const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function count() {
  const c = await prisma.user.count({
    where: { 
      jobPostId: '69e087ba8bd7ad660ea464eb',
      examStatus: 'HIRED'
    }
  });
  
  const totalUsers = await prisma.user.findMany({
    where: { jobPostId: '69e087ba8bd7ad660ea464eb' },
    include: { responses: true }
  });
  
  let totalWithResponses = 0;
  for (const user of totalUsers) {
    if (user.responses && user.responses.length > 0) {
      totalWithResponses++;
    }
  }

  console.log(`\n\nTotal candidates updated so far: ${c} / ${totalWithResponses}\n\n`);
}
count().finally(() => prisma.$disconnect());
