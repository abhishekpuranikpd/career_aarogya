import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import GlobalApplicantsTable from "@/app/admin/components/GlobalApplicantsTable";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Back to Dashboard */}
                <Link 
                    href="/admin/dashboard" 
                    className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
                    Back to Admin Dashboard
                </Link>

                <GlobalApplicantsTable />
            </div>
        </div>
    );
}
