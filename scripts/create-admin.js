const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@aarogyaan.com';
  const password = 'admin123'; // Plain text as per current auth config

  // Check if admin exists
  const existingAdmin = await prisma.superadmin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin already exists.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password} (or whatever was set previously)`);
  } else {
    // Create new admin
    await prisma.superadmin.create({
      data: {
        email,
        password,
      },
    });
    console.log('Superadmin created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
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
