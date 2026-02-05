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

// Email Template (Same as bulk_hire_update_score.js)
const getHtml = (name, jobTitle) => `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333333; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #22c55e; }
            
            .header { background: linear-gradient(to bottom, #ffffff, #f9fafb); padding: 35px 20px 15px; text-align: center; border-bottom: 1px solid #f1f5f9; }
            .logo-img { height: 75px; margin-bottom: 12px; }
            .subtitle { color: #0e5dcc; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; font-weight: 700; }
            
            .content { padding: 25px 35px 40px; }
            .greeting { font-size: 24px; font-weight: 800; margin-bottom: 20px; color: #1e293b; letter-spacing: -0.5px; }
            .message { font-size: 16px; line-height: 1.65; color: #475569; margin-bottom: 20px; }
            
            .highlight-box { background-color: #f0fdf4; border: 1px solid #dcfce7; border-left: 5px solid #22c55e; padding: 25px; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .highlight-title { color: #15803d; font-weight: 800; font-size: 19px; margin-bottom: 8px; display: block; }
            .highlight-text { color: #166534; font-size: 16px; font-weight: 500; }
            .date-badge { display: inline-block; background-color: #166534; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

            .details-list { margin: 20px 0; padding-left: 0; list-style: none; }
            .details-list li { margin-bottom: 12px; color: #475569; padding-left: 24px; position: relative; font-weight: 500; }
            .details-list li::before { content: "•"; color: #22c55e; font-weight: bold; font-size: 20px; position: absolute; left: 0; top: -4px; }

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

const CORRECTIONS = [
    { old: "yaishrajawat08@gmail.in", target: "yaishrajawat08@gmail.com" },
    { old: "drsantwanapayasi276@gmail.cokm", target: "drsantwanapayasi276@gmail.com" },
    { old: "isha1.9majumderr@gmail.com", target: "ishamajumderr1.9@gmail.com" }
];

async function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');

    try {
        let defaultJobTitle = "Internship";
        try {
            const allJobs = await prisma.jobPost.findMany();
            if (allJobs.length > 0) defaultJobTitle = allJobs[0].title;
        } catch (e) {
             console.log("No job found, default to Internship");
        }

        console.log("Checking for bounced users...");

        for (const { old, target } of CORRECTIONS) {
            console.log(`\n------------------------------------------------`);
            console.log(`Processing: ${old} -> ${target}`);

            // 1. Try to find by OLD (Typos) email to fix
            let user = await prisma.user.findUnique({
                where: { email: old },
                include: { responses: true }
            });

            if (user) {
                console.log(`✅ Found user by OLD email: ${user.email}`);
                if (isExecute) {
                    try {
                        const updated = await prisma.user.update({
                            where: { id: user.id },
                            data: { email: target }
                        });
                        console.log(`   -> Updated email to ${target}`);
                        user = { ...updated, responses: user.responses }; // Update local user object
                    } catch (e) {
                         if (e.code === 'P2002') { // Unique constraint violation
                            console.log(`   ⚠️ Cannot update email. Target email ${target} ALREADY EXISTS. Switching to target user.`);
                            user = await prisma.user.findUnique({ where: { email: target }, include: { responses: true } });
                         } else {
                             throw e;
                         }
                    }
                } else {
                    console.log(`   -> [DRY RUN] Would update email to ${target}`);
                }
            } else {
                // 2. Try to find by TARGET email (maybe already fixed?)
                console.log(`❌ User NOT found by OLD email. Checking target: ${target}`);
                user = await prisma.user.findUnique({
                    where: { email: target },
                    include: { responses: true }
                });

                if (user) {
                    console.log(`✅ Found user by TARGET email: ${target}`);
                } else {
                    console.log(`❌ User NOT found by Target email either. Skipping.`);
                    continue;
                }
            }

            // At this point we have the 'user' object (either from old updated, or target).
            // Now Update Status, Score, and Send Email

            if (isExecute) {
                // Update Score if missing
                if (user.responses && user.responses.length > 0) {
                     for (const r of user.responses) {
                        if (r.score === null || r.score === undefined) {
                            const randomScore = [6, 7, 8][Math.floor(Math.random() * 3)];
                            await prisma.response.update({ where: { id: r.id }, data: { score: randomScore }});
                            console.log(`   -> Assigned random score: ${randomScore}`);
                        }
                     }
                }

                // Update Status
                await prisma.user.update({
                    where: { id: user.id },
                    data: { examStatus: 'HIRED' }
                });
                console.log(`   -> Status updated to HIRED`);

                // Send Email
                console.log(`   -> Sending email to ${target}...`);
                await transporter.sendMail({
                    from: `"Aarogya Aadhar HR" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                    to: target,
                    subject: "Congratulations! You're Selected - Aarogya Aadhar",
                    html: getHtml(user.name || "Candidate", defaultJobTitle)
                });
                console.log(`   -> ✅ Email SENT.`);

            } else {
                 console.log(`   -> [DRY RUN] Would update status to HIRED, valid score, and send email.`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
