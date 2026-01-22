import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, attachments }) => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
      console.warn("⚠️ SMTP Credentials missing. Email process skipped.");
      console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
      return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Aarogya Aadhar Careers" <${user}>`,
      to,
      subject,
      html,
      attachments
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
