const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("🔍 Analyzing users who have written the exam...");

        const usersWithResponse = await prisma.user.findMany({
            where: {
                responses: {
                    some: {} // Has at least one response
                }
            },
            select: {
                examStatus: true
            }
        });

        console.log(`\n---------------------------------`);
        console.log(`Total Users with Exam Responses: ${usersWithResponse.length}`);
        console.log(`---------------------------------`);

        // Group by status
        const statusCounts = usersWithResponse.reduce((acc, user) => {
            const status = user.examStatus || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        console.log("Breakdown by Exam Status:");
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(` - ${status.padEnd(10)}: ${count}`);
        });
        console.log(`---------------------------------\n`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
