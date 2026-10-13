import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { resultDate } = body;

        const updated = await prisma.jobPost.update({
            where: { id },
            data: {
                resultDate: resultDate ? new Date(resultDate) : null
            }
        });

        return NextResponse.json({ success: true, jobPost: updated });
    } catch (error) {
        console.error("Failed to update result date:", error);
        return NextResponse.json({ error: "Failed to update result date: " + error.message }, { status: 500 });
    }
}
