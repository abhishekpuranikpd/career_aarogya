const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find an existing Exam (or create one if none)
  let exam = await prisma.exam.findFirst();
  
  if (!exam) {
    console.log("No exam found. Creating a dummy exam...");
    exam = await prisma.exam.create({
      data: {
        title: "General Healthcare Assessment",
        type: "YES_NO",
        questions: []
      }
    });
  }
  console.log(`Using Exam: ${exam.title} (${exam.id})`);

  // 2. Create the Job Post
  const job = await prisma.jobPost.create({
    data: {
      title: "Staff Nurse (ICU)",
      description: "We are looking for a dedicated Staff Nurse to join our ICU team. You will be responsible for monitoring patients, administering medications, and providing compassionate care.",
      location: "Mumbai",
      type: "Full-time",
      salary: "₹3,00,000 - ₹5,00,000 PA",
      imageUrl: "https://images.unsplash.com/photo-1516574187841-6930022476c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
      examId: exam.id
    }
  });

  console.log(`Created Job Post: ${job.title} (${job.id})`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
