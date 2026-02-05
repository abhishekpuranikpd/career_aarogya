
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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

async function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');
    const isTest = args.includes('--test');

    const TEST_EMAIL = "abhishekpuranikpd@gmail.com";
    const CSV_FILE = 'recipients_31st_Jan.csv';

    // Email Template Generator - Apology / Correction
    const getHtml = (name, jobTitle, score, status) => `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; }
                .container { max-width: 500px; margin: 20px auto; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #333; }
                .header { text-align: center; padding: 30px 20px 10px; }
                .brand-name { color: #4ade80; font-size: 24px; font-weight: bold; margin: 0; }
                .subtitle { color: #9ca3af; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; }
                .content { padding: 30px; }
                .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #ffffff; }
                .message { font-size: 14px; color: #d1d5db; line-height: 1.6; margin-bottom: 20px; }
                .highlight { color: #4ade80; font-weight: bold; }
                
                .info-box { background-color: #262626; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #333; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 12px 0; border-bottom: 1px solid #333; vertical-align: middle; }
                tr:last-child td { border-bottom: none; }
                .info-label { font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; width: 40%; }
                .info-value { font-size: 14px; color: #ffffff; font-weight: bold; text-align: right; width: 60%; }
                .status-badge { background-color: #064e3b; color: #4ade80; padding: 4px 10px; border-radius: 12px; font-size: 11px; display: inline-block; }

                .noreply-box { background-color: #450a0a; border: 1px solid #991b1b; color: #fca5a5; padding: 10px; text-align: center; font-size: 12px; border-radius: 8px; margin-top: 25px; font-weight: bold; }

                .footer-text { text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px; line-height: 1.4; }
                .signature { margin-top: 20px; font-weight: bold; color: #ffffff; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                     <h1 class="brand-name">Aarogya Aadhar</h1>
                     <div class="subtitle">TALENT ACQUISITION</div>
                </div>
                <div class="content">
                    <div class="greeting">Dear ${name},</div>
                    
                    <div class="message">
                        We are writing to you regarding the application status update email sent earlier. 
                        Due to a technical error, the position mentioned in the previous email was incorrect.
                    </div>

                    <div class="message">
                        We genuinely apologize for any confusion this may have caused. We are pleased to confirm that your application has been reviewed and shortlisted for an interview.
                    </div>

                    <div class="info-box">
                        <table>
                            <tr>
                                <td class="info-label">Applied Position</td>
                                <td class="info-value">${jobTitle}</td>
                            </tr>
                            <tr>
                                <td class="info-label">Assessment Score</td>
                                <td class="info-value">${score !== undefined ? score : 'N/A'}/10</td>
                            </tr>
                            <tr>
                                <td class="info-label">Application Status</td>
                                <td class="info-value"><span class="status-badge">${status || 'INTERVIEW'}</span></td>
                            </tr>
                            <tr>
                                <td class="info-label">Interview Mode</td>
                                <td class="info-value highlight">ON CALL</td>
                            </tr>
                        </table>
                    </div>

                    <div class="message">
                        Our team will reach out to you shortly for the telephonic interview. All the best!
                    </div>

                    <div class="noreply-box">
                        PLEASE DO NOT REPLY TO THIS EMAIL. THIS IS AN AUTOMATED MESSAGE.
                    </div>

                    <div class="footer-text">
                        Thank you for your understanding.<br>
                        <div class="signature">Aarogya Aadhar HR Team</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        // Read CSV
        const csvPath = path.resolve(CSV_FILE);
        if (!fs.existsSync(csvPath)) {
            console.error(`❌ CSV file not found: ${CSV_FILE}`);
            return;
        }

        const csvContent = fs.readFileSync(csvPath, 'utf8');
        const lines = csvContent.split('\n').filter(l => l.trim() !== '');
        const emails = lines.slice(1).map(l => l.split(',')[0].trim()); // Skip header, take email

        console.log(`📋 Found ${emails.length} recipients in CSV.`);

        if (emails.length === 0) {
            console.log("No emails found.");
            return;
        }

        // Fetch user details from DB to get correct Job Title and Score
        const users = await prisma.user.findMany({
            where: {
                email: { in: emails }
            },
            include: {
                jobPost: true,
                responses: true
            }
        });

        console.log(`🔍 Retrieved ${users.length} user records from database.`);

        // Map users for easy access
        const userMap = new Map(users.map(u => [u.email, u]));

        // --- TEST MODE ---
        if (isTest) {
            console.log(`\n🧪 PREPARING TEST EMAIL...`);
            
            // Pick a user who likely has a score
            const sampleUser = users.find(u => u.responses && u.responses.length > 0) || users[0];

            if (!sampleUser) {
                console.error("❌ No users found in DB to generate a test email.");
                return;
            }

            const jobTitle = sampleUser.jobPost?.title || sampleUser.positionApplied || "Your Applied Position";
            
            // Extract latest score
            const latestResponse = sampleUser.responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
            const score = latestResponse ? latestResponse.score : 0;
            const status = sampleUser.examStatus;

            const html = getHtml(sampleUser.name, jobTitle, score, status);

            console.log(`Sending TEST email to ${TEST_EMAIL}`);
            console.log(`(Simulating email for: ${sampleUser.name}, Job: ${jobTitle}, Score: ${score})`);

            await transporter.sendMail({
                from: `"Aarogya Aadhar Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: TEST_EMAIL,
                subject: "Correction: Update on your Application Status - Aarogya Aadhar",
                html: html
            });
            console.log(`✅ Test email sent successfully to ${TEST_EMAIL}`);
            return;
        }

        // --- EXECUTE MODE ---
        if (!isExecute) {
            console.log("\n⚠️  This is a DRY RUN (Safety Mode).");
            console.log("   No emails will be sent.");
            console.log("   Run with --execute to perform the bulk sending.");
            console.log("\nSample of recipients:");

            let sampleCount = 0;
            for (const email of emails) {
                if (sampleCount >= 5) break;
                const user = userMap.get(email);
                if (user) {
                    const jobTitle = user.jobPost?.title || user.positionApplied || "Your Applied Position";
                    const latestResponse = user.responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
                    const score = latestResponse ? latestResponse.score : 0;
                    
                    console.log(` - ${user.name} (${user.email}) -> Job: ${jobTitle} | Score: ${score}`);
                    sampleCount++;
                }
            }
            return;
        }

        console.log("\n🚀 STARTING BULK SENDING...");
        console.log(`Target: ${emails.length} recipients`);
        
        await new Promise(r => setTimeout(r, 2000));

        let successCount = 0;
        let failCount = 0;

        for (const email of emails) {
            const user = userMap.get(email);
            if (!user) {
                console.error(`\n❌ User not found in DB for email: ${email}`);
                failCount++;
                continue;
            }

            const jobTitle = user.jobPost?.title || user.positionApplied || "Your Applied Position";
            const latestResponse = user.responses.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
            const score = latestResponse ? latestResponse.score : 0;
            const status = user.examStatus;

            const html = getHtml(user.name, jobTitle, score, status);

            try {
                await transporter.sendMail({
                    from: `"Aarogya Aadhar Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "Correction: Update on your Application Status - Aarogya Aadhar",
                    html: html
                });
                
                process.stdout.write(`.`);
                successCount++;
                // Rate limit
                await new Promise(r => setTimeout(r, 200));

            } catch (err) {
                console.error(`\n❌ Failed to send to ${user.email}:`, err.message);
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
