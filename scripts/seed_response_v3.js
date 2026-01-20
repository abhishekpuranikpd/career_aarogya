const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Comprehensive Response v3...');

  const EXAM_ID = "65a000000000000000000001";
  const TEST_EMAIL = "test_candidate_v3@example.com";

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { examStatus: 'PENDING' },
    create: {
      email: TEST_EMAIL,
      name: "Test Candidate V3",
      mobile: "9876543210",
      positionApplied: "Healthcare Intern",
      examStatus: 'PENDING'
    }
  });

  console.log(`User created/found: ${user.id}`);

  // 2. Link User to Exam via JobPost (Required for our View Logic)
  // Create a dummy job post linked to this exam
  const job = await prisma.jobPost.create({
    data: {
      title: "Test Internship Position",
      description: "For testing purposes",
      examId: EXAM_ID,
      applicants: { connect: { id: user.id } }
    }
  });
  
  // Also update user's jobPostId directly just to be safe
  await prisma.user.update({
    where: { id: user.id },
    data: { jobPostId: job.id }
  });

  // 3. Construct Answers Payload
  // Based on IDs in seed_exam_v3.js
  const answers = {
    "q1_degree": { 
        value: "Other", 
        detail: "Masters in Public Health (MPH)" 
    },
    "q2_ehr": { 
        value: "Yes", 
        explanation: "I have 2 years of experience working with Epic and Cerner EHR systems during my previous internship at City Hospital." 
    },
    "q3_abdm": { 
        value: "Yes", 
        explanation: "I have read the NDHM sandbox documentation and understand the health ID generation flow." 
    },
    "q4_apis": { 
        value: "Yes"
    },
    "q5_ops": { 
        value: "No" 
    },
    "q6_collab": { 
        value: "Yes" 
    },
    "q7_concept": { 
        value: "Yes", 
        explanation: "It aims to create a unified health identity involved in the digital health ecosystem, allowing portability of health records." 
    },
    "q8_transparency": { 
        value: "Yes", 
        explanation: "Digital trails prevent prescription errors and ensure that patient history is available to any authorized doctor, reducing redundancy." 
    },
    "q9_explain_project": { 
        value: "The 'One Nation One Health Card' is a digital ID for every Indian citizen. It standardizes the identification process across healthcare providers. For a common citizen, it means they don't need to carry physical files. Their history travels with them digitally, leading to faster diagnosis and better continuity of care." 
    },
    "q10_challenges": { 
        value: "Challenges: 1. Internet connectivity in rural areas. 2. Digital literacy of staff. 3. Data privacy concerns. 4. Interoperability of legacy systems. 5. Cost of infrastructure.\n\nSolution for Digital Literacy: Conduct simplified, vernacular language training workshops for ground-level SHA workers." 
    },
    "q11_test_study": { 
        value: "I would set up a mock environment. Step 1: Trigger a 'Link Request' from Aarogya Aadhar. Step 2: Verify if the HIS receives the callback. Step 3: Send a dummy FHIR bundle. Step 4: Validate the checksum and data integrity on the Aarogya platform dashboard." 
    },
    "q12_interest": { 
        value: "I am passionate about the intersection of technology and public health. This internship allows me to contribute to a national-scale project that directly impacts millions of lives." 
    },
    "q13_why_need": { 
        value: "India's healthcare is fragmented. A patient visiting a doctor in Delhi has no record of their treatment in Mumbai. The Health Card bridges this gap, saving costs on repeated tests and enabling data-driven policy making." 
    },
    "q14_realtime_data": { 
        value: "If a patient needs an ICU bed, real-time data allows an ambulance to be directed to the nearest available facility immediately, saving critical 'golden hour' time." 
    },
    "q15_rural_impact": { 
        value: "It brings telemedicine to the doorstep. A rural patient can consult a specialist in a metro city, and the specialist can trust the digital records provided by the local health center, improving diagnosis quality without travel." 
    }
  };

  // 4. Create Response
  await prisma.response.create({
    data: {
      userId: user.id,
      examId: EXAM_ID,
      answers: answers,
      submittedAt: new Date()
    }
  });

  console.log('Response seeded successfully for user:', TEST_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
