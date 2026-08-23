require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function exportUsers() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, mobile: true, resumeUrl: true }
  });
  fs.writeFileSync('users_export.json', JSON.stringify(users, null, 2));
  console.log(`Exported ${users.length} users to users_export.json`);
  process.exit(0);
}
exportUsers();
