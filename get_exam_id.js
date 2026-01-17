const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exam = await prisma.exam.findFirst({
    where: { title: "Healthcare Internship Assessment - ABDM" }
  });
  console.log(exam ? exam.id : "Exam not found");
}

main().finally(() => prisma.$disconnect());
