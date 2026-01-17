const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'abhishekpuranikpd@gmail.com';
  const password = 'Abhi@12345'; // Note: In a real app, hash this! ensuring it matches the plain-text check in auth.js for now.

  const existing = await prisma.superadmin.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('Superadmin already exists.');
    // Update password just in case
    await prisma.superadmin.update({
      where: { email },
      data: { password },
    });
    console.log('Superadmin password updated.');
  } else {
    await prisma.superadmin.create({
      data: {
        email,
        password,
      },
    });
    console.log('Superadmin created.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
