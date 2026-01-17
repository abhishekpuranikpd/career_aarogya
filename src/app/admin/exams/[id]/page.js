import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import StatusUpdater from "./status-updater";

export const dynamic = 'force-dynamic';

async function updateStatus(userId, status) {
  "use server";
  await prisma.user.update({
    where: { id: userId },
    data: { examStatus: status }
  });
  redirect(`/admin/exams/${params.id}`); // This might need better revalidation
}

export default async function ExamDetails({ params }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login");

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      responses: {
        include: { user: true },
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

  if (!exam) return <div className="p-8">Exam not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto">
        <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{exam.title}</h1>
          <div className="flex gap-4 text-sm text-gray-500">
             <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{exam.type}</span>
             <span className="flex items-center">ID: {exam.id}</span>
             <span className="flex items-center">{exam.questions.length} Questions</span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-gray-700">Applicants ({exam.responses.length})</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Date</th>
                <th className="p-4 font-semibold text-gray-600">Applicant</th>
                <th className="p-4 font-semibold text-gray-600">Email</th>
                <th className="p-4 font-semibold text-gray-600">Current Status</th>
                <th className="p-4 font-semibold text-gray-600">Resume</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exam.responses.map(response => (
                <tr key={response.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500">{new Date(response.submittedAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{response.user.name}</td>
                  <td className="p-4 text-gray-600">{response.user.email}</td>
                  <td className="p-4">
                    <StatusUpdater userId={response.user.id} currentStatus={response.user.examStatus} />
                  </td>
                  <td className="p-4">
                    {response.user.resumeUrl ? (
                      <a href={response.user.resumeUrl} target="_blank" className="text-primary hover:underline">View PDF</a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
                      View Answers
                    </button>
                  </td>
                </tr>
              ))}
              {exam.responses.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No applicants have taken this exam yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
