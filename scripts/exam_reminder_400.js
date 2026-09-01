const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const JOB_ID = "698afd3e18dd6ca1b732cf40";
const BATCH_SKIP = 200; // Skip the first 200 candidates
const BATCH_LIMIT = 400; // Target the next 400
const TEST_EMAIL = "pd.webwork@gmail.com";

const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    messagesPerConnection: 100,
    rateLimit: 1,
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
});

const getHtml = (name) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #f59e0b; }

        .header { background: linear-gradient(to bottom, #fff, #f9fafb); padding: 30px 20px 15px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .logo-img { height: 70px; margin-bottom: 10px; }
        .subtitle { color: #d97706; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }

        .content { padding: 30px 35px 40px; }
        .greeting { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 18px; }
        .message { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 18px; }

        .alert-box { background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #f59e0b; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
        .alert-title { color: #92400e; font-weight: 800; font-size: 16px; margin-bottom: 8px; }
        .alert-text { color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; }

        .steps-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
        .steps-title { color: #0369a1; font-weight: 700; font-size: 15px; margin-bottom: 12px; }
        .step { display: flex; margin-bottom: 10px; font-size: 14px; color: #0c4a6e; }
        ol { padding-left: 20px; margin: 0; }
        ol li { margin-bottom: 10px; color: #0c4a6e; font-size: 14px; line-height: 1.6; }

        .btn-group { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 14px 36px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; background-color: #2563eb; color: #ffffff !important; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

        .important-note { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 14px; border-radius: 8px; font-size: 13px; margin-top: 30px; font-weight: 600; text-align: center; line-height: 1.5; }

        .footer { background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-logos { margin-bottom: 16px; }
        .partner-logo { height: 38px; opacity: 0.8; margin: 0 12px; }
        .footer-text { font-size: 13px; color: #64748b; margin-bottom: 6px; }
        .company-info { font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://utfs.io/f/bIYGoxfChy4RE4ibQB5sCyHGfnltA6r0WwXDUR1jaLqNTcJO" alt="Aarogya Aadhar" class="logo-img" />
            <div class="subtitle">⚠️ Action Required — Exam Pending</div>
        </div>

        <div class="content">
            <div class="greeting">Hi ${name || 'Candidate'},</div>

            <div class="message">
                You had applied for the <strong>Healthcare Intern – WFH</strong> position at Aarogya Aadhar.
                Our records show that you have <strong>not yet completed the online assessment</strong>, which is a required step in the selection process.
            </div>

            <div class="alert-box">
                <div class="alert-title">⏳ Your Exam is Still Pending!</div>
                <p class="alert-text">
                    Candidates who do not complete the assessment will <strong>not be considered</strong> for the internship. 
                    Please complete it as soon as possible to stay in the running.
                </p>
            </div>

            <div class="steps-box">
                <div class="steps-title">📋 How to Complete Your Exam:</div>
                <ol>
                    <li>Visit <strong>career.aarogyaaadhar.com</strong> and log in with your registered email & password.</li>
                    <li>Click on <strong>"Start Exam"</strong> from your dashboard.</li>
                    <li>Complete all questions and submit before the window closes.</li>
                </ol>
            </div>

            <div class="btn-group">
                <a href="https://career.aarogyaaadhar.com/login" class="btn">📝 Go to Exam Portal</a>
            </div>

            <div class="message">
                If you face any issues logging in, please use the <strong>Forgot Password</strong> option on the login page.
                For any other help, reply to this email.
            </div>

            <div class="important-note">
                ⚠️ This is a time-sensitive reminder. Please do not delay — complete your exam to secure your selection!
            </div>
        </div>

        <div class="footer">
            <div class="footer-logos">
                <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636568/6bdabdf5-194a-4cac-a00d-e174147561a8.png" alt="Partner 1" class="partner-logo"/>
                <img src="https://res.cloudinary.com/dorreici1/image/upload/v1761822292/31712b9dcb3dd72cc635256117eb2f75af4ba69a_ew2h8z.png" alt="Partner 2" class="partner-logo"/>
                <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636613/9038662b-9ff4-43f9-84be-06aa4ef1a090.png" alt="Partner 3" class="partner-logo"/>
            </div>
            <div class="footer-text">Aarogya Aadhar — Healthcare Internship Program</div>
            <div class="company-info">&copy; 2026 Aarogya Aadhar. All rights reserved.</div>
        </div>
    </div>
</body>
</html>
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #f59e0b; }

        .header { background: linear-gradient(to bottom, #fff, #f9fafb); padding: 30px 20px 15px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .logo-img { height: 70px; margin-bottom: 10px; }
        .subtitle { color: #d97706; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }

        .content { padding: 30px 35px 40px; }
        .greeting { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 18px; }
        .message { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 18px; }

        .alert-box { background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #f59e0b; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
        .alert-title { color: #92400e; font-weight: 800; font-size: 16px; margin-bottom: 8px; }
        .alert-text { color: #78350f; font-size: 14px; line-height: 1.6; margin: 0; }

        .steps-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
        .steps-title { color: #0369a1; font-weight: 700; font-size: 15px; margin-bottom: 12px; }
        .step { display: flex; margin-bottom: 10px; font-size: 14px; color: #0c4a6e; }
        ol { padding-left: 20px; margin: 0; }
        ol li { margin-bottom: 10px; color: #0c4a6e; font-size: 14px; line-height: 1.6; }

        .btn-group { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 14px 36px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; background-color: #2563eb; color: #ffffff !important; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }

        .important-note { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 14px; border-radius: 8px; font-size: 13px; margin-top: 30px; font-weight: 600; text-align: center; line-height: 1.5; }

        .footer { background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer-logos { margin-bottom: 16px; }
        .partner-logo { height: 38px; opacity: 0.8; margin: 0 12px; }
        .footer-text { font-size: 13px; color: #64748b; margin-bottom: 6px; }
        .company-info { font-size: 12px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://utfs.io/f/bIYGoxfChy4RE4ibQB5sCyHGfnltA6r0WwXDUR1jaLqNTcJO" alt="Aarogya Aadhar" class="logo-img" />
            <div class="subtitle">⚠️ Action Required — Exam Pending</div>
        </div>

        <div class="content">
            <div class="greeting">Hi ${name || 'Candidate'},</div>

            <div class="message">
                You had applied for the <strong>Healthcare Intern – WFH</strong> position at Aarogya Aadhar.
                Our records show that you have <strong>not yet completed the online assessment</strong>, which is a required step in the selection process.
            </div>

            <div class="alert-box">
                <div class="alert-title">⏳ Your Exam is Still Pending!</div>
                <p class="alert-text">
                    Candidates who do not complete the assessment will <strong>not be considered</strong> for the internship. 
                    Please complete it as soon as possible to stay in the running.
                </p>
            </div>

            <div class="steps-box">
                <div class="steps-title">📋 How to Complete Your Exam:</div>
                <ol>
                    <li>Visit <strong>career.aarogyaaadhar.com</strong> and log in with your registered email & password.</li>
                    <li>Click on <strong>"Start Exam"</strong> from your dashboard.</li>
                    <li>Complete all questions and submit before the window closes.</li>
                </ol>
            </div>

            <div class="btn-group">
                <a href="https://career.aarogyaaadhar.com/login" class="btn">📝 Go to Exam Portal</a>
            </div>

            <div class="message">
                If you face any issues logging in, please use the <strong>Forgot Password</strong> option on the login page.
                For any other help, reply to this email.
            </div>

            <div class="important-note">
                ⚠️ This is a time-sensitive reminder. Please do not delay — complete your exam to secure your selection!
            </div>
        </div>

        <div class="footer">
            <div class="footer-logos">
                <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636568/6bdabdf5-194a-4cac-a00d-e174147561a8.png" alt="Partner 1" class="partner-logo"/>
                <img src="https://res.cloudinary.com/dorreici1/image/upload/v1761822292/31712b9dcb3dd72cc635256117eb2f75af4ba69a_ew2h8z.png" alt="Partner 2" class="partner-logo"/>
                <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636613/9038662b-9ff4-43f9-84be-06aa4ef1a090.png" alt="Partner 3" class="partner-logo"/>
            </div>
            <div class="footer-text">Aarogya Aadhar — Healthcare Internship Program</div>
            <div class="company-info">&copy; 2026 Aarogya Aadhar. All rights reserved.</div>
        </div>
    </div>
</body>
</html>
`;

async function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isTest = args.includes('--test');

    try {
        // --- TEST MODE ---
        if (isTest) {
            console.log(`\n🧪 Sending TEST email to: ${TEST_EMAIL}...`);
            await transporter.sendMail({
                from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: TEST_EMAIL,
                subject: "⏳ Reminder: Complete Your Online Exam – Aarogya Aadhar",
                html: getHtml("Test Candidate")
            });
            console.log(`✅ Test email sent to ${TEST_EMAIL}`);
            console.log(`\n👉 Review the email, then run with --execute to send to first ${BATCH_LIMIT} candidates.`);
            return;
        }

        // --- FETCH CANDIDATES ---
        console.log(`\n🔍 Fetching applicants for job ${JOB_ID}...`);

        // Get all applicants for this job
        const allApplicants = await prisma.user.findMany({
            where: { jobPostId: JOB_ID },
            select: { id: true, name: true, email: true }
        });

        console.log(`   Total applicants found: ${allApplicants.length}`);

        // Get IDs of those who wrote the exam (have responses) for this job specifically
        const responders = await prisma.response.findMany({
            where: { 
                userId: { in: allApplicants.map(u => u.id) }
            },
            select: { userId: true },
            distinct: ['userId']
        });
        const wroteExamIds = new Set(responders.map(r => r.userId));

        // Filter: not wrote exam, valid email, unique
        const notWrote = allApplicants.filter(u => !wroteExamIds.has(u.id) && u.email);
        const seen = new Set();
        const unique = notWrote.filter(u => {
            if (!u.email) return false;
            const email = u.email.toLowerCase().trim();
            if (seen.has(email)) return false;
            seen.add(email);
            return true;
        });

        console.log(`   Did NOT write exam: ${notWrote.length}`);
        console.log(`   Unique emails: ${unique.length}`);

        // Take the batch using SKIP and LIMIT
        const batch = unique.slice(BATCH_SKIP, BATCH_SKIP + BATCH_LIMIT);

        console.log(`   Skipped: ${BATCH_SKIP}`);
        console.log(`   This batch (next ${BATCH_LIMIT}): ${batch.length}`);

        if (batch.length === 0) {
            console.log("\n⚠️  No more candidates in this batch range.");
            return;
        }

        // --- DRY RUN ---
        if (!isExecute) {
            console.log(`\n⚠️  DRY RUN — No emails sent.`);
            console.log(`   First 5 in batch:`);
            batch.slice(0, 5).forEach(u => console.log(`   - ${u.name} <${u.email}>`));
            console.log(`\n   Run with --test to preview email, or --execute to send to all ${batch.length}.`);
            return;
        }

        // --- EXECUTE ---
        console.log(`\n🚀 Sending reminder emails to ${batch.length} candidates...\n`);
        await new Promise(r => setTimeout(r, 2000));

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < batch.length; i++) {
            const user = batch[i];
            try {
                await transporter.sendMail({
                    from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "⏳ Reminder: Complete Your Online Exam – Aarogya Aadhar",
                    html: getHtml(user.name)
                });
                console.log(`✅ [${i + 1}/${batch.length}] ${user.name} <${user.email}>`);
                successCount++;
                // Throttle to 1 email per 1.1 seconds (rateLimit is already in transporter, but extra safety here)
                await new Promise(r => setTimeout(r, 1100));
            } catch (err) {
                console.error(`❌ [${i + 1}/${batch.length}] Failed for ${user.email}: ${err.message}`);
                failCount++;
            }
        }

        console.log(`\n🎉 Done!`);
        console.log(`   ✅ Sent    : ${successCount}`);
        console.log(`   ❌ Failed  : ${failCount}`);

    } catch (e) {
        console.error("\n💥 Fatal Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
