const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'phd.drshubham@gmail.com';
  const password = 'Shubham@123';

  console.log(`Checking for existing admin with email: ${email}`);

  const existingAdmin = await prisma.superadmin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin already exists. Updating password...');
    await prisma.superadmin.update({
      where: { email },
      data: { password },
    });
    console.log('Password updated successfully.');
  } else {
    console.log('Creating new superadmin...');
    await prisma.superadmin.create({
      data: {
        email,
        password,
      },
    });
    console.log('Superadmin created successfully!');
  }
  
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
