require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');

const prisma = new PrismaClient(); // Connects to career_aarogya DB via DATABASE_URL

async function backfill() {
  let client;
  try {
    const uri = process.env.AGENT_DB_URL;
    if (!uri) {
      console.error("AGENT_DB_URL is missing in .env");
      return;
    }
    
    console.log("Fetching ALL career users from Prisma...");
    const allCareerUsers = await prisma.user.findMany({
      select: { email: true, name: true, mobile: true, resumeUrl: true }
    });
    console.log(`Found ${allCareerUsers.length} career users.`);

    const careerUserMap = {};
    for (const u of allCareerUsers) {
      if (u.email) {
        careerUserMap[u.email.toLowerCase()] = u;
      }
    }

    console.log("Connecting to Agent DB...");
    client = new MongoClient(uri);
    await client.connect();
    const agentDb = client.db();
    const candidateCollection = agentDb.collection("ExamCandidate");

    console.log("Fetching candidates from Agent DB...");
    const candidates = await candidateCollection.find({}).toArray();
    console.log(`Found ${candidates.length} total candidates in Agent DB.`);

    const bulkOps = [];

    for (const candidate of candidates) {
      if (!candidate.email) continue;
      
      const careerUser = careerUserMap[candidate.email.toLowerCase()];

      if (careerUser && (careerUser.name || careerUser.mobile || careerUser.resumeUrl)) {
        bulkOps.push({
          updateOne: {
            filter: { _id: candidate._id },
            update: {
              $set: {
                name: careerUser.name || null,
                mobile: careerUser.mobile || null,
                resumeUrl: careerUser.resumeUrl || null
              }
            }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      console.log(`Executing bulkWrite with ${bulkOps.length} updates...`);
      const result = await candidateCollection.bulkWrite(bulkOps);
      console.log(`Successfully backfilled ${result.modifiedCount} candidates!`);
    } else {
      console.log("No candidates needed updates.");
    }

  } catch (error) {
    console.error("Error during backfill:", error);
  } finally {
    if (client) {
      await client.close();
    }
    await prisma.$disconnect();
  }
}

backfill();
