"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserStatus(userId, status) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { examStatus: status },
    });
    revalidatePath("/admin/users/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function updateResponseScore(responseId, score) {
  try {
    await prisma.response.update({
      where: { id: responseId },
      data: { score: parseInt(score) },
    });
    revalidatePath("/admin/users/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update score:", error);
    return { success: false, error: "Failed to update score" };
  }
}
