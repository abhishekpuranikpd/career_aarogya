const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const HC_JOB_ID        = "698afd3e18dd6ca1b732cf40";
const BATCH_SIZE       = 100;
const INDUCTION_DATE   = "March 16, 2026";
const INDUCTION_START_HOUR   = 11;   // 11:00 AM
const INDUCTION_START_MINUTE = 0;
const BATCH_DURATION_MIN     = 45;
const WHATSAPP_LINK    = "https://chat.whatsapp.com/KWeyhV2snif8OLaelLBBWU";
const GMEET_LINK       = "https://meet.google.com/tjt-qkmj-nof";
const TEST_EMAIL       = "pd.webwork@gmail.com";
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    messagesPerConnection: 100,
    rateLimit: 1, // Max 1 msg/sec
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateRefId() {
    const digits = Math.floor(1000 + Math.random() * 9000); // 1000–9999
    return `HC${digits}`;
}

function generateUniqueRefIds(count) {
    const ids = new Set();
    while (ids.size < count) {
        ids.add(generateRefId());
    }
    return Array.from(ids);
}

/** Returns "11:00 AM", "11:45 AM", "12:30 PM", etc. for each batch */
function getBatchTime(batchNumber) {
    const totalMinutes = INDUCTION_START_HOUR * 60 + INDUCTION_START_MINUTE
                       + (batchNumber - 1) * BATCH_DURATION_MIN;
    const endMinutes   = totalMinutes + BATCH_DURATION_MIN;

    function fmt(mins) {
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    }

    return { start: fmt(totalMinutes), end: fmt(endMinutes) };
}

// ─── EMAIL TEMPLATE ──────────────────────────────────────────────────────────

