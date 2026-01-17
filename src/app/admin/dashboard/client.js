"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MagnifyingGlassIcon, 
  HomeIcon, 
  BriefcaseIcon, 
  AcademicCapIcon, 
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

import OverviewCharts from './OverviewCharts';

export default function DashboardClient({ initialUsers, initialExams, initialJobs, baseUrl }) {
  const [activeTab, setActiveTab] = useState("Overview");
  
  // --- PAGINATION HELPER ---
  const ITEMS_PER_PAGE = 5;
  const Pagination = ({ totalItems, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
         <div className="flex flex-1 justify-between sm:hidden">
            <button
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
         </div>
         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                   disabled={currentPage === 1}
                   className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                   <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === i + 1 ? 'bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                   >
                     {i + 1}
                   </button>
                ))}
                <button
                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                   disabled={currentPage === totalPages}
                   className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
         </div>
      </div>
    );
  };

  // --- APPLICANTS STATE ---
  const [users, setUsers] = useState(initialUsers);
  const [userSearch, setUserSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // New Filter
  const [candidatePage, setCandidatePage] = useState(1);

  // --- EXAMS STATE ---
  const [exams, setExams] = useState(initialExams);
  const [examSearch, setExamSearch] = useState("");
  const [examPage, setExamPage] = useState(1);

  // --- JOBS STATE ---
  const [jobs, setJobs] = useState(initialJobs || []);
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobStatusFilter, setJobStatusFilter] = useState("All");

  // --- ACTIONS ---
  const handleDeleteJob = async (jobId) => {
    if(!window.confirm("Are you sure you want to delete this job post?")) return;
    
    try {
        const res = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
        if(res.ok) {
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } else {
            alert("Failed to delete job.");
        }
    } catch(e) { console.error(e); alert("Error deleting job"); }
  };

  const handleDeleteExam = async (examId) => {
    if(!window.confirm("Are you sure you want to delete this exam? This will delete all associated questions.")) return;
    
    try {
        const res = await fetch(`/api/admin/exams/${examId}`, { method: 'DELETE' });
        if(res.ok) {
            setExams(prev => prev.filter(e => e.id !== examId));
        } else {
            alert("Failed to delete exam.");
        }
    } catch(e) { console.error(e); alert("Error deleting exam"); }

  };

  const handleStatusUpdate = async (userId, newStatus) => {
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, examStatus: newStatus } : u));
      
      try {
          const res = await fetch(`/api/admin/users/${userId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) throw new Error("Failed to update");
      } catch (e) {
          console.error(e);
          alert("Failed to update status");
          // Revert on error (optional, but good practice)
      }
  };

  // --- FILTERING LOGIC ---
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchedPos = user.positionApplied || (user.jobPost ? user.jobPost.title : "General");
    const matchesPosition = positionFilter === "All" || matchedPos === positionFilter;
    const matchesStatus = statusFilter === "All" || user.examStatus === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(examSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter(job => {
     const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                           job.location.toLowerCase().includes(jobSearch.toLowerCase());
     const matchesStatus = jobStatusFilter === "All" || 
                           (jobStatusFilter === "Active" ? job.isActive : !job.isActive);
     return matchesSearch && matchesStatus;
  });

  // --- PAGINATION SLICING ---
  const paginatedUsers = filteredUsers.slice((candidatePage - 1) * ITEMS_PER_PAGE, candidatePage * ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice((examPage - 1) * ITEMS_PER_PAGE, examPage * ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice((jobPage - 1) * ITEMS_PER_PAGE, jobPage * ITEMS_PER_PAGE);

  const uniquePositions = ["All", ...new Set(initialUsers.map(u => u.positionApplied || (u.jobPost?.title)).filter(Boolean))];
  const uniqueStatuses = ["All", "PENDING", "PASSED", "FAILED", "INTERVIEW", "HIRED", "REJECTED"];

  // Stats for Overview
  const stats = {
    applicants: initialUsers.length,
    activeJobs: initialJobs.filter(j => j.isActive).length,
    activeExams: initialExams.length,
    pendingReviews: initialUsers.filter(u => u.examStatus === 'PENDING').length,
    interviews: initialUsers.filter(u => ['INTERVIEW', 'PASSED'].includes(u.examStatus)).length,
    hired: initialUsers.filter(u => u.examStatus === 'HIRED').length
  };

  const SidebarItem = ({ name, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors group ${
        activeTab === name 
          ? "bg-blue-50 text-primary" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === name ? "text-primary" : "text-gray-400 group-hover:text-gray-600"}`} />
      {name}
    </button>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Portal</h2>
          <div className="space-y-1">
            <SidebarItem name="Overview" icon={HomeIcon} />
            <SidebarItem name="Careers" icon={BriefcaseIcon} />
            <SidebarItem name="Exams" icon={AcademicCapIcon} />
            <SidebarItem name="Applicants" icon={UserGroupIcon} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{activeTab}</h1>

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
           <div className="space-y-8">
             {/* Stats Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                     <UserGroupIcon className="w-6 h-6" />
                   </div>
                   <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                 </div>
                 <div className="text-gray-500 text-sm font-medium mb-1">Total Applicants</div>
                 <div className="text-3xl font-bold text-gray-900">{stats.applicants}</div>
               </div>
               
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                     <BriefcaseIcon className="w-6 h-6" />
                   </div>
                 </div>
                 <div className="text-gray-500 text-sm font-medium mb-1">Active Job Posts</div>
                 <div className="text-3xl font-bold text-gray-900">{stats.activeJobs}</div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                     <DocumentTextIcon className="w-6 h-6" />
                   </div>
                 </div>
                 <div className="text-gray-500 text-sm font-medium mb-1">Pending Reviews</div>
                 <div className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</div>
               </div>

               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                     <AcademicCapIcon className="w-6 h-6" />
                   </div>
                 </div>
                 <div className="text-gray-500 text-sm font-medium mb-1">Qualified Candidates</div>
                <div className="text-3xl font-bold text-gray-900">{stats.interviews}</div>
                </div>
              </div>

              <div className="mt-8">
                  <OverviewCharts users={users} jobs={jobs} exams={exams} />
              </div>
            </div>
         )}

        {/* CAREERS (JOBS) TAB */}
        {activeTab === "Careers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-900 hidden md:block">Jobs</h3>
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm w-48 lg:w-64"
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                    />
                  </div>
                  <select 
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
                      value={jobStatusFilter}
                      onChange={(e) => setJobStatusFilter(e.target.value)}
                  >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                  </select>
               </div>
               <Link 
                 href="/admin/jobs/create" 
                 className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
               >
                 <PlusIcon className="w-4 h-4" /> Create  Job
               </Link>
            </div>

            {/* Job List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="grid grid-cols-1 divide-y divide-gray-100">
                 {paginatedJobs.length > 0 ? (
                    paginatedJobs.map(job => (
                      <div key={job.id} className="p-6 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between gap-4">
                         <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                               <div className="w-full h-full flex items-center justify-center text-2xl">💼</div>
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 text-lg">{job.title}</h4>
                               <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                  <span>{job.location}</span>
                                  <span>•</span>
                                  <span>{job.type}</span>
                                  <span>•</span>
                                  <span className={job.isActive ? "text-green-600 font-medium" : "text-red-500"}>
                                     {job.isActive ? "Active" : "Closed"}
                                  </span>
                               </div>
                               <div className="text-xs text-gray-400 mt-2">
                                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                                  {job.exam && <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Linked Exam: {job.exam.title}</span>}
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="text-center px-4">
                               <div className="text-xl font-bold text-gray-900">{job._count?.applicants || 0}</div>
                               <div className="text-xs text-gray-500 uppercase">Applicants</div>
                            </div>
                            <div className="flex gap-2 border-l pl-4 border-gray-200">
                               <Link href={`/careers/${job.id}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Preview">
                                  <EyeIcon className="w-5 h-5" />
                               </Link>
                               <Link href={`/admin/jobs/${job.id}/edit`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit">
                                  <PencilIcon className="w-5 h-5" />
                               </Link>
                               <button onClick={() => handleDeleteJob(job.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                                  <TrashIcon className="w-5 h-5" />
                               </button>
                            </div>
                         </div>
                      </div>
                    ))
                 ) : (
                    <div className="p-12 text-center text-gray-500">
                       No job posts found.
                    </div>
                 )}
               </div>
               <Pagination totalItems={filteredJobs.length} currentPage={jobPage} setCurrentPage={setJobPage} />
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === "Exams" && (
           <div className="space-y-6">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search exams..." 
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm w-64"
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                   <PlusIcon className="w-4 h-4" /> Create Exam
                </button>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {paginatedExams.map(exam => (
                 <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group flex flex-col h-full">
                   <div className="flex justify-between items-start mb-2">
                     <Link href={`/admin/exams/${exam.id}`} className="font-bold text-lg leading-tight hover:text-primary block line-clamp-2 min-h-[3.5rem]">
                       {exam.title}
                     </Link>
                     <span className={`px-2 py-1 text-xs rounded font-bold whitespace-nowrap ml-2 flex-shrink-0 ${exam.type === 'YES_NO' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                       {exam.type}
                     </span>
                   </div>
                   
                   <div className="text-sm text-gray-500 mb-4 flex-grow">
                      <p>{exam.questions.length} Questions defined.</p>
                      <p className="text-xs mt-1 text-gray-400">ID: {exam.id}</p>
                   </div>

                   <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex gap-2">
                         <Link 
                            href={`/exam/${exam.id}`} 
                            target="_blank" 
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                         >
                            <EyeIcon className="w-4 h-4" /> Preview
                         </Link>
                         <Link
                            href={`/admin/exams/${exam.id}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                         >
                            <DocumentTextIcon className="w-4 h-4" /> Details
                         </Link>
                         <button 
                            onClick={() => handleDeleteExam(exam.id)}
                            className="flex items-center justify-center w-8 h-full bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition"
                         >
                            <TrashIcon className="w-4 h-4" />
                         </button>
                      </div>
                      <div className="flex gap-2 items-center text-xs text-gray-400 bg-gray-50 p-2 rounded">
                          <span className="truncate flex-1 select-all font-mono">{`${baseUrl}/exam/${exam.id}`}</span>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
             <Pagination totalItems={filteredExams.length} currentPage={examPage} setCurrentPage={setExamPage} />
           </div>
        )}

        {/* APPLICANTS TAB */}
        {activeTab === "Applicants" && (
           <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-700 text-sm mr-2">Filters:</h3>
                    
                    {/* Position Filter */}
                    <select 
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white min-w-[140px]"
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                    >
                        {uniquePositions.map(pos => (
                        <option key={pos} value={pos}>{pos || "Unknown"}</option>
                        ))}
                    </select>

                     {/* Status Filter - NEW */}
                     <select 
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white min-w-[120px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status === "All" ? "All Status" : status}</option>
                        ))}
                    </select>
                 </div>
                  
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search candidate..." 
                      className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm w-64"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                       <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Date</th>
                       <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Candidate</th>
                       <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Role / Job</th>
                       <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                       <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {paginatedUsers.map(user => (
                       <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                         <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                         <td className="p-4">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                         </td>
                         <td className="p-4">
                           <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                             {user.positionApplied || (user.jobPost ? user.jobPost.title : "General")}
                           </span>
                         </td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                             user.examStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                             user.examStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                             user.examStatus === 'COMPLETED' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-gray-100 text-gray-600'
                           }`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${
                               user.examStatus === 'PASSED' ? 'bg-green-500' :
                               user.examStatus === 'FAILED' ? 'bg-red-500' :
                               user.examStatus === 'COMPLETED' ? 'bg-yellow-500' :
                               'bg-gray-400'
                             }`}></span>
                             {user.examStatus}
                           </span>
                         </td>
                         <td className="p-4 text-right flex justify-end gap-2">
                           {user.resumeUrl && (
                             <a 
                               href={user.resumeUrl} 
                               target="_blank" 
                               className="text-gray-500 hover:text-primary transition" 
                               title="View Resume"
                               rel="noreferrer"
                             >
                               <DocumentTextIcon className="w-5 h-5" />
                             </a>
                           )}
                           <Link href={`/admin/exams/${user.jobPost?.examId || ''}`} className="text-gray-500 hover:text-primary transition" title="View Application">
                              <EyeIcon className="w-5 h-5" />
                           </Link>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {paginatedUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      No applicants match your filters.
                    </div>
                 )}
               </div>
               <Pagination totalItems={filteredUsers.length} currentPage={candidatePage} setCurrentPage={setCandidatePage} />
             </div>
           </div>
        )}

      </main>
    </div>
  );
}
