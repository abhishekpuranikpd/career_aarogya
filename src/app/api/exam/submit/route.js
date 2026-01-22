import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = session.user;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { examId, answers } = body;

    // Verify not already taken
    const existing = await prisma.response.findFirst({
        where: { userId: user.id, examId }
    });

    if (existing) {
        return NextResponse.json({ error: "You have already submitted this exam." }, { status: 400 });
    }

    // Determine Status: If auto-grading existed, we'd set it here. For now "PENDING" or "PASSED" if trivial.
    // Defaulting to PENDING review.
    
    // Create Response
    const response = await prisma.response.create({
      data: {
        userId: user.id,
        examId,
        answers
      }
    });

    // Update user exam status TO PENDING (or similar)
    await prisma.user.update({
      where: { id: user.id },
      data: { examStatus: 'PENDING' }
    });

    // --- EMAIL AUTOMATION ---
    try {
        const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { questions: true } });
        
        if (exam) {
            let qaHtml = `
                <div style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px;">
                    <h2 style="color: #333;">Your Responses</h2>
            `;

            exam.questions.forEach((q, i) => {
                const ans = answers[q.id];
                let val = "No Answer";
                let extra = "";
                
                if (ans) {
                    if (typeof ans === 'object') {
                        val = ans.value || "N/A";
                        if (ans.detail) extra += `<br><strong>Detail:</strong> ${ans.detail}`;
                        if (ans.explanation) extra += `<br><strong>Explanation:</strong> ${ans.explanation}`;
                    } else {
                        val = ans;
                    }
                }

                qaHtml += `
                    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <div style="font-weight: bold; color: #0056b3; margin-bottom: 5px;">Q${i+1}. ${q.text}</div>
                        <div style="background: #f9f9f9; padding: 10px; border-radius: 4px;">
                            <strong>Answer:</strong> ${val}
                            ${extra}
                        </div>
                    </div>
                `;
            });

            qaHtml += `</div>`;

            // Dynamic import to avoid circular dep issues if any
            const { sendEmail } = require('@/lib/mail');
            
            await sendEmail({
                to: user.email,
                subject: `Exam Submission Confirmation - ${exam.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto;">
                        <p>Dear ${user.name},</p>
                        <p>Thank you for completing the <strong>${exam.title}</strong>.</p>
                        <p>Your responses have been recorded successfully. Below is a copy of your answers:</p>
                        
                        ${qaHtml}

                        <br>
                        <p>Our team will review your application and get back to you shortly.</p>
                        <p>Best regards,<br>Recruitment Team</p>
                    </div>
                `
            });
        }
    } catch (emailErr) {
        console.error("Email generation failed:", emailErr);
        // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error submitting exam' }, { status: 500 });
  }
}
