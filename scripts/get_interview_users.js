
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fetching users with status 'INTERVIEW'...");
        
        const users = await prisma.user.findMany({
            where: {
                examStatus: 'INTERVIEW'
            },
            select: {
                email: true,
                name: true,
                updatedAt: true,
                responses: {
                    select: {
                        score: true,
                        submittedAt: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        console.log(`Found ${users.length} users.`);
        
        if (users.length === 0) {
            console.log("No users found.");
            return;
        }

        // Group by date (down to the hour/minute) to see clusters
        console.log("Timestamp distribution:");
        users.forEach(u => {
            console.log(`${u.updatedAt.toISOString()} - ${u.email} - Score: ${u.responses[0]?.score}`);
        });

        // Write to file
        const fileContent = users.map(u => `${u.email},${u.name},${u.updatedAt.toISOString()}`).join('\n');
        fs.writeFileSync('interview_users_dump.csv', 'email,name,updatedAt\n' + fileContent);
        console.log("\nDumped to interview_users_dump.csv");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
