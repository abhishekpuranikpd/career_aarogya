const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data cleanup...');

  // 1. Delete all exam responses
  const deletedResponses = await prisma.response.deleteMany({});
  console.log(`Deleted ${deletedResponses.count} exam responses.`);

  // 2. Delete all users (Applicants) - effectively resetting the system
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`Deleted ${deletedUsers.count} users.`);

  console.log('Cleanup completed successfully: Responses and Users deleted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
