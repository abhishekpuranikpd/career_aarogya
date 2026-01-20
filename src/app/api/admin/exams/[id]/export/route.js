import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 1. Fetch Exam (to get question headers) and Responses
    const exam = await prisma.exam.findUnique({
        where: { id },
        include: { questions: true }
    });

    if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

    const responses = await prisma.response.findMany({
        where: { examId: id },
        include: {
            user: {
                include: { jobPost: true } // to get applying position
            }
        },
        orderBy: { submittedAt: 'desc' }
    });

    // 2. Build CSV Headers
    // Fixed headers
    const headers = [
        "Candidate Name",
        "Email",
        "Mobile",
        "Position Applied",
        "Status",
        "Submitted At"
    ];

    // Dynamic headers from questions
    exam.questions.forEach(q => {
        headers.push(`Q: ${q.text.replace(/,/g, ' ')}`); // remove commas to prevent CSV break
    });

    // 3. Build CSV Rows
    const rows = [];
    rows.push(headers.join(",")); // Header Row

    responses.forEach(r => {
        const row = [];
        row.push(`"${r.user.name || ''}"`);
        row.push(`"${r.user.email || ''}"`);
        row.push(`"${r.user.mobile || ''}"`);
        row.push(`"${r.user.positionApplied || r.user.jobPost?.title || ''}"`);
        row.push(`"${r.user.examStatus}"`);
        row.push(`"${new Date(r.submittedAt).toLocaleString()}"`);

        // Parse answers
        let answers = {};
        if (typeof r.answers === 'string') {
            try { answers = JSON.parse(r.answers); } catch(e){}
        } else {
            answers = r.answers || {};
        }

        // Map answers to questions order
        exam.questions.forEach(q => {
            const ans = answers[q.id];
            let cellText = "";

            if (ans) {
                if (typeof ans === 'object') {
                    // Complex answer
                    cellText = ans.value || "";
                    if (ans.detail) cellText += ` (${ans.detail})`;
                    if (ans.explanation) cellText += ` [Note: ${ans.explanation}]`;
                } else {
                    // Simple string
                    cellText = ans;
                }
            } else {
                cellText = "N/A";
            }

            // Escape quotes and commas
            cellText = cellText.replace(/"/g, '""'); 
            row.push(`"${cellText}"`);
        });

        rows.push(row.join(","));
    });

    // 4. Return CSV
    const csvContent = rows.join("\n");
    
    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="exam_results_${id}.csv"`,
        },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
