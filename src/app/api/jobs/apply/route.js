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

    // Check if already applied to THIS job
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { jobPostId: true, responses: true } 
    });

    if (user.jobPostId === jobPostId) {
       return NextResponse.json({ error: "You have already applied for this position." }, { status: 409 });
    }

    // Optional: Check if already applied to ANY job? The schema limits to one active jobPostId.
    // Use `if (user.jobPostId)` to restrict to single active application.
    if (user.jobPostId) {
        // If they want to switch jobs, maybe allow it? 
        // But user said "cant reapply again". Let's assume strict "One Active Application".
        return NextResponse.json({ error: "You already have an active application. Please check your dashboard." }, { status: 409 });
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

    // Auto-sync to external DB if applicable
    const jobPost = await prisma.jobPost.findUnique({ where: { id: jobPostId } });
    if (jobPost && jobPost.externalExamId && jobPost.externalBatchId && process.env.AGENT_DB_URL) {
      try {
        const { MongoClient, ObjectId } = require('mongodb');
        const client = new MongoClient(process.env.AGENT_DB_URL);
        await client.connect();
        const candidateCollection = client.db().collection("ExamCandidate");
        
        const existing = await candidateCollection.findOne({
          examId: new ObjectId(jobPost.externalExamId),
          email: session.user.email
        });
        
        const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

        if (existing) {
          await candidateCollection.updateOne(
            { _id: existing._id },
            { 
              $set: { 
                batchId: new ObjectId(jobPost.externalBatchId),
                pin: generatePin(),
                updatedAt: new Date()
              } 
            }
          );
        } else {
          await candidateCollection.insertOne({
            examId: new ObjectId(jobPost.externalExamId),
            batchId: new ObjectId(jobPost.externalBatchId),
            email: session.user.email,
            pin: generatePin(),
            status: "PENDING",
            hiringStatus: "PENDING",
            warningsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        await client.close();
      } catch (err) {
        console.error("Failed to auto-sync applicant to external DB", err);
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
