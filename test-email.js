require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

async function main() {
  const to = 'pd.webwork@gmail.com';
  const candidateName = 'Test Candidate';
  const date = 'August 21, 2024';
  const time = '7:00 PM - 7:10 PM';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #0056b3;">Interview Invitation - Livo Aarogya Aadhar PVT LTD</h2>
        <p>Dear ${candidateName},</p>
        <p>Congratulations! Based on your recent assessment, we are pleased to invite you to an online interview for the position you applied for.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 0;"><strong>Time:</strong> ${time}</p>
            <p style="margin: 0;"><strong>Duration:</strong> 10 minutes</p>
            <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="#">Google Meet / Zoom Link</a></p>
        </div>

        <p>Please ensure you join the meeting on time and have a stable internet connection.</p>
        <p>If you have any questions or need to reschedule, please reply to this email.</p>
        
        <br>
        <p>Best regards,</p>
        <p><strong>Recruitment Team</strong><br>Livo Aarogya Aadhar PVT LTD</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Livo Aarogya Aadhar PVT LTD Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject: "Interview Invitation - Livo Aarogya Aadhar PVT LTD",
      html
    });
    console.log("Email sent successfully: ", info.messageId);
  } catch(e) {
    console.error("Error: ", e);
  }
}

main();
