const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emails = [
  'alkamenon02@gmail.com',
  'om4501806@gmail.com',
  'ainavallibhavaniprasad@gmail.com',
  'nupurpise77@gmail.com',
  'ombandal0203@gmail.com',
  'ratnujalitoriya@gmail.com',
  'morevaishnavi68@gmail.com',
  'sayalipande25@gmail.com',
  'luvneeth@gmail.com',
  'sushruti3001@gmail.com',
  'sayaligamne@gmail.com',
  'a71720785@gmail.com',
  'krishnakumarsah747@gmail.com',
  'kmsakshinksd145@gmail.com',
  'kavitaskothawade@gmail.com',
  'kirtisavali@gmail.com',
  'chandrikay21phd140019@gmail.com',
  'krianshi2013army21@gmail.com'
];

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { in: emails }
    }
  });
  
  console.log("| Email | Name | Mobile |");
  console.log("| :--- | :--- | :--- |");
  
  for (const email of emails) {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      console.log(`| ${user.email} | ${user.name || 'N/A'} | ${user.mobile || 'N/A'} |`);
    } else {
      console.log(`| ${email} | Not Found | Not Found |`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
