import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobPostId, position } = await req.json();

    if (!jobPostId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    // Update user with new job application
    // Note: detailed schema might want a separate Applications table, but adhering to current schema:
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        jobPostId: jobPostId,
        positionApplied: position,
        examStatus: 'PENDING', // Reset status for new application
        // We might want to clear old responses if strictly 1 active application, 
        // but let's keep history in Responses table and just reset status.
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
