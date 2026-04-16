import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/auth/forgot-pin?email=... → returns security question
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { pinQuestion: true, pin: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 404 });
    }

    if (!user.pin || !user.pinQuestion) {
      return NextResponse.json({ error: 'No PIN set for this account. Please contact support.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, pinQuestion: user.pinQuestion });
  } catch (error) {
    console.error('Forgot PIN GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/auth/forgot-pin → verify answer + set new PIN
export async function POST(req) {
  try {
    const { email, pinAnswer, newPin } = await req.json();

    if (!email || !pinAnswer || !newPin) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: 'New PIN must be exactly 4 digits' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.pinAnswer) {
      return NextResponse.json({ error: 'User not found or no security question set' }, { status: 404 });
    }

    const isAnswerCorrect = await bcrypt.compare(pinAnswer.toLowerCase().trim(), user.pinAnswer);
    if (!isAnswerCorrect) {
      return NextResponse.json({ error: 'Incorrect security answer' }, { status: 401 });
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);

    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: { pin: hashedNewPin },
    });

    return NextResponse.json({ success: true, message: 'PIN reset successfully' });
  } catch (error) {
    console.error('Forgot PIN POST error:', error);
    return NextResponse.json({ error: 'Failed to reset PIN' }, { status: 500 });
  }
}
