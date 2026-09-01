const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const JOB_ID = "698afd3e18dd6ca1b732cf40";
const SUPERADMIN_EMAIL = "abhishekpuranikpd@gmail.com";

// Setup Transporter
const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 1,
  messagesPerConnection: 100,
  rateLimit: 1, // Max 1 message per second
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

async function main() {
    try {
        console.log(`🚀 Starting Exam Reminder Script for Job ID: ${JOB_ID}`);

        // 1. Fetch Job and Exam Details
        const job = await prisma.jobPost.findUnique({
            where: { id: JOB_ID },
            include: { exam: true }
        });

        if (!job) {
            console.error("❌ Job not found!");
            return;
        }

        console.log(`📋 Job Found: ${job.title}`);
        console.log(`📝 Exam: ${job.exam ? job.exam.title : 'No Exam Linked'}`);

        // 2. Fetch Applicants for this job
        const applicants = await prisma.user.findMany({
            where: { jobPostId: JOB_ID },
            select: { id: true, email: true, name: true }
        });

        console.log(`👥 Found ${applicants.length} applicants for this job.`);

        // 3. Find who already submitted the exam from this job applicant pool
        let examResponderIds = new Set();
        if (job.exam) {
            // Get user IDs from responses for this exam, but only for users in our applicants list
            const applicantIds = applicants.map(u => u.id);
            const responses = await prisma.response.findMany({
                where: { 
                    examId: job.exam.id,
                    userId: { in: applicantIds }
                },
                select: { userId: true }
            });
            responses.forEach(r => examResponderIds.add(r.userId));
            console.log(`✍️  ${examResponderIds.size} applicants from this job already submitted the exam.`);
        }

        // 4. Filter: only those who haven't written the exam
        const pendingApplicants = applicants.filter(u => !examResponderIds.has(u.id));
        console.log(`⏳ ${pendingApplicants.length} applicants have NOT written the exam yet.`);

        // Filter valid emails & remove duplicates
        const validApplicants = pendingApplicants.filter(user => user && user.email && user.email.includes('@'));
        const uniqueEmails = [...new Set(validApplicants.map(u => u.email))];
        const emailToName = Object.fromEntries(validApplicants.map(u => [u.email, u.name]));
        console.log(`📧 Unique Emails to notify: ${uniqueEmails.length}`);

        // 3. Email Template
        const loginLink = "https://career.aarogyaaadhar.com/login";
        const logoUrl = "https://utfs.io/f/bIYGoxfChy4RE4ibQB5sCyHGfnltA6r0WwXDUR1jaLqNTcJO";

        // Format Dates
        const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Today';
        const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

        const examDate = job.exam && job.exam.windowStart ? formatDate(job.exam.windowStart) : "Today, 22nd January";
        const startTime = job.exam && job.exam.windowStart ? formatTime(job.exam.windowStart) : "11:00 AM";
        const endTime = job.exam && job.exam.windowEnd ? formatTime(job.exam.windowEnd) : "04:00 PM";

        const getHtml = (userName) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; color: #334155; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
                .header { background: #ffffff; padding: 30px; text-align: center; border-bottom: 2px solid #f1f5f9; }
                .logo-img { max-height: 50px; width: auto; }
                .content { padding: 40px; }
                .h2 { color: #0f172a; margin-top: 0; font-size: 24px; margin-bottom: 20px; }
                .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 4px; margin: 25px 0; }
                .alert-title { color: #b91c1c; font-weight: bold; font-size: 16px; margin-bottom: 10px; display: block; }
                .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 30px 0 10px 0; text-align: center; width: auto; }
                .cta-button:hover { background-color: #1d4ed8; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" alt="Aarogya Aadhar" class="logo-img">
                </div>
                <div class="content">
                    <h2 class="h2">Exam Access: Login Required</h2>
                    <p>Dear ${userName || 'Candidate'},</p>
                    <p>We are sending this email to provide the correct login link and full schedule for your assessment. <strong>Please ignore any previous registration links if you are already registered.</strong></p>
                    
                    <div class="alert-box">
                        <span class="alert-title">👉 Next Step: Login to Start</span>
                        <p style="margin: 0; color: #7f1d1d; margin-bottom: 10px;">You must <strong>LOGIN</strong> to your account to access the assessment.</p>
                        
                        <div style="background: rgba(255,255,255,0.6); padding: 10px; border-radius: 4px; border: 1px solid #fecaca; font-size: 15px;">
                            <p style="margin: 0 0 5px 0;"><strong>📅 Exam Date:</strong> ${examDate}</p>
                            <p style="margin: 0;"><strong>⏰ Time Window:</strong> ${startTime} - ${endTime}</p>
                        </div>
                    </div>

                    <p>Please click the button below to login and start your exam:</p>

                    <div style="text-align: center;">
                        <a href="${loginLink}" class="cta-button">Login to Start Exam</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Aarogya Aadhar. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // 4. Send to Superadmin First
        console.log(`\n📤 Sending Test Email to Superadmin (${SUPERADMIN_EMAIL})...`);
        try {
            await transporter.sendMail({
                from: `"Aarogya Aadhar Exams" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: SUPERADMIN_EMAIL,
                subject: `[ADMIN TEST] Exam Info - Login & Timing`,
                html: getHtml('Superadmin')
            });
            console.log("✅ Superadmin email sent successfully.");
        } catch (error) {
            console.error("❌ Failed to send superadmin email:", error.message);
        }

        // Logic to stop if not confirmed
        const args = process.argv.slice(2);
        if (!args.includes('--send-all')) {
            console.log("\n⚠️  STOPPING: Only sent to Superadmin.");
            console.log("👉 To send to ALL applicants, run: node scripts/send_exam_reminder.js --send-all");
            return;
        }

        // 5. Bulk Send
        console.log(`\n🚀 Starting Bulk Send (Correction) to ${uniqueEmails.length} applicants...`);
        let sentCount = 0;
        let failCount = 0;

        for (const email of uniqueEmails) {
             try {
                 await transporter.sendMail({
                    from: `"Aarogya Aadhar Exams" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `IMPORTANT: Exam Schedule & Login Link`,
                    html: getHtml(emailToName[email] || 'Candidate')
                });
                console.log(`✅ Sent to ${email}`);
                sentCount++;
                // Throttle
                await new Promise(r => setTimeout(r, 200)); 
             } catch (err) {
                 console.error(`❌ Failed to send to ${email}:`, err.message);
                 failCount++;
             }
        }

        console.log(`\n🎉 Finished!`);
        console.log(`✅ Sent: ${sentCount}`);
        console.log(`❌ Failed: ${failCount}`);

    } catch (e) {
        console.error("❌ Fatal Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
