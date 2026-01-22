
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter, mailOptions } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists based on type
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (type === 'register' && existingUser) {
      return NextResponse.json({ error: 'User already registered with this email' }, { status: 400 });
    }

    if (type === 'login' && !existingUser) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 400 });
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await prisma.verificationCode.upsert({
      where: { email },
      update: {
        code: otp,
        expires
      },
      create: {
        email,
        code: otp,
        expires
      }
    });

    // Send Email
    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: `Your OTP for Aarogya Aadhar (${type === 'login' ? 'Login' : 'Registration'})`,
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Authentication Required</h2>
          <p>Your One-Time Password (OTP) for ${type === 'login' ? 'login' : 'registration'} is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes. Do not share this code with anyone.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
