const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JOB_ID = "696b35ea5c33a2d30b8920d5";

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Total Users: ${userCount}`);

        const apps = await prisma.application.count({
            where: { jobPostId: JOB_ID }
        });
        console.log(`Applications for Job ${JOB_ID}: ${apps}`);

        const usersWithJob = await prisma.user.count({
            where: { jobPostId: JOB_ID }
        });
        console.log(`Users with jobPostId ${JOB_ID}: ${usersWithJob}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
