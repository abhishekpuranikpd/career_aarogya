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

    // Check if user has already taken this exam AND has access
    const session = await getServerSession(authOptions);
    let completed = false;

    if (session && session.user) {
       // Fetch user along with job post info to verify access
       const user = await prisma.user.findUnique({ 
          where: { email: session.user.email },
          include: { jobPost: true }
       });

       if (user) {
          // 1. Strict Access Control: Must be applied to a job linked to this exam
          // OR be an admin (admins can view all)
          if (session.user.role !== 'admin') {
              if (!user.jobPost || user.jobPost.examId !== id) {
                 return NextResponse.json({ error: "Access Denied: You have not applied for the position linked to this exam." }, { status: 403 });
              }
          }

    // 3. Time Window Check (for non-admins)
          if (session.user.role !== 'admin') {
              const now = new Date();
              const start = exam.windowStart ? new Date(exam.windowStart) : null;
              const end = exam.windowEnd ? new Date(exam.windowEnd) : null;

              if (start && now < start) {
                  // Exam hasn't started. Hide questions.
                  const { questions, ...safeExam } = exam;
                  return NextResponse.json({ ...safeExam, questions: [], completed });
              }
              
              if (end && now > end) {
                  // Exam expired. Hide questions.
                  const { questions, ...safeExam } = exam;
                  return NextResponse.json({ ...safeExam, questions: [], completed, expired: true });
              }
          }

          // 2. Check for completion (moved here to keep flow)
          const response = await prisma.response.findFirst({
             where: {
                userId: user.id,
                examId: id
             }
          });
          if (response) completed = true;
       }
    } else {
        // If not logged in, they definitely can't write it
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ ...exam, completed });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { windowStart, windowEnd, title } = body;

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        ...(title && { title }),
        windowStart: windowStart ? new Date(windowStart) : (windowStart === null ? null : undefined),
        windowEnd: windowEnd ? new Date(windowEnd) : (windowEnd === null ? null : undefined),
      }
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("Exam update error:", error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}
