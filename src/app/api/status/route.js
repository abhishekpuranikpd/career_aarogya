import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        name: true,
        positionApplied: true,
        examStatus: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Error checking status' }, { status: 500 });
  }
}
