const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const emails = [
  'nikitasanap1212@gmail.com',
  'alkamenon02@gmail.com',
  'siddhirokade09@gmail.com',
  'sahasohan115@gmail.com',
  'sachintkale1999@gmail.com',
  'sujoybiswas.sb3@gmail.com',
  'falgunibhale409@gmail.com',
  'suryawanshiharshada775@gmail.com',
  'om4501806@gmail.com',
  'ainavallibhavaniprasad@gmail.com',
  'morevaishnavi68@gmail.com',
  'luvneeth@gmail.com',
  'sayalipande25@gmail.com',
  'vaniyasingh26@gmail.com',
  'Sonishruti141@gmail.com',
  'panchalvaishnav7378@gmail.com',
  'sushruti3001@gmail.com',
  'krianshi2013army21@gmail.com',
  'drsubhasree.nayak29@gmail.com',
  'kirtisavali@gmail.com',
  'sayaligamne@gmail.com',
  'nupurpise77@gmail.com',
  'apurva.plwl@gmail.com',
  'anujashirke1@gmail.com',
  'ombandal0203@gmail.com',
  'sisodiarajendra02@gmail.com',
  'kambletushar2007@gmail.com'
];

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: { in: emails }
    },
    select: {
      email: true,
      name: true,
      mobile: true,
      pin: true,
      examStatus: true
    }
  });
  
  console.log("Email | Name | Mobile");
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
