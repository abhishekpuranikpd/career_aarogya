import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.role !== 'admin') {
    // If logged in but not admin, redirect to user dashboard or home
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
