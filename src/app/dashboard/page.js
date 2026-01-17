import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CheckBadgeIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline"

export const dynamic = 'force-dynamic';

export default async function UserDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect("/login");
  if (session.user.role === 'admin') redirect("/admin/dashboard");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      jobPost: { include: { exam: true } },
      responses: {
         include: { exam: true },
         orderBy: { submittedAt: 'desc' },
         take: 1
      }
    }
  });

  if (!user) return <div>User not found</div>;

  const latestResponse = user.responses[0];
  const pendingExam = user.jobPost?.examId && (!latestResponse || latestResponse.examId !== user.jobPost.examId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
           <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
           <p className="opacity-90 mt-1">Application Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
           
           {/* Quick Status */}
           {/* Quick Status */}
           <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
             <div className="flex-1">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Active Application</span>
               {user.positionApplied || user.jobPost ? (
                 <>
                    <h2 className="text-2xl font-bold text-blue-900">{user.positionApplied || user.jobPost?.title}</h2>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                        {user.jobPost?.location && <span className="bg-white px-2 py-1 rounded text-xs border border-gray-200">{user.jobPost.location}</span>}
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            user.examStatus === 'HIRED' ? 'bg-green-100 text-green-700' :
                            user.examStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>Status: {user.examStatus}</span>
                    </p>
                 </>
               ) : (
                 <>
                    <h2 className="text-xl font-bold text-gray-400">No Active Applications</h2>
                    <p className="text-gray-500 mt-1">Browse open positions and apply to track your status here.</p>
                 </>
               )}
             </div>
             
             <div>
                {(!user.positionApplied && !user.jobPost) ? (
                   <Link href="/careers" className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition shadow">
                      Browse Careers
                   </Link>
                ) : (
                   <Link href="/careers" className="text-primary hover:underline font-medium text-sm">
                      View All Jobs
                   </Link>
                )}
             </div>
           </div>

           {/* Actions / Timeline - Only show if applied */}
           {(user.positionApplied || user.jobPost) && (
               <>
                   <h2 className="text-lg font-bold text-gray-800 mb-6">Application Status</h2>
                   <div className="relative border-l-2 border-gray-200 ml-3 space-y-10 pl-8 py-2">
                     
                     {/* Step 1: Registration */}
                     <div className="relative group">
                       <span className="absolute -left-[43px] bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white">✓</span>
                       <h3 className="font-bold text-gray-900 text-lg">Application Submitted</h3>
                       <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                       <p className="text-sm mt-1 text-gray-600">Profile created and application received.</p>
                     </div>
        
                     {/* Step 2: Exam */}
                     {user.jobPost?.examId ? (
                         <div className="relative group">
                           <span className={`absolute -left-[43px] w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white transition-colors ${latestResponse ? 'bg-green-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
                             {latestResponse ? '✓' : '2'}
                           </span>
                           <h3 className="font-bold text-gray-900 text-lg">Online Assessment</h3>
                           
                           {latestResponse ? (
                             <>
                               <p className="text-sm text-gray-500">{new Date(latestResponse.submittedAt).toLocaleDateString()}</p>
                               <p className="text-sm mt-1 text-gray-600">Assessment submitted successfully.</p>
                             </>
                           ) : (
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                                <p className="text-blue-900 font-medium mb-3">Action Required</p>
                                <p className="text-sm text-gray-600 mb-4">Please complete the mandatory assessment to proceed.</p>
                                <Link 
                                    href={`/exam/${user.jobPost.examId}`} 
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
                                >
                                  Take Assessment Now
                                </Link>
                             </div>
                           )}
                         </div>
                     ) : (
                        <div className="relative group opacity-50">
                            <span className="absolute -left-[43px] bg-gray-200 text-gray-500 w-7 h-7 rounded-full flex items-center justify-center text-sm ring-4 ring-white">2</span>
                            <h3 className="font-bold text-gray-500 text-lg">Online Assessment</h3>
                            <p className="text-sm text-gray-400 mt-1">Not required for this role.</p>
                        </div>
                     )}
        
                     {/* Step 3: Review / Interview */}
                     <div className="relative group">
                       <span className={`absolute -left-[43px] w-7 h-7 rounded-full flex items-center justify-center text-sm ring-4 ring-white shadow-sm ${
                           ['INTERVIEW', 'HIRED'].includes(user.examStatus) ? 'bg-green-500 text-white' : 
                           user.examStatus === 'REJECTED' ? 'bg-red-500 text-white' :
                           'bg-gray-200 text-gray-500'
                       }`}>
                         {['INTERVIEW', 'HIRED'].includes(user.examStatus) ? '✓' : '3'}
                       </span>
                       <h3 className={`font-bold text-lg ${['INTERVIEW', 'HIRED', 'REJECTED'].includes(user.examStatus) ? 'text-gray-900' : 'text-gray-400'}`}>
                           Interview & Selection
                       </h3>
                       <p className="text-sm text-gray-500 mt-1">
                         {user.examStatus === 'PENDING' && "Application under review."}
                         {user.examStatus === 'INTERVIEW' && <span className="text-purple-600 font-medium">✨ Selected for Interview! Check your email.</span>}
                         {user.examStatus === 'HIRED' && <span className="text-green-600 font-bold">🎉 Congratulations! You have been Hired.</span>}
                         {user.examStatus === 'REJECTED' && <span className="text-red-600">Application not selected at this time.</span>}
                         {user.examStatus === 'PASSED' && "Assessment Passed. Identifying Next Steps."}
                       </p>
                     </div>
        
                   </div>
               </>
           )}

        </div>

      </div>
    </div>
  );
}
