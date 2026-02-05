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
    rateLimit: 1, // Max 1 message per second
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
});

// Email Template Generator
const getHtml = (name, jobTitle) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333333; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #22c55e; }
            
            /* Header with Logo */
            .header { background: linear-gradient(to bottom, #ffffff, #f9fafb); padding: 35px 20px 15px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .logo-img { height: 75px; margin-bottom: 12px; }
            .brand-name { color: #166534; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
            .subtitle { color: #0e5dcc; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; font-weight: 700; }
            
            .content { padding: 25px 35px 40px; }
            .greeting { font-size: 24px; font-weight: 800; margin-bottom: 20px; color: #1e293b; letter-spacing: -0.5px; }
            .message { font-size: 16px; line-height: 1.65; color: #475569; margin-bottom: 20px; }
            
            /* Internship Highlight */
            .highlight-box { background-color: #f0fdf4; border: 1px solid #dcfce7; border-left: 5px solid #22c55e; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .highlight-title { color: #15803d; font-weight: 800; font-size: 19px; margin-bottom: 8px; display: block; }
            .highlight-text { color: #166534; font-size: 16px; font-weight: 500; }
            .date-badge { display: inline-block; background-color: #166534; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

            .details-list { margin: 20px 0; padding-left: 0; list-style: none; }
            .details-list li { margin-bottom: 12px; color: #475569; padding-left: 24px; position: relative; font-weight: 500; }
            .details-list li::before { content: "•"; color: #22c55e; font-weight: bold; font-size: 20px; position: absolute; left: 0; top: -4px; }

            /* Buttons */
            .btn-group { text-align: center; margin: 35px 0; }
            .btn { display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; transition: all 0.3s ease; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
            .btn-primary { background-color: #007bff; color: #ffffff !important; border: 1px solid #007bff; }
            .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); opacity: 0.95; }
            
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
                 <!-- Main Logo -->
                 <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png" alt="Aarogya Aadhar" class="logo-img" />
                 <div class="subtitle">Healthcare Internship</div>
            </div>
            <div class="content">
                <div class="greeting">Congratulations, ${name}!</div>
                
                <div class="message">
                    We are pleased to inform you that you have been selected for the <strong>${jobTitle}</strong> position. 
                    Based on your assessment score, the management team has decided to proceed directly with your offer.
                    <strong>We have decided to skip your interview round</strong>.
                </div>

                <div class="highlight-box">
                    <span class="highlight-title">Free Internship Program</span>
                    <span class="highlight-text">You have been selected for our 3-Month Internship Program.</span>
                    <br/>
                    <span class="date-badge">Starts from 16th Feb</span>
                </div>

                <div class="message">
                    This is a unique opportunity where we will be evaluating performance closely. 
                    <strong>We will be hiring 50 candidates as Full-Time Employees</strong> from this batch upon successful completion.
                </div>

                <p><strong>Program Requirements & Expectations:</strong></p>
                <ul class="details-list">
                    <li><strong>Duration:</strong> 3 Months</li>
                    <li><strong>Availability:</strong> Must be available for full-time engagement.</li>
                    <li><strong>Scope:</strong> Includes field work and core project tasks.</li>
                    <li><strong>Collaboration:</strong> High level of cooperation and task adherence is expected.</li>
                </ul>

                <!-- CTA Button -->
                <div class="btn-group">
                    <a href="https://team.aarogyaaadhar.com/register" class="btn btn-primary">Register & Submit Documents</a>
                </div>

                <div class="message">
                    You will receive your official Offer Letter and Joining details shortly via email. We look forward to having you on board!
                </div>

                <div class="important-note">
                    ⚠️ Please DO NOT reply to all recipients on this email. This is an automated notification.
                </div>
            </div>
            <div class="footer">
                <!-- Partner Logos -->
                <div class="footer-logos">
                    <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636568/6bdabdf5-194a-4cac-a00d-e174147561a8.png" alt="Partner 1" class="partner-logo"/>
                    <img src="https://res.cloudinary.com/dorreici1/image/upload/v1761822292/31712b9dcb3dd72cc635256117eb2f75af4ba69a_ew2h8z.png" alt="Partner 2" class="partner-logo"/>
                    <img src="https://res.cloudinary.com/dorreici1/image/upload/v1763636613/9038662b-9ff4-43f9-84be-06aa4ef1a090.png" alt="Partner 3" class="partner-logo"/>
                </div>
                <div class="footer-text">Welcome to the team!</div>
                <div class="company-info">&copy; 2023 Aarogya Aadhar. All rights reserved.</div>
            </div>
        </div>
    </body>
    </html>
`;

async function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isTest = args.includes('--test');

    const TEST_EMAILS = ["phd.drshubham@gmail.com", "abhishekpuranikpd@gmail.com", "pd.webwork@gmail.com"];

    try {
        // Fetch default job title and ID safely
        let defaultJobTitle = "Internship";
        let defaultJobId = null;

        try {
            const allJobs = await prisma.jobPost.findMany();
            if (allJobs.length > 0) {
                defaultJobTitle = allJobs[0].title;
                defaultJobId = allJobs[0].id;
            }
        } catch (e) {
            console.log("⚠️ Could not fetch jobs from DB, using default title.");
        }

        console.log(`ℹ️  Using Job Title: "${defaultJobTitle}"`);

        // --- TEST MODE ---
        if (isTest) {
            console.log(`🧪 Sending TEST emails to: ${TEST_EMAILS.join(', ')}...`);
            
            for (const email of TEST_EMAILS) {
                await transporter.sendMail({
                    from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: email,
                    subject: "Congratulations! You're Selected - Aarogya Aadhar",
                    html: getHtml("Test Candidate", defaultJobTitle)
                });
                console.log(`✅ Test email sent to ${email}`);
            }
            return;
        }

        // --- BULK MODE ---
        console.log("🔍 Finding candidates...");

        const users = await prisma.user.findMany({
            where: {
                responses: { some: {} },
                NOT: {
                    examStatus: 'HIRED'
                }
            },
            include: {
                responses: true
            }
        });

        if (users.length === 0) {
            console.log("No eligible candidates found for update.");
            return;
        }

        console.log(`📋 Found ${users.length} eligible candidates.`);

        if (!isExecute) {
            console.log("\n⚠️  This is a DRY RUN. No emails will be sent and no database changes made.");
            console.log("   Run with --execute to perform the update.");
            
            console.log("\nSample candidates:");
            users.slice(0, 5).forEach(u => {
                const response = u.responses[0]; // Simplification needs robust finding
                const currentScore = response ? response.score : "No Response";
                console.log(` - ${u.name} (${u.email}) | Current Score: ${currentScore} -> Will update to HIRED & Assign Random Score (if missing)`);
            });
            return;
        }

        console.log("🚀 Starting Bulk Update & Email Sending...");
        console.log(`Target: ${users.length} users`);
        
        await new Promise(r => setTimeout(r, 2000));

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
             const subject = "Congratulations! You're Selected - Aarogya Aadhar";
             const html = getHtml(user.name, defaultJobTitle);

             try {
                // Determine missing score and update
                const responses = user.responses;
                if (responses && responses.length > 0) {
                    // Get latest response or relevant one
                    // Assuming we update the first one we find for now, or the one matching the job would be better
                    // But simplified: check if ANY response needs a score
                    // The user said: "if not having score then add random 6,7,8"
                    
                    // Logic: Update ALL responses that have no score? Or just one?
                    // Let's update the first one found that has no score.
                    for (const response of responses) {
                        if (response.score === null || response.score === undefined) {
                            const randomScore = [6, 7, 8][Math.floor(Math.random() * 3)];
                            await prisma.response.update({
                                where: { id: response.id },
                                data: { score: randomScore }
                            });
                             // console.log(`   -> Updated score to ${randomScore} for response ${response.id}`);
                        }
                    }
                }

                 // Update User Status
                 await prisma.user.update({
                     where: { id: user.id },
                     data: { examStatus: 'HIRED' } 
                 });

                 // Send Email
                 await transporter.sendMail({
                     from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                     to: user.email,
                     subject: subject,
                     html: html
                 });
                 
                 process.stdout.write(`.`);
                 successCount++;
                 // Rate limit
                 await new Promise(r => setTimeout(r, 200));

             } catch (err) {
                 console.error(`\n❌ Failed to process ${user.email}:`, err.message);
                 failCount++;
             }
        }

        console.log(`\n\n🎉 Process Complete.`);
        console.log(`Successful: ${successCount}`);
        console.log(`Failed: ${failCount}`);

    } catch (error) {
        console.error("Fatal Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
