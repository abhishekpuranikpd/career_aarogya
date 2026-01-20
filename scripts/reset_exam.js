
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' }); 
require('dotenv').config({ path: '.env.local' }); 

const prisma = new PrismaClient();

async function resetExamData() {
    try {
        console.log("⚠️ STARTING DATA RESET ⚠️");
        
        // 1. Delete all Responses (Answers)
        const deletedResponses = await prisma.response.deleteMany({});
        console.log(`✅ Deleted ${deletedResponses.count} Responses.`);

        // 2. Delete all Applications
        const deletedApplications = await prisma.application.deleteMany({});
        console.log(`✅ Deleted ${deletedApplications.count} Applications.`);

        // 3. Delete all Users (Applicants)
        // NOTE: Admins are in 'Superadmin' table, so this is safe.
        const deletedUsers = await prisma.user.deleteMany({});
        console.log(`✅ Deleted ${deletedUsers.count} Users (Applicants).`);

        console.log("🎉 Verification Complete: All candidate data removed.");

    } catch (error) {
        console.error("❌ Error resetting data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetExamData();
