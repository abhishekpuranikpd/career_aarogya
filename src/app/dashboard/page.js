import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CheckBadgeIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline"
import AssignmentCard from "./AssignmentCard"
import { MongoClient, ObjectId } from "mongodb";

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

  // Assignment logic: find matching active assignment for this user's role
  const userPosition = (user.positionApplied || user.jobPost?.title || "").toLowerCase();
  const allAssignments = await prisma.assignment.findMany({ where: { isActive: true } });
  const matchedAssignment = allAssignments.find(a => userPosition.includes(a.targetRole.toLowerCase())) || null;

  const assignmentSubmission = matchedAssignment
    ? await prisma.assignmentSubmission.findUnique({
        where: { userId_assignmentId: { userId: user.id, assignmentId: matchedAssignment.id } }
      })
    : null;

  let latestResponse = user.responses[0];
  if (latestResponse && user.jobPost?.examId !== latestResponse.examId) {
     latestResponse = null; // Only show response if it belongs to the current job's internal exam
  }
  const pendingExam = user.jobPost?.examId && !latestResponse;

  // Exam Time Window Logic
  const now = new Date();
  const exam = user.jobPost?.exam;
  const start = exam?.windowStart ? new Date(exam.windowStart) : null;
  const end = exam?.windowEnd ? new Date(exam.windowEnd) : null;
  
  const notStarted = start && now < start;
  const expired = end && now > end;

  // External Exam PIN fetching
  let externalPin = null;
  if (user.jobPost?.externalExamId && process.env.AGENT_DB_URL) {
    try {
      const client = new MongoClient(process.env.AGENT_DB_URL);
      await client.connect();
      const candidate = await client.db().collection("ExamCandidate").findOne({
        examId: new ObjectId(user.jobPost.externalExamId),
        email: user.email
      });
      if (candidate) externalPin = candidate.pin;
      await client.close();
    } catch(e) {
      console.error("Failed to fetch external PIN:", e);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
           <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
           <div className="flex items-center gap-3 mt-1">
             <p className="opacity-90">Application Dashboard</p>
             {user.referenceId && (
               <>
                 <span className="opacity-40">•</span>
                 <p className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider">REF ID: {user.referenceId?.slice(1)}</p>
               </>
             )}
           </div>
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
                     <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h2 className="text-2xl font-bold text-blue-900">{user.positionApplied || user.jobPost?.title}</h2>
                        {user.referenceId && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold w-fit uppercase tracking-tighter">ID: {user.referenceId.slice(1)}</span>}
                     </div>
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

           {/* Compulsory WhatsApp Join Section */}
           {user.jobPost?.whatsappGroupLink && (
             <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm border-l-8 border-l-green-500">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-100 flex-shrink-0">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                   </svg>
                 </div>
                 <div>
                   <h3 className="text-lg font-extrabold text-green-900 leading-tight">JOIN OFFICIAL WHATSAPP GROUP</h3>
                   <p className="text-sm text-green-700 font-bold">Compulsory: All future updates & notification given there ONLY.</p>
                 </div>
               </div>
               <a 
                 href={user.jobPost.whatsappGroupLink}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="px-8 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap transform hover:scale-105"
               >
                 JOIN GROUP NOW
               </a>
             </div>
           )}

           {/* Actions / Timeline - Only show if applied */}
           {(user.positionApplied || user.jobPost) && (
               <>
                   <h2 className="text-lg font-bold text-gray-800 mb-6">Application Status</h2>
                   <div className="relative border-l-2 border-gray-200 ml-3 space-y-10 pl-8 py-2">
                     
                     {/* Step 1: Registration */}
                     <div className="relative group">
                       <span className="absolute -left-[43px] bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white">✓</span>
                       <h3 className="font-bold text-gray-900 text-lg">Application Submitted</h3>
                       <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                       <p className="text-sm mt-1 text-gray-600">Profile created and application received.</p>
                     </div>
        
                     {/* Step 2: Exam */}
                     {(user.jobPost?.examId || user.jobPost?.externalExamUrl) ? (
                         <div className="relative group">
                           <span className={`absolute -left-[43px] w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white transition-colors ${latestResponse ? 'bg-green-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
                             {latestResponse ? '✓' : '2'}
                           </span>
                           <h3 className="font-bold text-gray-900 text-lg">Online Exam</h3>
                           
                           {latestResponse ? (
                             <>
                               <p className="text-sm text-gray-500">{new Date(latestResponse.submittedAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                               <p className="text-sm mt-1 text-gray-600">Exam submitted successfully.</p>
                               {latestResponse.score !== null && (
                                   <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 inline-block">
                                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Exam Score</span>
                                       <span className="text-xl font-black text-blue-900">{latestResponse.score} <span className="text-sm text-gray-500 font-medium">/ 10</span></span>
                                   </div>
                               )}
                             </>
                           ) : (
                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                                {notStarted ? (
                                    <div className="text-center py-2">
                                        <div className="inline-flex items-center gap-2 text-amber-600 font-bold mb-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 text-sm">
                                            <ClockIcon className="w-4 h-4" />
                                            Exam Not Yet Active
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto">
                                            The Exam window has not started yet. Please come back and login at the scheduled time.
                                        </p>
                                        <div className="bg-white p-3 rounded border border-blue-100 inline-block text-left text-sm">
                                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Scheduled Window (IST)</p>
                                            <p className="text-blue-900 font-bold">
                                                {start?.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })}
                                            </p>
                                        </div>
                                    </div>
                                ) : expired ? (
                                    <div className="text-center py-2">
                                        <div className="inline-flex items-center gap-2 text-red-600 font-bold mb-2 bg-red-50 px-3 py-1 rounded-full border border-red-100 text-sm">
                                            <XCircleIcon className="w-4 h-4" />
                                            Exam Expired
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            The window for this Exam has closed.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-blue-900 font-medium mb-3">Action Required</p>
                                        <p className="text-sm text-gray-600 mb-4">Please complete the mandatory Exam to proceed.</p>
                                        
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">Strict Warning</h3>
                                                    <p className="text-sm text-red-700 mt-1 font-bold">
                                                        Do NOT open new tabs or windows. 
                                                    </p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Serious action will be taken if any malpractice is detected.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {user.jobPost.externalExamUrl ? (
                                            <div className="space-y-4">
                                                {externalPin && (
                                                    <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-300 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                                        <h4 className="font-extrabold text-yellow-900 mb-2 text-lg flex items-center gap-2">
                                                            <svg className="w-5 h-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                            Your Exam Credentials
                                                        </h4>
                                                        <p className="text-sm text-yellow-800 mb-3 font-medium">Use these exact details to log in to the Agent Exam Portal:</p>
                                                        <div className="font-mono text-sm bg-white p-4 rounded-lg border border-yellow-200 shadow-inner space-y-2">
                                                            <div className="flex justify-between items-center"><span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Email</span> <strong className="text-gray-900">{user.email}</strong></div>
                                                            <div className="flex justify-between items-center"><span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Login PIN</span> <strong className="text-2xl text-blue-700 tracking-widest">{externalPin}</strong></div>
                                                        </div>
                                                        
                                                        <div className="mt-4 pt-4 border-t border-yellow-200 space-y-2">
                                                          <h5 className="font-bold text-yellow-900 text-sm">⚠️ Important Exam Instructions:</h5>
                                                          <ul className="text-xs text-yellow-800 space-y-1 list-disc pl-4 font-medium">
                                                            <li>The exam requires your <strong>camera</strong> to be ON at all times.</li>
                                                            <li>Do not switch tabs, minimize the browser, or open any other applications.</li>
                                                            <li><strong className="text-red-600">If you copy or paste even ONE TIME, the system will immediately terminate the exam.</strong></li>
                                                            <li>Any suspicious activity will be auto-flagged and may result in immediate disqualification.</li>
                                                            <li>Ensure you are in a quiet, well-lit room with a stable internet connection.</li>
                                                          </ul>
                                                        </div>
                                                    </div>
                                                )}
                                                <a
                                                    href={user.jobPost.externalExamUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
                                                >
                                                    Take Exam Now (External Link)
                                                </a>
                                            </div>
                                        ) : (
                                            <Link 
                                                href={`/exam/${user.jobPost.examId}`} 
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
                                            >
                                              Take Exam Now
                                            </Link>
                                        )}
                                    </>
                                )}
                             </div>
                           )}
                         </div>
                     ) : (
                        <div className="relative group opacity-50">
                            <span className="absolute -left-[43px] bg-gray-200 text-gray-500 w-7 h-7 rounded-full flex items-center justify-center text-sm ring-4 ring-white">2</span>
                            <h3 className="font-bold text-gray-500 text-lg">Online Exam</h3>
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
                          {user.examStatus === 'HIRED' && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                <span className="text-green-600 font-bold block mb-1">🎉 Congratulations! You have been Hired.</span>
                                <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                                    {user.jobPost?.inductionDate && (
                                        <div>
                                            <p className="text-gray-500 uppercase font-bold tracking-wider">Induction Date</p>
                                            <p className="text-green-800 font-bold">{new Date(user.jobPost.inductionDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {user.jobPost?.joiningDate && (
                                        <div>
                                            <p className="text-gray-500 uppercase font-bold tracking-wider">Joining Date</p>
                                            <p className="text-green-800 font-bold">{new Date(user.jobPost.joiningDate).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                          )}
                         {user.examStatus === 'REJECTED' && <span className="text-red-600">Application not selected at this time.</span>}
                         {user.examStatus === 'PASSED' && "Exam Passed. Identifying Next Steps."}
                       </p>
                     </div>
        
                   </div>
               </>
           )}

        </div>

        {/* Assignment Tasks — shown only for matched interns */}
        {matchedAssignment && (
          <div className="mt-8">
            <AssignmentCard
              assignment={matchedAssignment}
              initialSubmission={assignmentSubmission}
            />
          </div>
        )}

      </div>
    </div>
  );
}
