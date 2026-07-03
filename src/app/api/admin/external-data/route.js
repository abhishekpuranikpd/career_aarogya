import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(req) {
  let client;
  try {
    const uri = process.env.AGENT_DB_URL;
    if (!uri) {
      return NextResponse.json({ error: "Agent Database URL not configured" }, { status: 500 });
    }

    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    
    // Fetch exams
    const exams = await db.collection("Exam").find({ isActive: true }).sort({ createdAt: -1 }).toArray();
    
    // Fetch batches
    const batches = await db.collection("ExamBatch").find({ isActive: true }).sort({ createdAt: -1 }).toArray();
    
    // We will group batches by examId
    const examsWithBatches = exams.map(exam => {
      return {
        id: exam._id.toString(),
        title: exam.title,
        batches: batches
          .filter(b => b.examId.toString() === exam._id.toString())
          .map(b => ({
            id: b._id.toString(),
            title: b.title
          }))
      };
    });

    return NextResponse.json({ exams: examsWithBatches });
  } catch (error) {
    console.error("Failed to fetch external data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
