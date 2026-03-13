import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/assignments/submit
// Body: { assignmentId, reelLink, posterLink }
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { assignmentId, reelLink, posterLink } = await req.json();

  if (!assignmentId) {
    return Response.json({ error: "assignmentId is required" }, { status: 400 });
  }

  if (!reelLink && !posterLink) {
    return Response.json({ error: "Please provide at least one link" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  // Upsert submission
  const submission = await prisma.assignmentSubmission.upsert({
    where: {
      userId_assignmentId: { userId: user.id, assignmentId },
    },
    create: {
      userId: user.id,
      assignmentId,
      reelLink: reelLink || null,
      posterLink: posterLink || null,
    },
    update: {
      reelLink: reelLink || null,
      posterLink: posterLink || null,
      updatedAt: new Date(),
    },
  });

  return Response.json({ success: true, submission });
}
