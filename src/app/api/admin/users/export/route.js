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

        const where = {};
        if (jobPostId && jobPostId !== 'all') {
            if (jobPostId === 'uncategorized') {
                where.jobPostId = null;
            } else {
                where.jobPostId = jobPostId;
            }
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                name: true,
                email: true,
                mobile: true,
                referenceId: true,
                positionApplied: true,
                examStatus: true,
                createdAt: true,
                jobPost: { select: { title: true } },
                responses: {
                    select: { score: true },
                    take: 1,
                    orderBy: { submittedAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const headers = [
            "Candidate Name",
            "Email",
            "Mobile",
            "Reference ID",
            "Role / Job Applied",
            "Exam Status",
            "Exam Score",
            "Registered Date (IST)"
        ];

        const rows = [headers.join(",")];

        users.forEach(u => {
            const row = [
                `"${(u.name || '').replace(/"/g, '""')}"`,
                `"${(u.email || '').replace(/"/g, '""')}"`,
                `"${(u.mobile || '').replace(/"/g, '""')}"`,
                `"${(u.referenceId || '').replace(/"/g, '""')}"`,
                `"${(u.positionApplied || u.jobPost?.title || 'General').replace(/"/g, '""')}"`,
                `"${(u.examStatus || 'PENDING').replace(/"/g, '""')}"`,
                `"${u.responses && u.responses.length > 0 && u.responses[0].score !== null ? u.responses[0].score : 'N/A'}"`,
                `"${new Date(u.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`
            ];
            rows.push(row.join(","));
        });

        const csvContent = rows.join("\n");

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="applicants_export_${jobPostId}.csv"`,
            },
        });
    } catch (error) {
        console.error("Failed to export applicants:", error);
        return NextResponse.json({ error: "Failed to export: " + error.message }, { status: 500 });
    }
}
