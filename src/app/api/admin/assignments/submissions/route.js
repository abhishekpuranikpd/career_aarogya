import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/assignments/submissions – all intern submissions
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          positionApplied: true,
          jobPost: { select: { title: true } },
        },
      },
      assignment: { select: { title: true, targetRole: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return Response.json({ submissions });
}
