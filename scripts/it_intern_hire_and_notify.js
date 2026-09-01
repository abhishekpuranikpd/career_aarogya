const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

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

// Generate a unique reference ID: IT + 4 digits
function generateRefId() {
    const digits = Math.floor(1000 + Math.random() * 9000); // 1000–9999
    return `IT${digits}`;
}

// Make sure all generated IDs in one run are unique
function generateUniqueRefIds(count) {
    const ids = new Set();
    while (ids.size < count) {
        ids.add(generateRefId());
    }
    return Array.from(ids);
}

// Email Template Generator
const getHtml = (name, refId) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333333; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #22c55e; }

            /* Header */
            .header { background: linear-gradient(to bottom, #ffffff, #f9fafb); padding: 35px 20px 15px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .logo-img { height: 75px; margin-bottom: 12px; }
            .subtitle { color: #0e5dcc; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; font-weight: 700; }

            .content { padding: 25px 35px 40px; }
            .greeting { font-size: 24px; font-weight: 800; margin-bottom: 20px; color: #1e293b; letter-spacing: -0.5px; }
            .message { font-size: 16px; line-height: 1.65; color: #475569; margin-bottom: 20px; }

            /* Ref ID Badge */
            .ref-box { background: linear-gradient(135deg, #1e3a5f, #0e5dcc); border-radius: 10px; padding: 22px 28px; margin: 25px 0; text-align: center; box-shadow: 0 6px 16px rgba(14,93,204,0.25); }
            .ref-label { color: #93c5fd; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
            .ref-id { color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 4px; font-family: 'Courier New', monospace; }

            /* Internship Highlight */
            .highlight-box { background-color: #f0fdf4; border: 1px solid #dcfce7; border-left: 5px solid #22c55e; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .highlight-title { color: #15803d; font-weight: 800; font-size: 19px; margin-bottom: 8px; display: block; }
            .highlight-text { color: #166534; font-size: 16px; font-weight: 500; }
            .date-badge { display: inline-block; background-color: #166534; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

            .details-list { margin: 20px 0; padding-left: 0; list-style: none; }
            .details-list li { margin-bottom: 12px; color: #475569; padding-left: 24px; position: relative; font-weight: 500; }
            .details-list li::before { content: "•"; color: #22c55e; font-weight: bold; font-size: 20px; position: absolute; left: 0; top: -4px; }

            /* WhatsApp Section */
            .whatsapp-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px 25px; margin: 25px 0; text-align: center; }
            .whatsapp-title { color: #15803d; font-size: 16px; font-weight: 700; margin-bottom: 10px; }

            /* Buttons */
            .btn-group { text-align: center; margin: 30px 0 15px; }
            .btn { display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2); margin: 6px; }
            .btn-primary { background-color: #007bff; color: #ffffff !important; border: 1px solid #007bff; }
            .btn-whatsapp { background-color: #25D366; color: #ffffff !important; border: 1px solid #25D366; }

            .important-note { background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px; border-radius: 8px; font-size: 13px; margin-top: 35px; font-weight: 600; line-height: 1.5; text-align: center; }

            .footer { background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-logos { text-align: center; margin-bottom: 20px; }
            .partner-logo { height: 40px; opacity: 0.8; margin: 0 15px; display: inline-block; }
            .footer-text { font-size: 14px; color: #64748b; margin-bottom: 10px; }
            .company-info { font-size: 12px; color: #94a3b8; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://utfs.io/f/bIYGoxfChy4RE4ibQB5sCyHGfnltA6r0WwXDUR1jaLqNTcJO" alt="Aarogya Aadhar" class="logo-img" />
                <div class="subtitle">IT Internship Program</div>
            </div>
            <div class="content">
                <div class="greeting">🎉 Congratulations, ${name}!</div>

                <div class="message">
                    We are thrilled to inform you that you have been <strong>selected for the Full Stack Intern position</strong> at Aarogya Aadhar!
                    Your profile stood out and we are excited to have you join our team.
                </div>

                <!-- Unique Reference ID -->
                <div class="ref-box">
                    <div class="ref-label">Your Unique Intern Reference ID</div>
                    <div class="ref-id">${refId}</div>
                </div>

                <!-- Internship Details -->
                <div class="highlight-box">
                    <span class="highlight-title">3-Month Free Internship Program</span>
                    <span class="highlight-text">You have been selected for our <strong>3-Month Internship Program</strong>. This is a performance-based opportunity — interns who demonstrate strong skills and dedication will be offered a <strong>Full-Time position</strong> at the end of the internship.</span>
                    <br/>
                    <span class="date-badge">🗓️ Starts from March 10, 2026</span>
                </div>

                <div class="message">
                    Please note: this is a <strong>free internship</strong> designed to evaluate your skills and potential. Based on your performance during the 3 months, you may receive an offer to join us as a <strong>Full-Time Employee</strong>.
                </div>

                <p><strong>Program Details:</strong></p>
                <ul class="details-list">
                    <li><strong>Role:</strong> Full Stack Intern (IT Team)</li>
                    <li><strong>Duration:</strong> 3 Months (Starting March 10, 2026)</li>
                    <li><strong>Nature:</strong> Free Internship with Full-Time Offer on Performance</li>
                    <li><strong>Your Ref ID:</strong> ${refId} — use this for all official communication</li>
                    <li><strong>Availability:</strong> Must be available for full-time engagement during internship</li>
                </ul>

                <!-- Register Button -->
                <div class="btn-group">
                    <a href="https://team.aarogyaaadhar.com/register" class="btn btn-primary">📝 Register &amp; Submit Documents</a>
                </div>

                <!-- WhatsApp Group -->
                <div class="whatsapp-box">
                    <div class="whatsapp-title">📱 Join Our Intern WhatsApp Group</div>
                    <p style="color:#475569; font-size:14px; margin-bottom:14px;">Stay connected with your batch mates and get all important updates instantly by joining our official WhatsApp group.</p>
                    <a href="https://chat.whatsapp.com/K7opyBElNch3cCUkpSXz0p" class="btn btn-whatsapp">Join WhatsApp Group</a>
                </div>

                <div class="message">
                    We look forward to having you on board. If you have any questions, feel free to reach out. Welcome to the Aarogya Aadhar family!
                </div>

                <div class="important-note">
                    ⚠️ Please save your Reference ID <strong>${refId}</strong> safely. Do NOT reply to all on this email — this is an automated notification.
                </div>
            </div>
            <div class="footer">
                <div class="footer-logos">
                    <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636568/6bdabdf5-194a-4cac-a00d-e174147561a8.png" alt="Partner 1" class="partner-logo"/>
                    <img src="https://res.cloudinary.com/dorreici1/image/upload/v1761822292/31712b9dcb3dd72cc635256117eb2f75af4ba69a_ew2h8z.png" alt="Partner 2" class="partner-logo"/>
                    <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636613/9038662b-9ff4-43f9-84be-06aa4ef1a090.png" alt="Partner 3" class="partner-logo"/>
                </div>
                <div class="footer-text">Welcome to the Team — Aarogya Aadhar IT Intern Batch 2026!</div>
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

    const TEST_EMAIL = "pd.webwork@gmail.com";

    try {
        // --- TEST MODE ---
        if (isTest) {
            const testRefId = generateRefId();
            console.log(`\n🧪 Sending TEST email to: ${TEST_EMAIL}...`);
            console.log(`   Sample Ref ID: ${testRefId}`);

            await transporter.sendMail({
                from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: TEST_EMAIL,
                subject: "🎉 Congratulations! You're Selected as IT Intern – Aarogya Aadhar",
                html: getHtml("Test Candidate", testRefId)
            });

            console.log(`✅ Test email sent to ${TEST_EMAIL}`);
            console.log(`\n👉 Please review the email and run with --execute to send to all IT interns.`);
            return;
        }

        // --- FIND CANDIDATES ---
        // Job Post ID for "Full Stack Intern" (confirmed by admin)
        const FULL_STACK_JOB_ID = "6970a8cadab087e97b835d39"; // This ID is for the job post itself

        console.log("\n🔍 Finding Full Stack Intern applicants from User model...");

        // Find users who applied for the Full Stack Intern job and have not been 'HIRED' yet
        const eligibleUsers = await prisma.user.findMany({
            where: {
                jobPostId: FULL_STACK_JOB_ID,
                examStatus: { not: 'HIRED' }
            },
            select: {
                id: true,
                name: true,
                email: true,
                examStatus: true
            }
        });

        if (eligibleUsers.length === 0) {
            console.log("\n✅ No eligible candidates found for Full Stack Intern (all may already be HIRED or none have applied/met criteria).");
            return;
        }

        console.log(`\n📋 Found ${eligibleUsers.length} eligible candidate(s) for Full Stack Intern:\n`);
        eligibleUsers.forEach(user => {
            console.log(`   - ${user.name} <${user.email}> | Current Status: ${user.examStatus}`);
        });

        // --- DRY RUN ---
        if (!isExecute) {
            console.log("\n⚠️  DRY RUN — No database changes made, no emails sent.");
            console.log("   Run with --execute to mark as HIRED and send congratulations emails.");
            return;
        }

        // --- EXECUTE MODE ---
        console.log("\n🚀 Starting bulk HIRE update & email sending...");
        console.log(`   Target: ${eligibleUsers.length} intern(s)\n`);
        await new Promise(r => setTimeout(r, 2000));

        // Generate unique ref IDs for all candidates
        const refIds = generateUniqueRefIds(eligibleUsers.length);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < eligibleUsers.length; i++) {
            const user = eligibleUsers[i];
            const refId = refIds[i];
            const userName = user.name || "Candidate";

            try {
                // Update user's examStatus to HIRED
                await prisma.user.update({
                    where: { id: user.id },
                    data: { examStatus: "HIRED" }
                });

                // Send congratulations email
                await transporter.sendMail({
                    from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "🎉 Congratulations! You're Selected as IT Intern – Aarogya Aadhar",
                    html: getHtml(userName, refId)
                });

                console.log(`✅ [${i + 1}/${eligibleUsers.length}] ${userName} <${user.email}> → Ref: ${refId} (Status updated to HIRED)`);
                successCount++;

                // Rate limit: max 1 email/second
                await new Promise(r => setTimeout(r, 1100));

            } catch (err) {
                console.error(`❌ [${i + 1}/${eligibleUsers.length}] Failed for ${user.email}:`, err.message);
                failCount++;
            }
        }

        console.log(`\n🎉 Process Complete!`);
        console.log(`   ✅ Successful : ${successCount}`);
        console.log(`   ❌ Failed     : ${failCount}`);

    } catch (error) {
        console.error("\n💥 Fatal Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
