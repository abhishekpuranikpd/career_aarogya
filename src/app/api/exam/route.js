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
    const { title, type, questions } = body;
    
    const exam = await prisma.exam.create({
      data: {
        title,
        type, 
        questions
      }
    });

    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating exam' }, { status: 500 });
  }
}
