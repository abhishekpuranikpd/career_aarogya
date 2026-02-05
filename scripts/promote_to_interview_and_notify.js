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

async function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isTest = args.includes('--test');

    const TEST_EMAIL = "abhishekpuranikpd@gmail.com";

    // Email Template Generator - Dark Mode Replica
    const getHtml = (name, score) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; }
                .container { max-width: 450px; margin: 20px auto; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333; }
                .header { text-align: center; padding: 30px 20px 10px; }
                .brand-name { color: #4ade80; font-size: 24px; font-weight: bold; margin: 0; }
                .subtitle { color: #9ca3af; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; }
                .content { padding: 30px; }
                .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #ffffff; }
                .message { font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 30px; }
                .highlight { color: #4ade80; font-weight: bold; } /* Green highlight */
                
                .score-card { background-color: #262626; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #333; }
                .score-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 15px; }
                .score-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                .label { font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .value { font-size: 16px; color: #4ade80; font-weight: bold; }
                .status-badge { background-color: #064e3b; color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }

                .next-steps { background-color: #064e3b; padding: 15px; border-radius: 10px; display: flex; align-items: start; margin-top: 20px; }
                .icon { font-size: 20px; margin-right: 15px; }
                .steps-text { font-size: 13px; color: #ecfdf5; line-height: 1.4; }
                
                .footer-text { text-align: center; font-size: 16px; font-weight: bold; margin-top: 30px; margin-bottom: 10px; color: #ffffff; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                     <h1 class="brand-name">Aarogya Aadhar</h1>
                     <div class="subtitle">TALENT ACQUISITION</div>
                </div>
                <div class="content">
                    <div class="greeting">Hello ${name},</div>
                    <div class="message">
                        We've reviewed your assessment for the <span class="highlight">Full Stack Developer Intern</span> position. We are thrilled to share the good news with you!
                    </div>

                    <div class="score-card">
                        <div class="score-row">
                            <span class="label">ASSESSMENT SCORE</span>
                            <span class="value">${score}/10</span>
                        </div>
                        <div class="score-row">
                            <span class="label">APPLICATION STATUS</span>
                            <span class="status-badge">INTERVIEW</span>
                        </div>
                    </div>

                    <div class="next-steps">
                        <span class="icon">🚀</span>
                        <div class="steps-text">
                            <strong>Next Steps:</strong> The interview will be conducted <strong>on call</strong>. Our team will reach out to you shortly.
                        </div>
                    </div>

                    <div class="footer-text">
                        Best of luck!
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        // --- TEST MODE ---
        if (isTest) {
            console.log(`🧪 Sending TEST email with Dark Mode Template to ${TEST_EMAIL}...`);
            const testScore = 6; // Matching image example
            await transporter.sendMail({
                from: `"Aarogya Aadhar Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: TEST_EMAIL,
                subject: "Update on your Application Status - Aarogya Aadhar",
                html: getHtml("Abhishek Puranik", testScore)
            });
            console.log(`✅ Test email sent successfully to ${TEST_EMAIL}`);
            return;
        }

        // --- BULK MODE ---
        console.log("🔍 Finding 'PENDING' users who have written the exam (have a Response)...");

        const users = await prisma.user.findMany({
            where: {
                examStatus: 'PENDING',
                responses: {
                    some: {} 
                }
            },
            include: {
                responses: true
            }
        });

        if (users.length === 0) {
            console.log("No 'PENDING' users found who have written the exam.");
            return;
        }

        console.log(`📋 Found ${users.length} 'PENDING' users who have written the exam.`);

        if (!isExecute) {
            console.log("\n⚠️  This is a DRY RUN. No emails will be sent and no database changes made.");
            console.log("   Run with --execute to perform the update.");
            
            users.slice(0, 5).forEach(u => {
                const randomScore = [6, 7, 8][Math.floor(Math.random() * 3)];
                console.log(` - ${u.name} -> Will Update Status to INTERVIEW | Score: ${randomScore}`);
            });
            return;
        }

        console.log("🚀 Starting Bulk Update & Email Sending...");
        console.log(`Target: ${users.length} users`);
        
        await new Promise(r => setTimeout(r, 2000));

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
             const randomScore = [6, 7, 8][Math.floor(Math.random() * 3)];
             const subject = "Update on your Application Status - Aarogya Aadhar";
             const html = getHtml(user.name, randomScore);

             try {
                 const latestResponse = user.responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

                 if (!latestResponse) {
                     continue;
                 }

                 // Update DB
                 await prisma.$transaction([
                     prisma.response.update({
                         where: { id: latestResponse.id },
                         data: { score: randomScore }
                     }),
                     prisma.user.update({
                         where: { id: user.id },
                         data: { examStatus: 'INTERVIEW' } 
                     })
                 ]);

                 // Send Email
                 await transporter.sendMail({
                     from: `"Aarogya Aadhar Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                     to: user.email,
                     subject: subject,
                     html: html
                 });
                 
                 process.stdout.write(`.`);
                 successCount++;
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
