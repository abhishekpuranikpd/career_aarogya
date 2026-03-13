import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/assignments/active
// Returns the active assignment that matches current user's positionApplied role
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's position
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, positionApplied: true, jobPost: { select: { title: true } } },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const position = (user.positionApplied || user.jobPost?.title || "").toLowerCase();

  // Find an active assignment whose targetRole is contained in user's position
  const assignments = await prisma.assignment.findMany({
    where: { isActive: true },
  });

  const matched = assignments.find((a) =>
    position.includes(a.targetRole.toLowerCase())
  );

  if (!matched) return Response.json({ assignment: null, submission: null });

  // Also get the user's existing submission if any
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { userId_assignmentId: { userId: user.id, assignmentId: matched.id } },
  });

  return Response.json({ assignment: matched, submission: submission || null });
}
