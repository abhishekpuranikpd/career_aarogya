import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { MongoClient, ObjectId } from "mongodb";

const prisma = new PrismaClient();

export async function GET(req) {
  let client;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    
    // Find candidate's current job post details
    const user = await prisma.user.findUnique({
      where: { email },
      include: { jobPost: true }
    });

    if (!user || !user.jobPost) {
      return NextResponse.json({ error: "No job post found" }, { status: 404 });
    }

    if (!user.jobPost.externalExamId) {
      return NextResponse.json({ error: "No external exam attached" }, { status: 400 });
    }

    // Connect to external DB
    const uri = process.env.AGENT_DB_URL;
    if (!uri) {
      return NextResponse.json({ error: "Agent Database URL not configured" }, { status: 500 });
    }

    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    const candidate = await db.collection("ExamCandidate").findOne({
      examId: new ObjectId(user.jobPost.externalExamId),
      email: email
    });

    if (!candidate) {
      return NextResponse.json({ pin: null, message: "Not assigned to batch yet" });
    }

    return NextResponse.json({ pin: candidate.pin });
  } catch (error) {
    console.error("Failed to fetch external PIN:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
