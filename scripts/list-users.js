const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      examStatus: true,
      jobPostId: true
    }
  });

  console.log("Existing Users:");
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) [ID: ${u.id}] Status: ${u.examStatus}, Job: ${u.jobPostId}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