const getHtml = (name, refId, batchNumber, slotStart, slotEnd) => `
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

            /* Induction Box */
            .induction-box { background: linear-gradient(135deg, #fefce8, #fef9c3); border: 1px solid #fde047; border-left: 5px solid #eab308; border-radius: 10px; padding: 22px 28px; margin: 25px 0; }
            .induction-title { color: #92400e; font-size: 17px; font-weight: 800; margin-bottom: 12px; }
            .induction-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 15px; color: #78350f; font-weight: 600; }
            .induction-row span { margin-right: 8px; font-size: 18px; }

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
            .btn-meet { background-color: #00897b; color: #ffffff !important; border: 1px solid #00897b; }

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
                <div class="subtitle">Healthcare Internship Program</div>
            </div>
            <div class="content">
                <div class="greeting">🎉 Congratulations, ${name}!</div>

                <div class="message">
                    We are thrilled to inform you that you have been <strong>selected for the Healthcare Intern (WFH) position</strong> at Aarogya Aadhar!
                    Based on your assessment performance, the management team has decided to <strong>skip the interview round</strong> and proceed directly with your offer.
                </div>

                <!-- Unique Reference ID -->
                <div class="ref-box">
                    <div class="ref-label">Your Unique Healthcare Intern Reference ID</div>
                    <div class="ref-id">${refId}</div>
                </div>

                <!-- Internship Details -->
                <div class="highlight-box">
                    <span class="highlight-title">3-Month Free Healthcare Internship Program</span>
                    <span class="highlight-text">You have been selected for our <strong>3-Month Internship Program</strong>. This is a performance-based opportunity — interns who demonstrate strong skills and dedication will be offered a <strong>Full-Time position</strong> at the end of the internship.</span>
                    <br/>
                    <span class="date-badge">🗓️ Starts from March 16, 2026</span>
                </div>

                <!-- Induction Meeting Details -->
                <div class="induction-box">
                    <div class="induction-title">📋 Induction Program Details</div>
                    <div class="induction-row"><span>📅</span> Date: <strong>&nbsp;${INDUCTION_DATE}</strong></div>
                    <div class="induction-row"><span>🧑‍🤝‍🧑</span> Your Batch: <strong>&nbsp;Batch ${batchNumber}</strong></div>
                    <div class="induction-row"><span>⏰</span> Time Slot: <strong>&nbsp;${slotStart} – ${slotEnd}</strong></div>
                    <div class="induction-row"><span>🎥</span> Platform: <strong>&nbsp;Google Meet</strong></div>
                    <p style="margin-top:14px; font-size:13px; color:#92400e;">Please be present <strong>on time</strong> for your batch. The session is 45 minutes long.</p>
                    <div style="text-align:center; margin-top:14px;">
                        <a href="${GMEET_LINK}" class="btn btn-meet">🎥 Join Google Meet</a>
                    </div>
                </div>

                <p><strong>Program Details:</strong></p>
                <ul class="details-list">
                    <li><strong>Role:</strong> Healthcare Intern – Work From Home</li>
                    <li><strong>Duration:</strong> 3 Months (Starting March 16, 2026)</li>
                    <li><strong>Nature:</strong> Free Internship with Full-Time Offer on Performance</li>
                    <li><strong>Your Batch:</strong> Batch ${batchNumber} — Induction on ${INDUCTION_DATE} at ${slotStart}</li>
                    <li><strong>Your Ref ID:</strong> ${refId} — use this for all official communication</li>
                    <li><strong>Availability:</strong> Must be available for full-time engagement during internship</li>
                </ul>

                <!-- Register Button -->
                <div class="btn-group">
                    <a href="https://team.aarogyaaadhar.com/register" class="btn btn-primary">📝 Register &amp; Submit Documents</a>
                </div>

                <!-- WhatsApp Group -->
                <div class="whatsapp-box">
                    <div class="whatsapp-title">📱 Join Our Healthcare Intern WhatsApp Group</div>
                    <p style="color:#475569; font-size:14px; margin-bottom:14px;">Stay connected with your batch mates and get all important updates instantly by joining our official WhatsApp group.</p>
                    <a href="${WHATSAPP_LINK}" class="btn btn-whatsapp">Join WhatsApp Group</a>
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
                <div class="footer-text">Welcome to the Team — Aarogya Aadhar Healthcare Intern Batch 2026!</div>
                <div class="company-info">&copy; 2026 Aarogya Aadhar. All rights reserved.</div>
            </div>
        </div>
    </body>
    </html>
`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    const args      = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isTest    = args.includes('--test');

    try {
        // ── TEST MODE ──────────────────────────────────────────────────────────
        if (isTest) {
            const testRefId = generateRefId();
            const testBatch = 1;
            const { start, end } = getBatchTime(testBatch);

            console.log(`\n🧪 Sending TEST email to: ${TEST_EMAIL}...`);
            console.log(`   Sample Ref ID  : ${testRefId}`);
            console.log(`   Sample Batch   : Batch ${testBatch} (${start} – ${end})`);

            await transporter.sendMail({
                from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: TEST_EMAIL,
                subject: "🎉 [TEST] Congratulations! You're Selected as Healthcare Intern – Aarogya Aadhar",
                html: getHtml("Test Candidate", testRefId, testBatch, start, end)
            });

            console.log(`✅ Test email sent to ${TEST_EMAIL}`);
            console.log(`\n👉 Review the email, then run with --execute to send to all Healthcare Intern candidates.`);
            return;
        }

        // ── FIND CANDIDATES ────────────────────────────────────────────────────
        console.log(`\n🔍 Finding Healthcare Intern applicants for job: ${HC_JOB_ID}...`);

        const eligibleUsers = await prisma.user.findMany({
            where: {
                jobPostId: HC_JOB_ID,
                responses: { some: {} },         // must have written the exam
                examStatus: { not: 'HIRED' }      // not already hired
            },
            select: {
                id: true,
                name: true,
                email: true,
                examStatus: true,
                responses: {
                    select: { id: true, score: true }
                }
            },
            orderBy: { createdAt: 'asc' }    // first-applied = first batch
        });

        if (eligibleUsers.length === 0) {
            console.log("\n✅ No eligible candidates found (all may already be HIRED or none have written the exam).");
            return;
        }

        const totalBatches = Math.ceil(eligibleUsers.length / BATCH_SIZE);
        console.log(`\n📋 Found ${eligibleUsers.length} eligible candidate(s).`);
        console.log(`   Batches: ${totalBatches} (${BATCH_SIZE} per batch)`);

        // Show batch schedule
        console.log(`\n📅 Induction Schedule — ${INDUCTION_DATE}:`);
        for (let b = 1; b <= totalBatches; b++) {
            const { start, end } = getBatchTime(b);
            const from = (b - 1) * BATCH_SIZE + 1;
            const to   = Math.min(b * BATCH_SIZE, eligibleUsers.length);
            console.log(`   Batch ${b}: ${start} – ${end}  (candidates ${from}–${to})`);
        }

        // ── DRY RUN ──────────────────────────────────────────────────────────
        if (!isExecute) {
            console.log("\n⚠️  DRY RUN — No database changes made, no emails sent.");
            console.log("   Run with --execute to mark as HIRED and send congratulations emails.");
            console.log("\nSample candidates (first 5):");
            eligibleUsers.slice(0, 5).forEach((u, i) => {
                const batch = Math.ceil((i + 1) / BATCH_SIZE);
                console.log(`   - ${u.name} <${u.email}> | Batch ${batch} | Status: ${u.examStatus}`);
            });
            return;
        }

        // ── EXECUTE MODE ──────────────────────────────────────────────────────
        console.log(`\n🚀 Starting bulk HIRE update & email sending...`);
        console.log(`   Target: ${eligibleUsers.length} candidate(s)\n`);
        await new Promise(r => setTimeout(r, 2000));

        // Generate unique ref IDs for everyone
        const refIds = generateUniqueRefIds(eligibleUsers.length);

        let successCount = 0;
        let failCount    = 0;
        const scores     = [7, 8, 9];

        for (let i = 0; i < eligibleUsers.length; i++) {
            const user      = eligibleUsers[i];
            const refId     = refIds[i];
            const userName  = user.name || "Candidate";
            const batchNum  = Math.ceil((i + 1) / BATCH_SIZE);
            const { start, end } = getBatchTime(batchNum);

            try {
                // Update scores for responses that are missing one
                for (const response of user.responses) {
                    if (response.score === null || response.score === undefined) {
                        const randomScore = scores[Math.floor(Math.random() * scores.length)];
                        await prisma.response.update({
                            where: { id: response.id },
                            data: { score: randomScore }
                        });
                    }
                }

                // Update user status to HIRED
                await prisma.user.update({
                    where: { id: user.id },
                    data: { examStatus: "HIRED" }
                });

                // Send congratulations email
                await transporter.sendMail({
                    from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "🎉 Congratulations! You're Selected as Healthcare Intern – Aarogya Aadhar",
                    html: getHtml(userName, refId, batchNum, start, end)
                });

                console.log(`✅ [${i + 1}/${eligibleUsers.length}] ${userName} <${user.email}> → Ref: ${refId} | Batch ${batchNum} | ${start}–${end}`);
                successCount++;

                // Rate limit: 1 email/second
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
