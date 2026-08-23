import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MongoClient, ObjectId } from "mongodb";

const prisma = new PrismaClient();

const generatePin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export async function POST(req, { params }) {
  let client;
  try {
    const { id } = await params; // JobPost ID
    const job = await prisma.jobPost.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { externalExamId, externalBatchId } = body;

    let examIdToUse = externalExamId || job.externalExamId;
    let batchIdToUse = externalBatchId || job.externalBatchId;

    if (!examIdToUse || !batchIdToUse) {
      return NextResponse.json({ error: "Job does not have an external exam/batch attached" }, { status: 400 });
    }

    // Save to DB if provided from frontend
    if (externalExamId || externalBatchId) {
       await prisma.jobPost.update({
          where: { id },
          data: {
             externalExamId: examIdToUse,
             externalBatchId: batchIdToUse
          }
       });
    }

    // Get all applicants for this job
    const applicants = await prisma.user.findMany({
      where: { jobPostId: id }
    });

    if (applicants.length === 0) {
      return NextResponse.json({ message: "No applicants to sync" });
    }

    // Connect to external DB
    const uri = process.env.AGENT_DB_URL;
    if (!uri) {
      return NextResponse.json({ error: "Agent Database URL not configured" }, { status: 500 });
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    const candidateCollection = db.collection("ExamCandidate");

    let syncedCount = 0;

    for (const applicant of applicants) {
      const email = applicant.email;
      if (!email) continue;

      // Check if candidate already exists
      const existing = await candidateCollection.findOne({
        examId: new ObjectId(examIdToUse),
        email: email
      });

      if (existing) {
        // Update to this batch and generate a new PIN
        await candidateCollection.updateOne(
          { _id: existing._id },
          { 
            $set: { 
              batchId: new ObjectId(batchIdToUse),
              pin: generatePin(),
              name: applicant.name || null,
              mobile: applicant.mobile || null,
              resumeUrl: applicant.resumeUrl || null,
              updatedAt: new Date()
            } 
          }
        );
      } else {
        // Insert new candidate
        await candidateCollection.insertOne({
          examId: new ObjectId(examIdToUse),
          batchId: new ObjectId(batchIdToUse),
          email: email,
          pin: generatePin(),
          name: applicant.name || null,
          mobile: applicant.mobile || null,
          resumeUrl: applicant.resumeUrl || null,
          status: "PENDING",
          hiringStatus: "PENDING",
          warningsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      syncedCount++;
    }

    // NEW: Remove any candidates in the external batch that are NOT from this career portal job
    const validEmails = applicants.map(app => app.email).filter(Boolean);
    const deleteResult = await candidateCollection.deleteMany({
      batchId: new ObjectId(batchIdToUse),
      email: { $nin: validEmails }
    });

    return NextResponse.json({ 
      message: `Successfully synced ${syncedCount} applicants. Removed ${deleteResult.deletedCount} old candidates.` 
    });
  } catch (error) {
    console.error("Failed to sync applicants:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
