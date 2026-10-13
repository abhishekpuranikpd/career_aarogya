import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        const jobPostId = searchParams.get('jobPostId') || 'all';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25', 10)));
        const search = (searchParams.get('search') || '').trim();
        const status = searchParams.get('status') || 'All';
        const dateFilter = searchParams.get('dateFilter') || 'Newest';

        // Build where clause
        const where = {};

        // Job Filter
        if (jobPostId && jobPostId !== 'all') {
            if (jobPostId === 'uncategorized') {
                where.jobPostId = null;
            } else {
                where.jobPostId = jobPostId;
            }
        }

        // Search Filter (name, email, mobile, referenceId)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search, mode: 'insensitive' } },
                { referenceId: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Status Filter
        if (status && status !== 'All') {
            where.examStatus = status;
        }

        // Order By
        const orderBy = dateFilter === 'Oldest' ? [{ createdAt: 'asc' }] : [{ createdAt: 'desc' }];
        const skip = (page - 1) * limit;

        // Concurrent execution: count, paginated users, and job metadata counts
        const [totalCount, users, allJobs, groupedCounts] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    mobile: true,
                    referenceId: true,
                    positionApplied: true,
                    jobPostId: true,
                    examStatus: true,
                    resumeUrl: true,
                    createdAt: true,
                    jobPost: {
                        select: {
                            id: true,
                            title: true
                        }
                    },
                    responses: {
                        select: {
                            id: true,
                            score: true,
                            submittedAt: true,
                            exam: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        },
                        take: 1,
                        orderBy: { submittedAt: 'desc' }
                    }
                },
                orderBy
            }),
            prisma.jobPost.findMany({
                select: { id: true, title: true, isActive: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.groupBy({
                by: ['jobPostId'],
                _count: { id: true }
            })
        ]);

        // Map job summary with applicant counts
        const countMap = {};
        let unassignedCount = 0;
        let grandTotal = 0;

        groupedCounts.forEach(g => {
            const count = g._count.id;
            grandTotal += count;
            if (g.jobPostId) {
                countMap[g.jobPostId] = count;
            } else {
                unassignedCount += count;
            }
        });

        const jobSummary = [
            { id: 'all', title: 'All Careers', count: grandTotal },
            ...allJobs.map(j => ({
                id: j.id,
                title: j.title,
                count: countMap[j.id] || 0
            })),
            ...(unassignedCount > 0 ? [{ id: 'uncategorized', title: 'Unassigned Role', count: unassignedCount }] : [])
        ];

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return NextResponse.json({
            success: true,
            users,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            },
            jobSummary
        });
    } catch (error) {
        console.error("Failed to fetch admin users:", error);
        return NextResponse.json({ error: "Failed to fetch users: " + error.message }, { status: 500 });
    }
}
