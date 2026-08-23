const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emails = [
  'ratnujalitoriya@gmail.com',
  'a71720785@gmail.com',
  'krishnakumarsah747@gmail.com',
  'kmsakshinksd145@gmail.com',
  'kavitaskothawade@gmail.com',
  'chandrikay21phd140019@gmail.com'
];

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { in: emails }
    }
  });
  
  for (const email of emails) {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      console.log(`${user.email} | ${user.name || 'N/A'} | ${user.mobile || 'N/A'}`);
    } else {
      console.log(`${email} | Not Found | Not Found`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
