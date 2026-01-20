const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Exam v3...');

  const questions = [
    // 1. Degree (Radio with Input)
    {
      id: "q1_degree",
      text: "Do you hold or are you pursuing a degree in Healthcare Management, Pharmacy, or Medicine (MBA/Bachelors/BHMS/BAMS/BDS)?",
      type: "RADIO_WITH_INPUT",
      options: ["MBA", "Bachelor Degree", "BHMS", "BAMS", "BDS", "Other"],
      requiresExplanation: false
    },
    // 2. EHR/EMR (Radio + Explain)
    {
      id: "q2_ehr",
      text: "Do you have prior experience or knowledge regarding Digital Health Records (EHR/EMR)?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: true,
      explanationLabel: "Please explain",
      wordLimit: 100
    },
    // 3. ABDM (Radio + Explain)
    {
      id: "q3_abdm",
      text: "Are you familiar with the Ayushman Bharat Digital Health Mission (ABDM) guidelines?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: true,
      explanationLabel: "Please explain",
      wordLimit: 100
    },
    // 4. APIs (Radio)
    {
      id: "q4_apis",
      text: "Are you comfortable analyzing technical documentation and Government APIs?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: false
    },
    // 5. Healthcare Ops (Radio + Explain)
    {
      id: "q5_ops",
      text: "Have you ever worked on a project dealing with healthcare operations or public health?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: true,
      explanationLabel: "Please explain",
      wordLimit: 100
    },
    // 6. Stakeholders (Radio)
    {
      id: "q6_collab",
      text: "Are you willing to collaborate on ground with diverse stakeholders like Clinics, Doctors, Hospitals, Pathology, Pharmacy and Health Insurance Providers?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: false
    },
    // 7. One Nation Concept (Radio + Explain)
    {
      id: "q7_concept",
      text: "Do you understand the core concept of the 'One Nation One Health Card' initiative?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: true,
      explanationLabel: "Please explain",
      wordLimit: 100
    },
    // 8. Transparency (Radio + Explain)
    {
      id: "q8_transparency",
      text: "Can digital healthcare systems improve transparency and patient safety?",
      type: "RADIO",
      options: ["Yes", "No"],
      requiresExplanation: true,
      explanationLabel: "Please explain",
      wordLimit: 100
    },
    // 9. Explain Concept (Text)
    {
      id: "q9_explain_project",
      text: "Explain your understanding of the 'One Nation One Health Card' project. How do you think it benefits the common citizen?",
      type: "TEXT",
      options: [],
      wordLimit: 200
    },
    // 10. Challenges (Text)
    {
      id: "q10_challenges",
      text: "Identify five major challenges in digitizing healthcare workflows (e.g. Clinics, Doctors, Hospitals, Pathology, Pharmacy and Health Insurance Providers) and propose a brief solution for one.",
      type: "TEXT",
      options: [],
      wordLimit: 200
    },
    // 11. Test Study (Text)
    {
      id: "q11_test_study",
      text: "How would you create a test study to evaluate if a Hospital Information System is successfully talking to the Aarogya Aadhar platform?",
      type: "TEXT",
      options: [],
      wordLimit: 200
    },
    // 12. Interest (Text)
    {
      id: "q12_interest",
      text: "Why are you interested in this specific internship with Aarogya Aadhar and how does it align with your career goals?",
      type: "TEXT",
      options: [],
      wordLimit: 200
    },
    // 13. Why Need (Text)
    {
      id: "q13_why_need",
      text: "Why need to implement One Nation, One Health - Aarogya Aadhar Digital Health Card in India?",
      type: "TEXT",
      options: [],
      wordLimit: 200
    },
    // 14. Real-time Data (Text)
    {
      id: "q14_realtime_data",
      text: "How can real-time hospital data (beds, facilities cost, service availability, fund support, Govt. schemes, affordable service) improve patient outcomes?",
      type: "TEXT",
      options: [],
      wordLimit: 200
    },
    // 15. Rural Impact (Text)
    {
      id: "q15_rural_impact",
      text: "What impact can the One Nation One Health Card have on rural and underserved populations?",
      type: "TEXT",
      options: [],
      wordLimit: 200
    }
  ];

  // Upsert the exam
  const exam = await prisma.exam.upsert({
    where: { id: "65a000000000000000000001" }, // Fixed ID for consistency
    update: {
      title: "Healthcare Internship - ABDM Assessment",
      type: "MIXED",
      questions: questions
    },
    create: {
      id: "65a000000000000000000001",
      title: "Healthcare Internship - ABDM Assessment",
      type: "MIXED",
      questions: questions
    }
  });

  console.log('Seeding completed. Exam ID:', exam.id);
  
  // Optional: Update existing job posts to link to this exam
  await prisma.jobPost.updateMany({
    where: { examId: null },
    data: { examId: exam.id }
  });
  console.log('Linked orphan jobs to this exam.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
