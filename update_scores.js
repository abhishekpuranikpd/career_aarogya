const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobPostId = '69e087ba8bd7ad660ea464eb';
  
  const users = await prisma.user.findMany({
    where: { jobPostId: jobPostId },
    include: { responses: true }
  });

  let count = 0;
  for (const user of users) {
    if (user.responses && user.responses.length > 0) {
      // User has written the exam
      // Update score to randomly 8 or 9
      const score = Math.random() > 0.5 ? 9 : 8;
      
      // Update the latest response
      const latestResponse = user.responses.sort((a, b) => b.submittedAt - a.submittedAt)[0];
      
      await prisma.response.update({
        where: { id: latestResponse.id },
        data: { score: score }
      });

      // Update user status
      await prisma.user.update({
        where: { id: user.id },
        data: { examStatus: 'HIRED' }
      });
      
      // Update application if exists
      const application = await prisma.application.findFirst({
        where: { userId: user.id, jobPostId: jobPostId }
      });
      if (application) {
          await prisma.application.update({
            where: { id: application.id },
            data: { status: 'HIRED' }
          });
      }

      count++;
      console.log(`Updated user ${user.email} with score ${score} and status HIRED`);
    }
  }
  
  console.log(`Finished updating ${count} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
