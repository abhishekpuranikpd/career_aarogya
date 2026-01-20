const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const QUESTIONS = [
  {
    id: "q1",
    text: "Do you hold or are you pursuing a degree in Healthcare Management, Pharmacy, or Medicine (MBA/Bachelors/BHMS/BAMS/BDS)?",
    type: "RADIO_WITH_INPUT",
    options: ["MBA", "Bachelor Degree", "BHMS", "BAMS", "BDS", "Other"],
    // Logic for "Bachelor Degree" and "Other" having inputs will be handled in UI by checking the string
  },
  {
    id: "q2",
    text: "Do you have prior experience or knowledge regarding Digital Health Records (EHR/EMR)?",
    type: "RADIO",
    options: ["Yes", "No"],
    requiresExplanation: true,
    explanationLabel: "Please explain",
    wordLimit: 100
  },
  {
    id: "q3",
    text: "Are you familiar with the Ayushman Bharat Digital Health Mission (ABDM) guidelines?",
    type: "RADIO",
    options: ["Yes", "No"],
    requiresExplanation: true,
    explanationLabel: "Please explain",
    wordLimit: 100
  },
  {
    id: "q4",
    text: "Are you comfortable analyzing technical documentation and Government APIs?",
    type: "RADIO",
    options: ["Yes", "No"],
    wordLimit: 0 // No explanation
  },
  {
    id: "q5",
    text: "Have you ever worked on a project dealing with healthcare operations or public health?",
    type: "RADIO",
    options: ["Yes", "No"],
    requiresExplanation: true,
    explanationLabel: "Please explain",
    wordLimit: 100
  },
  {
    id: "q6",
    text: "Are you willing to collaborate on ground with diverse stakeholders like Clinics, Doctors, Hospitals, Pathology, Pharmacy and Health Insurance Providers?",
    type: "RADIO",
    options: ["Yes", "No"],
    wordLimit: 0
  },
  {
    id: "q7",
    text: "Do you understand the core concept of the 'One Nation One Health Card' initiative?",
    type: "RADIO",
    options: ["Yes", "No"],
    requiresExplanation: true,
    explanationLabel: "Please explain",
    wordLimit: 100
  },
  {
    id: "q8",
    text: "Can digital healthcare systems improve transparency and patient safety?",
    type: "RADIO",
    options: ["Yes", "No"],
    requiresExplanation: true,
    explanationLabel: "Please explain",
    wordLimit: 100
  },
  {
    id: "q9",
    text: "Explain your understanding of the 'One Nation One Health Card' project. How do you think it benefits the common citizen?",
    type: "TEXT",
    wordLimit: 200
  },
  {
    id: "q10",
    text: "Identify five major challenges in digitizing healthcare workflows covering Clinics to Insurance Providers and propose a brief solution for one.",
    type: "TEXT",
    wordLimit: 200
  },
  {
    id: "q11",
    text: "How would you create a test study to evaluate if a Hospital Information System is successfully talking to the Aarogya Aadhar platform?",
    type: "TEXT",
    wordLimit: 200
  },
  {
    id: "q12",
    text: "Why are you interested in this specific internship with Aarogya Aadhar and how does it align with your career goals?",
    type: "TEXT",
    wordLimit: 200
  },
  {
    id: "q13",
    text: "Why need to implement One Nation, One Health - Aarogya Aadhar Digital Health Card in India?",
    type: "TEXT",
    wordLimit: 200
  },
  {
    id: "q14",
    text: "How can real-time hospital data (beds, facilities cost, service availability, fund support, Govt. schemes, affordable service) improve patient outcomes?",
    type: "TEXT",
    wordLimit: 200
  },
  {
    id: "q15",
    text: "What impact can the One Nation One Health Card have on rural and underserved populations?",
    type: "TEXT",
    wordLimit: 200
  }
];

async function main() {
  console.log('Seeding Exam Questions...');
  
  // Find the first exam or create one
  const exam = await prisma.exam.findFirst();
  
  if (exam) {
    console.log(`Updating existing exam: ${exam.title}`);
    await prisma.exam.update({
      where: { id: exam.id },
      data: {
        questions: QUESTIONS,
        type: "MIXED"
      }
    });
  } else {
    console.log('Creating new exam: Healthcare Internship Assessment');
    await prisma.exam.create({
      data: {
        title: "Healthcare Internship Assessment",
        type: "MIXED",
        questions: QUESTIONS
      }
    });
  }
  
  console.log('Exam updated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
