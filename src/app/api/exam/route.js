import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const exams = await prisma.exam.findMany();
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching exams' }, { status: 500 });
  }
}

export async function POST(req) {
  // Admin only check should be here or handled by middleware/client logic. 
  // For now, implementing the creation logic.
  try {
    const body = await req.json();
    const { title, type, questions, windowStart, windowEnd } = body;
    
    const exam = await prisma.exam.create({
      data: {
        title,
        type, 
        questions,
        windowStart: windowStart ? new Date(windowStart) : null,
        windowEnd: windowEnd ? new Date(windowEnd) : null
      }
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("EXAM CREATE ERROR:", error);
    return NextResponse.json({ error: 'Error creating exam', details: error.message }, { status: 500 });
  }
}
