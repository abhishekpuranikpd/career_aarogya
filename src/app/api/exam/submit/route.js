import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = session.user;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { examId, answers } = body;

    const response = await prisma.response.create({
      data: {
        userId: user.id,
        examId,
        answers
      }
    });

    // Update user exam status
    await prisma.user.update({
      where: { id: userId },
      data: { examStatus: 'COMPLETED' }
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error submitting exam' }, { status: 500 });
  }
}
