import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if user has already taken this exam
    const session = await getServerSession(authOptions);
    let completed = false;

    if (session && session.user) {
       // We need to fetch the User ID from email since session might just have email
       const user = await prisma.user.findUnique({ where: { email: session.user.email }});
       if (user) {
          const response = await prisma.response.findFirst({
             where: {
                userId: user.id,
                examId: id
             }
          });
          if (response) completed = true;
       }
    }

    return NextResponse.json({ ...exam, completed });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}
