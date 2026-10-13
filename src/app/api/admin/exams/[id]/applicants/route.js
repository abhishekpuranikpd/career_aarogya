import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);

        const jobPostId = searchParams.get('jobPostId') || 'all';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '25', 10)));
        const search = (searchParams.get('search') || '').trim();
        const status = searchParams.get('status') || 'All';
        const minScore = searchParams.get('minScore');
        const scoreFilter = searchParams.get('scoreFilter') || 'All';
        const dateFilter = searchParams.get('dateFilter') || 'Newest';

        // Build where clause
        const where = {
            examId: id
        };

        // Job filter
        if (jobPostId && jobPostId !== 'all') {
            if (jobPostId === 'uncategorized') {
                where.user = { jobPostId: null };
            } else {
                where.user = { jobPostId: jobPostId };
            }
        }

        // Applicant User search / status filter
        const userConditions = {};
        if (search) {
            userConditions.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search, mode: 'insensitive' } },
                { referenceId: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status && status !== 'All') {
            userConditions.examStatus = status;
        }

        if (Object.keys(userConditions).length > 0) {
            where.user = {
                ...(where.user || {}),
                ...userConditions
            };
        }

        // Min score filter
        if (minScore !== null && minScore !== undefined && minScore !== '') {
            const parsedMin = parseInt(minScore, 10);
            if (!isNaN(parsedMin)) {
                where.score = { gte: parsedMin };
            }
        }

        // Order By
        let orderBy = [{ submittedAt: 'desc' }];
        if (scoreFilter === 'HighLow') {
            orderBy = [{ score: 'desc' }, { submittedAt: 'desc' }];
        } else if (scoreFilter === 'LowHigh') {
            orderBy = [{ score: 'asc' }, { submittedAt: 'desc' }];
        } else if (dateFilter === 'Oldest') {
            orderBy = [{ submittedAt: 'asc' }];
        }

        const skip = (page - 1) * limit;

        // Concurrent fetch: data + total count
        const [totalCount, applicants] = await Promise.all([
            prisma.response.count({ where }),
            prisma.response.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    score: true,
                    submittedAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            mobile: true,
                            referenceId: true,
                            examStatus: true,
                            jobPostId: true,
                            jobPost: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                },
                orderBy
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit) || 1;

        return NextResponse.json({
            success: true,
            applicants,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error("Failed to fetch exam applicants:", error);
        return NextResponse.json({ error: "Failed to fetch applicants: " + error.message }, { status: 500 });
    }
}
