const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env' }); 
require('dotenv').config({ path: '.env.local' }); 

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

async function sendInvite() {
    try {
        // Fetch One Active Job with an Exam
        const job = await prisma.jobPost.findFirst({
            where: { 
                isActive: true, 
                examId: { not: null } 
            },
            include: { exam: true }
        });

        if (!job) {
            console.error("No active job with an exam found in DB.");
            return;
        }

        const toEmail = "abhishekpuranikpd@gmail.com";
        const subject = `Invitation for Second Round Assessment - ${job.title} | Aarogya Aadhar`;
        
        // Correct Link: Redirect to Register page with Job ID and Title
        const encodedTitle = encodeURIComponent(job.title);
        const examLink = `https://career.aarogyaaadhar.com/register?jobId=${job.id}&title=${encodedTitle}`;
        
        const logoUrl = "https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png";

        // HTML Template
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .header { background: #ffffff; padding: 30px; text-align: center; border-bottom: 2px solid #f1f5f9; }
                .logo-img { max-height: 60px; width: auto; }
                .content { padding: 40px; color: #334155; line-height: 1.6; }
                .h2 { color: #0f172a; margin-top: 0; font-size: 22px; }
                .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 4px; }
                .info-item { margin-bottom: 8px; font-size: 15px; }
                .info-label { font-weight: bold; color: #1e40af; width: 80px; display: inline-block; }
                .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 40px; font-weight: bold; margin-top: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .cta-button:hover { background-color: #1d4ed8; }
                .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="container">
              

                <!-- Main Content -->
                <div class="content">
                    <h2 class="h2">Dear Candidate,</h2>
                    <p>Thank you for your interest in the <strong>${job.title}</strong> position at Aarogya Aadhar. We are pleased to invite you to the second round of our selection process.</p>
                    
                <!-- Banner Image -->
                ${job.imageUrl ? `<div style="margin: 20px 0; border-radius: 8px; overflow: hidden;"><img src="${job.imageUrl}" alt="Job Banner" style="width: 100%; height: auto; object-fit: cover;" /></div>` : ''}

                <!-- Job Details -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #1e293b;">${job.title}</h3>
                    <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">
                        <strong>Location:</strong> ${job.location || 'Remote'} | 
                        <strong>Type:</strong> ${job.type || 'Full-time'}
                    </p>
                    <p style="font-size: 14px; color: #475569;">
                        ${job.description ? job.description.substring(0, 150) + '...' : 'Join our team to make a difference.'}
                    </p>
                    <a href="https://career.aarogyaaadhar.com/careers/${job.id}" style="color: #2563eb; font-size: 14px; text-decoration: none; font-weight: bold;">View Full Job Description &rarr;</a>
                </div>

                <p>You have been shortlisted for an online technical assessment. Please find the details below:</p>

                <!-- Exam Details Box -->
                <!-- Exam Details Box -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #1e293b; margin-bottom: 15px;">Assessment Details</h3>
                    <div style="margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #1e40af; width: 100px; display: inline-block;">Date:</span>
                        <span style="color: #334155;">22nd of this Month</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <span style="font-weight: bold; color: #1e40af; width: 100px; display: inline-block;">Window:</span>
                        <span style="color: #334155;">11:00 AM - 04:00 PM</span>
                    </div>
                    <div>
                        <span style="font-weight: bold; color: #1e40af; width: 100px; display: inline-block;">Test Name:</span>
                        <span style="color: #334155;">${job.exam.title}</span>
                    </div>
                </div>

                <p>The link below will become active during the scheduled window. Please ensure you have a stable connection and a quiet place to take the test and writethe exam in tab or desktop.</p>

                <div style="text-align: center;">
                    <a href="${examLink}" class="cta-button">Start Assessment</a>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <img src="${logoUrl}" alt="Aarogya Aadhar" style="height: 30px; opacity: 0.5; margin-bottom: 10px;">
                <p>&copy; 2030 Aarogya Aadhar. All rights reserved.</p>
                <p>Building the Future of Healthcare.</p>
            </div>
        </div>
    </body>
    </html>
    `;

        const info = await transporter.sendMail({
            from: `"Aarogya Aadhar Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: html
        });
        console.log("✅ Dynamic Invite Sent to", toEmail);
        console.log("Linked Job:", job.title);
        console.log("Exam ID:", job.exam.id);

    } catch (error) {
        console.error("❌ Error sending invite:", error);
    } finally {
        await prisma.$disconnect();
    }
}

sendInvite();
