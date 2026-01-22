import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter, mailOptions } from '@/lib/email';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, mobile, resumeUrl, position, jobPostId, password } = data; 

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: 'User already registered' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        resumeUrl,
        positionApplied: position,
        jobPostId: jobPostId || null,
        password: password // In prod, hash this!
      },
      include: {
        jobPost: true // Include job post to check for linked exam
      }
    });

    // Check for linked exam
    let nextStep = "/exam"; // Default
    if (user.jobPost && user.jobPost.examId) {
      nextStep = `/exam/${user.jobPost.examId}`;
    }

    // Send email
    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: `Registration Successful - Aarogya Aadhar`,
      text: `Dear ${name},\n\nThank you for registering for the ${position} position at Aarogya Aadhar. Your application ID is ${user.id}.\n\nPlease proceed to the mandatory assessment here: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://career.aarogyaaadhar.com'}/dashboard\n\nRegards,\nAarogya Aadhar Team`,
      html: `<h1>Registration Successful</h1><p>Dear ${name},</p><p>Thank you for registering for the <strong>${position}</strong> position at Aarogya Aadhar.</p><p>Your application ID is: <strong>${user.id}</strong></p><p>You must now complete the online assessment to finalize your application.</p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://career.aarogyaaadhar.com'}/dashboard" style="background-color:#1e40af;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Start Assessment</a></p><br/><p>Regards,<br/>Aarogya Aadhar Team</p>`,
    });

    // Clear OTP
    await prisma.verificationCode.delete({ where: { email } });

    return NextResponse.json({ success: true, user, redirectUrl: nextStep });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
