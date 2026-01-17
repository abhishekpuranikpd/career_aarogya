import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, imageUrl, location, type, salary, examId } = body;

    const job = await prisma.jobPost.create({
      data: {
        title,
        description,
        imageUrl,
        location,
        type,
        salary,
        examId: examId || null
      }
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json({ error: "Failed to create job post" }, { status: 500 });
  }
}

export async function GET(req) {
  // Fetch active jobs for admin list (or public, but this route is in /admin/ so maybe restricted? 
  // actually typical next.js pattern: generic jobs route should be /api/jobs, admin specific /api/admin/jobs usually implies authed.
  // Let's implement Admin List here.
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.jobPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { exam: true }
  });
  
  return NextResponse.json(jobs);
}
