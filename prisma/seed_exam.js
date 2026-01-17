const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const examTitle = "Healthcare Internship Assessment - ABDM";
  
  // 10 Yes/No Questions
  const yesNoQuestions = [
    { id: "q1", text: "Do you hold or are you pursuing a degree in Healthcare Management, Pharmacy, or Medicine (MBA/Bachelors/BHMS/BAMS)?", options: ["Yes", "No"] },
    { id: "q2", text: "Are you available to work from 10:00 AM to 7:00 PM for the full 3-month duration?", options: ["Yes", "No"] },
    { id: "q3", text: "Do you have a personal laptop and stable internet connection for remote work?", options: ["Yes", "No"] },
    { id: "q4", text: "Are you familiar with the Ayushman Bharat Digital Health Mission (ABDM) guidelines?", options: ["Yes", "No"] },
    { id: "q5", text: "Do you have prior experience or knowledge regarding Digital Health Records (EHR/EMR)?", options: ["Yes", "No"] },
    { id: "q6", text: "Are you comfortable analyzing technical documentation and Government APIs?", options: ["Yes", "No"] },
    { id: "q7", text: "Have you ever worked on a project dealing with healthcare operations or public health?", options: ["Yes", "No"] },
    { id: "q8", text: "Are you willing to collaborate with diverse stakeholders like Doctors, Hospitals, and Insurance providers?", options: ["Yes", "No"] },
    { id: "q9", text: "Can you communicate effectively in English and Hindi/Regional languages?", options: ["Yes", "No"] },
    { id: "q10", text: "Do you understand the core concept of the 'One Nation One Health Card' initiative?", options: ["Yes", "No"] }
  ];

  // 5 Descriptive Questions
  const writingQuestions = [
    { id: "w1", text: "Explain your understanding of the 'One Nation One Health Card' project. How do you think it benefits the common citizen?", options: [] }, // options empty for writing
    { id: "w2", text: "Identify two major challenges in digitizing healthcare workflows (e.g., at a pharmacy or clinic) and propose a brief solution for one.", options: [] },
    { id: "w3", text: "How would you create a test study to evaluate if a Hospital Information System is successfully talking to the Aarogya Aadhar platform?", options: [] },
    { id: "w4", text: "Describe a time you had to learn a new complex system or process quickly. How did you approach it?", options: [] },
    { id: "w5", text: "Why are you interested in this specific internship with Aarogya Aadhar and how does it align with your career goals?", options: [] }
  ];

  // We need to create two separate exams or one combined? 
  // The user said "one paper of 10 yes or no and 5 descriptive".
  // My Exam schema supports `type` as valid string. 
  // However, my current Schema structure seems to assume an exam is EITHER Yes/No OR Writing based on the top level `type` field.
  // Let's check schema.prisma
  
  // Model Exam: type String // YES_NO, WRITING
  
  // Ah, the schema was designed for one type. 
  // To support "Mixed", I should update the schema or just create two sections.
  // BUT, currently I can hack it: The frontend renders based on `questions` array. 
  // If I create a "MIXED" type, I might need to update frontend code.
  // OR, I can just create it as "WRITING" (since writing allows text input, and yes/no is effectively multiple choice).
  // Actually, checking the Frontend (`src/app/exam/[id]/page.js`):
  // const isYesNo = questions[0]?.options?.length > 0;
  // It checks the FIRST question to determine the UI for the WHOLE exam. This is a limitation I introduced.
  
  // Approach: Update the Frontend to handle per-question types or just handle mixed.
  // Let's update `src/app/exam/[id]/page.js` first to be smarter (check options per question).
  // Then I can insert one exam with mixed questions.
  
  console.log("Creating exam...");
  
  await prisma.exam.create({
    data: {
      title: examTitle,
      type: "MIXED", // New type
      questions: [...yesNoQuestions, ...writingQuestions]
    }
  });

  console.log("Exam created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
