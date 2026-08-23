require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Connects to career_aarogya DB via DATABASE_URL

async function checkUsers() {
  const emails = [
    '39sadmasarwarcprs@gmail.com',
    '56jshweta@gmail.com',
    'Lubnaeramyousuf@gmail.com',
    'Rushitamunot@gmail.com',
    'abhishek99956.ak@gmail.com'
  ];
  
  const users = await prisma.user.findMany({
    where: { email: { in: emails } }
  });
  
  console.log("Users in Career Portal DB:", users.map(u => ({
    email: u.email,
    name: u.name,
    mobile: u.mobile,
    resumeUrl: u.resumeUrl
  })));
  
  process.exit(0);
}

checkUsers();
