import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET Single Job
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: { exam: true }
    });
    
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// UPDATE Job
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const { title, description, imageUrl, location, type, salary, examId, isActive } = body;

    const job = await prisma.jobPost.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        location,
        type,
        salary,
        isActive,
        examId: examId || null
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// DELETE Job
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    // Optional: Check if any applicants exist before deleting?
    // For now, let's allow delete (Cascade might handle relations or we might want to prevent)
    // Prisma schema doesn't seem to set Cascade explicitly on JobPost<>User relation for applicants.
    // Proceeding with delete.
    await prisma.jobPost.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Job delete error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
