const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const dmQuestions = [
    {
      id: "q1",
      text: "What does SEO stand for?",
      type: "RADIO",
      options: [
        "Search Engine Optimization",
        "Social Engagement Outreach",
        "Search Experience Opportunity",
        "Site Engagement Operations",
      ],
      correctAnswer: "Search Engine Optimization",
    },
    {
      id: "q2",
      text: "Which of the following is a key factor in Google's ranking algorithm?",
      type: "RADIO",
      options: [
        "Number of images on the page",
        "Domain age and backlinks",
        "Number of social media icons",
        "Page background color",
      ],
      correctAnswer: "Domain age and backlinks",
    },
    {
      id: "q3",
      text: "What is a 'Call to Action' (CTA) in digital marketing?",
      type: "RADIO",
      options: [
        "A customer complaint form",
        "A prompt that encourages the user to take a specific action",
        "A type of paid ad format",
        "An email unsubscribe link",
      ],
      correctAnswer:
        "A prompt that encourages the user to take a specific action",
    },
    {
      id: "q4",
      text: "Which social media platform is best known for short-form video content (Reels)?",
      type: "RADIO",
      options: ["LinkedIn", "Pinterest", "Instagram", "Twitter"],
      correctAnswer: "Instagram",
    },
    {
      id: "q5",
      text: "What does 'CTR' stand for in digital marketing?",
      type: "RADIO",
      options: [
        "Content Transfer Rate",
        "Click-Through Rate",
        "Customer Targeting Reach",
        "Campaign Traffic Report",
      ],
      correctAnswer: "Click-Through Rate",
    },
    {
      id: "q6",
      text: "What is the primary purpose of using hashtags on social media?",
      type: "RADIO",
      options: [
        "To decorate the post",
        "To increase post length",
        "To improve discoverability and reach",
        "To reduce loading time",
      ],
      correctAnswer: "To improve discoverability and reach",
    },
    {
      id: "q7",
      text: "Which of the following is an example of 'Organic' traffic?",
      type: "RADIO",
      options: [
        "Traffic from a paid Google Ad",
        "Traffic from a sponsored Instagram post",
        "Traffic from a Google search result (non-paid)",
        "Traffic from a WhatsApp blast",
      ],
      correctAnswer: "Traffic from a Google search result (non-paid)",
    },
    {
      id: "q8",
      text: "What is 'Engagement Rate' on social media?",
      type: "RADIO",
      options: [
        "The number of followers you have",
        "The ratio of interactions (likes, comments, shares) to total reach",
        "The number of ads you run per month",
        "The total ad spend per campaign",
      ],
      correctAnswer:
        "The ratio of interactions (likes, comments, shares) to total reach",
    },
    {
      id: "q9",
      text: "Which meta tag is most important for SEO on a webpage?",
      type: "RADIO",
      options: [
        "Meta charset",
        "Meta viewport",
        "Meta description",
        "Meta author",
      ],
      correctAnswer: "Meta description",
    },
    {
      id: "q10",
      text: "What is 'Influencer Marketing'?",
      type: "RADIO",
      options: [
        "Marketing via TV commercials",
        "Partnering with individuals who have a social following to promote a brand",
        "Running ads on LinkedIn only",
        "Sending bulk emails to customers",
      ],
      correctAnswer:
        "Partnering with individuals who have a social following to promote a brand",
    },
    {
      id: "q11",
      text: "In social media marketing, what does 'reach' mean?",
      type: "RADIO",
      options: [
        "The number of comments on a post",
        "The number of unique users who saw your content",
        "The total number of posts you made",
        "The number of paid promotions you ran",
      ],
      correctAnswer: "The number of unique users who saw your content",
    },
    {
      id: "q12",
      text: "Which of the following best describes 'keyword research' in SEO?",
      type: "RADIO",
      options: [
        "Finding trending music for Reels",
        "Identifying words/phrases your target audience uses to search online",
        "Counting how many keywords are on your website",
        "Designing keyword-heavy banners",
      ],
      correctAnswer:
        "Identifying words/phrases your target audience uses to search online",
    },
    {
      id: "q13",
      text: "What is a 'Google My Business' (GMB) listing used for?",
      type: "RADIO",
      options: [
        "Running YouTube ads",
        "Managing local business visibility on Google Search and Maps",
        "Sending bulk WhatsApp messages",
        "Creating a company website",
      ],
      correctAnswer:
        "Managing local business visibility on Google Search and Maps",
    },
    {
      id: "q14",
      text: "Which content format typically generates the highest engagement on Instagram?",
      type: "RADIO",
      options: ["Static images", "Text-only posts", "Short-form Reels", "PDFs"],
      correctAnswer: "Short-form Reels",
    },
    {
      id: "q15",
      text: "What does 'A/B Testing' mean in digital marketing?",
      type: "RADIO",
      options: [
        "Testing two different software tools",
        "Comparing two versions of content/ads to see which performs better",
        "Running ads on two different platforms simultaneously",
        "Testing website speed on two devices",
      ],
      correctAnswer:
        "Comparing two versions of content/ads to see which performs better",
    },
  ];

  console.log("1. Creating Standard Exam...");
  const exam = await prisma.exam.create({
    data: {
      title: "Digital Marketing Assessment",
      type: "MIXED",
      questions: dmQuestions,
      windowStart: new Date(Date.now() - 24 * 60 * 60 * 1000), // Active since yesterday
      windowEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Open for 30 days
    },
  });
  console.log("   ✅ Exam Created:", exam.id);

  console.log("2. Creating Job Post linked to Exam...");
  const jobPost = await prisma.jobPost.create({
    data: {
      title: "Digital Marketing Intern",
      description: "Join Aarogya Aadhar as a Digital Marketing Intern to help spread health awareness through digital channels.",
      type: "Internship",
      location: "Remote",
      isActive: true,
      examId: exam.id,
    },
  });
  console.log("   ✅ Job Post Created:", jobPost.id);

  console.log("3. Updating User pd.webwork@gmail.com...");
  try {
    const user = await prisma.user.update({
      where: { email: "pd.webwork@gmail.com" },
      data: {
        jobPostId: jobPost.id,
        positionApplied: "Digital Marketing Intern",
        examStatus: "PENDING",
        // remove existing responses if we want them to take this new exam from scratch
      },
    });
    console.log("   ✅ User Updated:", user.email, "| Status:", user.examStatus);
  } catch (err) {
    console.log("   ⚠️ User pd.webwork@gmail.com not found or could not be updated.");
  }

  console.log("4. Clearing Questions from Assignment task...");
  const assignment = await prisma.assignment.findFirst({
    where: { targetRole: "Digital Marketing" },
  });
  if (assignment) {
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { questions: [] },
    });
    console.log("   ✅ Assignment Questions Cleared (Keeping only Creative Tasks)");
  } else {
    console.log("   ⚠️ Digital Marketing targetRole assignment not found.");
  }

  console.log("✅ Done Migration/Setup!");
}

main()
  .catch((e) => {
    console.error("❌ Setup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
