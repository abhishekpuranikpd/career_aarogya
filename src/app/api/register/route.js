import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter, mailOptions } from '@/lib/email';

// Generate unique reference ID
async function generateReferenceId(prefix = 'AA') {
  const safePrefix = (prefix || 'AA').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'AA';
  let referenceId;
  let attempts = 0;
  do {
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    referenceId = `${safePrefix}${digits}`;
    const existing = await prisma.user.findFirst({ where: { referenceId } });
    if (!existing) break;
    attempts++;
  } while (attempts < 20);
  return referenceId;
}

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

    // Fetch job post for prefix, WhatsApp link, and dates
    let jobPost = null;
    if (jobPostId) {
      jobPost = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    }

    const prefix = jobPost?.referenceIdPrefix || 'AA';
    const referenceId = await generateReferenceId(prefix);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        resumeUrl,
        positionApplied: position,
        jobPost: jobPostId ? { connect: { id: jobPostId } } : undefined,
        password: password,
        referenceId,
      },
      include: {
        jobPost: true
      }
    });

    // Send welcome email
    try {
      await transporter.sendMail({
        ...mailOptions,
        to: email,
        subject: `Registration Successful - Livo Aarogya Aadhar PVT LTD`,
        text: `Dear ${name},\n\nThank you for registering for the ${position} position at Livo Aarogya Aadhar PVT LTD. Your Reference ID is ${referenceId}.\n\nPlease proceed to the dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://career.aarogyaaadhar.com'}/dashboard\n\nRegards,\nLivo Aarogya Aadhar Team`,
        html: `<h1>Registration Successful</h1><p>Dear ${name},</p><p>Thank you for registering for the <strong>${position}</strong> position at Livo Aarogya Aadhar PVT LTD.</p><p>Your Reference ID is: <strong>${referenceId}</strong></p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://career.aarogyaaadhar.com'}/dashboard" style="background-color:#1e40af;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Go to Dashboard</a></p><br/><p>Regards,<br/>Livo Aarogya Aadhar Team</p>`,
      });
    } catch (emailErr) {
      console.error('Email error (non-fatal):', emailErr);
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, positionApplied: user.positionApplied },
      referenceId,
      whatsappGroupLink: jobPost?.whatsappGroupLink || null,
      applicationStartDate: jobPost?.applicationStartDate || null,
      examStartDate: jobPost?.examStartDate || null,
      resultDate: jobPost?.resultDate || null,
      inductionDate: jobPost?.inductionDate || null,
      joiningDate: jobPost?.joiningDate || null,
      applicationProcess: jobPost?.applicationProcess || null,
      jobType: jobPost?.type || null,
      jobLocation: jobPost?.location || null,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
