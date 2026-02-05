const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const isExecute = args.includes('--execute');

    try {
        // 1. Count users with PASSED status
        const passedCount = await prisma.user.count({
            where: {
                examStatus: 'PASSED'
            }
        });

        console.log(`\nFound ${passedCount} users with status 'PASSED'.`);

        if (passedCount === 0) {
            console.log("No users to update.");
            return;
        }

        if (isExecute) {
            console.log("🚀 Updating status to 'INTERVIEW'...");
            const result = await prisma.user.updateMany({
                where: {
                    examStatus: 'PASSED'
                },
                data: {
                    examStatus: 'INTERVIEW'
                }
            });
            console.log(`✅ Successfully updated ${result.count} users to 'INTERVIEW'.`);
        } else {
            console.log("\n⚠️  Run with --execute to perform the update.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
