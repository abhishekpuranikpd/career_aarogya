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
    const { status } = await req.json();

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { examStatus: status }
    });

    // Send email notification
    try {
        const { transporter, mailOptions } = await import('@/lib/email');
        
        let subject = `Application Status Update - Aarogya Aadhar`;
        let message = `Dear ${updatedUser.name},\n\nYour application status for ${updatedUser.positionApplied || 'your role'} has been updated to: ${status}.\n\n`;

        if (status === 'INTERVIEW') {
            message += `Congratulations! You have been selected for an interview. Our HR team will contact you shortly with scheduling details.\n\n`;
        } else if (status === 'HIRED') {
            message += `Congratulations! We are pleased to inform you that you have been selected for the position. Welcome to the team!\n\n`;
        } else if (status === 'REJECTED') {
            message += `Thank you for your interest. Unfortunately, we have decided to move forward with other candidates at this time.\n\n`;
        } else if (status === 'PASSED') {
            message += `You have successfully passed the assessment phase. We will review your profile and get back to you.\n\n`;
        }

        message += `You can check your status anytime on your dashboard: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard\n\nRegards,\nAarogya Aadhar Team`;

        await transporter.sendMail({
            ...mailOptions,
            to: updatedUser.email,
            subject: subject,
            text: message,
            html: `<p>Dear ${updatedUser.name},</p>
                   <p>Your application status for <strong>${updatedUser.positionApplied || 'your role'}</strong> has been updated to: <span style="font-weight:bold;color:#1e40af">${status}</span>.</p>
                   ${status === 'INTERVIEW' ? '<p style="color:purple;font-weight:bold">✨ You have been selected for an interview! Our HR team will contact you shortly.</p>' : ''}
                   ${status === 'HIRED' ? '<p style="color:green;font-weight:bold">🎉 Congratulations! You have been Hired.</p>' : ''}
                   ${status === 'REJECTED' ? '<p>Thank you for your interest. We have decided to move forward with other candidates.</p>' : ''}
                   <p>Login to checks details: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Dashboard</a></p>
                   <br/><p>Regards,<br/>Aarogya Aadhar Team</p>`
        });
    } catch (emailError) {
        console.error("Failed to send status email:", emailError);
        // Continue without failing the request
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
