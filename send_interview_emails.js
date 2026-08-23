require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

function getInterviewEmailTemplate(candidateName, date, time) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #0056b3;">
            <img src="cid:companyLogo" alt="Aarogya Aadhar Logo" style="max-height: 80px;" />
        </div>
        <div style="padding: 30px;">
            <h2 style="color: #0056b3; margin-top: 0;">Interview Invitation</h2>
            <p>Dear ${candidateName},</p>
            <p>Congratulations! Based on your recent assessment, we are pleased to invite you to an online interview with <strong>Aarogya Aadhar</strong>.</p>
            
            <div style="background: #f1f8ff; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #0056b3;">
                <p style="margin: 0 0 10px 0;"><strong>📅 Date:</strong> ${date}</p>
                <p style="margin: 0 0 10px 0;"><strong>⏰ Time:</strong> ${time}</p>
                <p style="margin: 0 0 10px 0;"><strong>⏳ Duration:</strong> 10 minutes</p>
                <p style="margin: 0;"><strong>🔗 Meeting Link:</strong> <a href="https://meet.google.com/ddi-fnmc-gdu" style="color: #0056b3; text-decoration: underline;">https://meet.google.com/ddi-fnmc-gdu</a></p>
            </div>

            <p>Please ensure you join the meeting a few minutes early to test your audio and video connections.</p>
            <p>If you have any questions or require any assistance, please reply directly to this email.</p>
            
            <br>
            <p style="margin-bottom: 5px;">Best regards,</p>
            <p style="margin-top: 0;"><strong>Recruitment Team</strong><br>Aarogya Aadhar</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            &copy; ${new Date().getFullYear()} Aarogya Aadhar. All rights reserved.
        </div>
    </div>
  `;
}

async function sendEmailToCandidate(to, candidateName, date, time) {
  const html = getInterviewEmailTemplate(candidateName, date, time);
  const logoPath = path.join(__dirname, 'public', 'logo.png');

  try {
    const info = await transporter.sendMail({
      from: `"Aarogya Aadhar Careers" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to,
      subject: "Interview Invitation - Aarogya Aadhar",
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'companyLogo'
        }
      ]
    });
    console.log(`Email sent to ${to} successfully: `, info.messageId);
    return true;
  } catch(e) {
    console.error(`Error sending email to ${to}: `, e);
    return false;
  }
}

async function main() {
  await sendEmailToCandidate('pd.webwork@gmail.com', 'Test Candidate', 'August 21, 2024', '7:00 PM - 7:10 PM');
}

if (require.main === module) {
  main();
}

module.exports = { sendEmailToCandidate };
