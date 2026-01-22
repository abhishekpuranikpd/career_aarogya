const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'abhishekpuranikpd@gmail.com'; 

  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    console.log(`User with email ${email} not found.`);
    return;
  }

  console.log(`Found user: ${user.name} (${user.id})`);

  // Delete all applications for this user
  const deletedApplications = await prisma.application.deleteMany({
    where: {
      userId: user.id
    }
  });

  console.log(`Deleted ${deletedApplications.count} applications for user ${email}.`);
  
  // Reset user fields related to active application
  await prisma.user.update({
    where: { id: user.id },
    data: {
      examStatus: 'PENDING',
      jobPostId: null, 
    }
  });
  console.log("Reset user exam status and cleared jobPostId.");

}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
