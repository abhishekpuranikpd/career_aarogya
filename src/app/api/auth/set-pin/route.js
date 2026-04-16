import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, pin, pinQuestion, pinAnswer } = await req.json();

    if (!email || !pin || !pinQuestion || !pinAnswer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const hashedAnswer = await bcrypt.hash(pinAnswer.toLowerCase().trim(), 10);

    await prisma.user.update({
      where: { email: email.toLowerCase().trim() },
      data: {
        pin: hashedPin,
        pinQuestion,
        pinAnswer: hashedAnswer,
      },
    });

    return NextResponse.json({ success: true, message: 'PIN set successfully' });
  } catch (error) {
    console.error('Set PIN error:', error);
    return NextResponse.json({ error: 'Failed to set PIN' }, { status: 500 });
  }
}
