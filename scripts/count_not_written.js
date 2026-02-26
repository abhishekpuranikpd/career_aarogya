const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const JOB_ID = '698afd3e18dd6ca1b732cf40';

async function main() {
    const job = await prisma.jobPost.findUnique({
        where: { id: JOB_ID },
        include: { exam: { select: { id: true, title: true } } }
    });

    console.log('📋 Job:', job?.title);
    console.log('📝 Exam:', job?.exam?.title || 'No exam linked');

    // Get users who applied to THIS specific job
    const applicants = await prisma.user.findMany({
        where: { jobPostId: JOB_ID },
        select: { id: true }
    });
    const applicantIds = applicants.map(u => u.id);
    console.log('\n👥 Total applicants for this job:', applicantIds.length);

    if (!job?.exam) {
        console.log('⚠️  No exam linked to this job.');
        return;
    }

    // Get exam responses ONLY from users who applied to this job
    const responses = await prisma.response.findMany({
        where: {
            examId: job.exam.id,
            userId: { in: applicantIds }
        },
        select: { userId: true }
    });

    const wroteExamIds = new Set(responses.map(r => r.userId));

    console.log('✍️  Written exam (from this job only):', wroteExamIds.size);
    console.log('⏳ NOT written exam yet:             ', applicantIds.length - wroteExamIds.size);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
