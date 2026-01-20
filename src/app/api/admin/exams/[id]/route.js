import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: true }
    });
    
    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // 1. Delete all responses linked to this exam
    await prisma.response.deleteMany({
      where: { examId: id }
    });

    // 2. Unlink any JobPosts linked to this exam (set examId to null)
    await prisma.jobPost.updateMany({
      where: { examId: id },
      data: { examId: null }
    });

    // 3. Finally, delete the exam
    await prisma.exam.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Exam delete error:", error);
    return NextResponse.json({ error: "Failed to delete exam", details: error.message }, { status: 500 });
  }

}
