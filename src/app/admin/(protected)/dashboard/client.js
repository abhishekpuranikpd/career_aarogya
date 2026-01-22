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
  CheckBadgeIcon,
  Bars3Icon,
  XMarkIcon,
  RocketLaunchIcon
} from "@heroicons/react/24/outline";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// --- COMPONENTS FOR OVERVIEW ---
const StatCard = ({ title, value, icon: Icon, colorClass, footer }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass.bg} ${colorClass.text} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`text-xs font-bold px-2 py-1 rounded-full ${colorClass.bg} ${colorClass.text} opacity-80`}>
        Overview
      </div>
    </div>
    <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
    <div className="text-4xl font-bold text-gray-900 tracking-tight">{value}</div>
    {footer && <div className="mt-3 text-xs text-gray-400 font-medium flex items-center gap-1">
       <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
       {footer}
    </div>}
  </div>
);

const ActivityFeedItem = ({ title, subtitle, time, type }) => (
  <div className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
    <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
        type === 'user' ? 'bg-blue-100 text-blue-600' : 
        type === 'exam' ? 'bg-purple-100 text-purple-600' : 
        'bg-green-100 text-green-600'
    }`}>
       {type === 'user' ? <UserGroupIcon className="w-5 h-5"/> : <DocumentTextIcon className="w-5 h-5"/>}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
      <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide font-medium">{time}</p>
    </div>
  </div>
);

const QuickActionBtn = ({ icon: Icon, label, color, onClick, link }) => {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white group cursor-pointer h-full`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 text-center">{label}</span>
      <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold">Perform Action →</span>
    </div>
  );

  if (link) return <Link href={link} className="block h-full">{content}</Link>;
  return <button onClick={onClick} className="block w-full h-full">{content}</button>;
};


export default function DashboardClient({ initialData, baseUrl }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
  
  // Extract Data from Consolidated Prop
  const { users, jobs, exams, system } = initialData;

  // --- PAGINATION HELPER ---
  const Pagination = ({ totalItems, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalItems === 0) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 gap-4">
         
         {/* Mobile: Simple Prev/Next */}
         <div className="flex flex-1 justify-between sm:hidden w-full">
            <button key="prev-mobile"
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button key="next-mobile"
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
         </div>

         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
              </p>
              {setItemsPerPage && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows:</span>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1); // Reset to page 1 on change
                        }}
                        className="border-gray-300 rounded-md text-sm py-1 focus:ring-primary focus:border-primary"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
              )}
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
                {/* Show limited page numbers if too many pages */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    // Simple logic to show first 5 pages or sliding window could be implemented
                    // For now, showing first 5 for simplicity or all if < 5
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) return null; 
                    }
                    
                    return (
                   <button
                     key={pageNum}
                     onClick={() => setCurrentPage(pageNum)}
                     className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                   >
                     {pageNum}
                   </button>
                )})}
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
  const [usersList, setUsersList] = useState(users.all);
  const [userSearch, setUserSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); 
  const [sortFilter, setSortFilter] = useState("Newest"); // NEW: Sort State
  const [candidatePage, setCandidatePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // NEW: Items per page state

  // --- EXAMS STATE ---
  const [examsList, setExamsList] = useState(exams.all);
  const [examSearch, setExamSearch] = useState("");
  const [examPage, setExamPage] = useState(1);

  // --- JOBS STATE ---
  const [jobsList, setJobsList] = useState(jobs.all);
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [jobStatusFilter, setJobStatusFilter] = useState("All");

  // Keep actions same, but update local state references
  const handleDeleteJob = async (jobId) => {
    if(!window.confirm("Are you sure you want to delete this job post?")) return;
    try {
        const res = await fetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
        if(res.ok) setJobsList(prev => prev.filter(j => j.id !== jobId));
        else alert("Failed to delete job.");
    } catch(e) { console.error(e); alert("Error deleting job"); }
  };

  const handleDeleteExam = async (examId) => {
    if(!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
        const res = await fetch(`/api/admin/exams/${examId}`, { method: 'DELETE' });
        if(res.ok) setExamsList(prev => prev.filter(e => e.id !== examId));
        else alert("Failed to delete exam.");
    } catch(e) { console.error(e); alert("Error deleting exam"); }
  };

  const handleStatusUpdate = async (userId, newStatus) => {
      try {
          // Optimistic update
          setUsersList(prev => prev.map(u => u.id === userId ? { ...u, examStatus: newStatus } : u));
          
          const res = await fetch(`/api/admin/users/${userId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          
          if (!res.ok) {
              // Revert if failed
              alert("Failed to update status");
              // Ideally re-fetch or revert state here
          }
      } catch (e) {
          console.error(e);
          alert("Error updating status");
      }
  };

  // --- FILTERING LOGIC ---
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchedPos = user.positionApplied || (user.jobPost ? user.jobPost.title : "General");
    const matchesPosition = positionFilter === "All" || matchedPos === positionFilter;
    const matchesStatus = statusFilter === "All" || user.examStatus === statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  }).sort((a, b) => { // NEW: Sorting Logic
      if (sortFilter === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortFilter === "Oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortFilter === "Name A-Z") return a.name.localeCompare(b.name);
      return 0;
  });

  const filteredExams = examsList.filter(exam => 
    exam.title.toLowerCase().includes(examSearch.toLowerCase())
  );

  const filteredJobs = jobsList.filter(job => {
     const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                           job.location.toLowerCase().includes(jobSearch.toLowerCase());
     const matchesStatus = jobStatusFilter === "All" || 
                           (jobStatusFilter === "Active" ? job.isActive : !job.isActive);
     return matchesSearch && matchesStatus;
  });

  // --- PAGINATION SLICING ---
  const paginatedUsers = filteredUsers.slice((candidatePage - 1) * itemsPerPage, candidatePage * itemsPerPage);
  const paginatedExams = filteredExams.slice((examPage - 1) * 5, examPage * 5); // Keep fixed 5 for others or update similarly
  const paginatedJobs = filteredJobs.slice((jobPage - 1) * 5, jobPage * 5);

  const uniquePositions = ["All", ...new Set(users.all.map(u => u.positionApplied || (u.jobPost?.title)).filter(Boolean))];
  const uniqueStatuses = ["All", "PENDING", "PASSED", "FAILED", "INTERVIEW", "HIRED", "REJECTED"];

  // --- CHART DATA PREPARATION ---
  const positionData = Object.entries(users.byPosition).map(([name, value]) => ({ name, value }));
  const statusData = [
      { name: 'Pending', value: users.funnel.Pending },
      { name: 'Qualified', value: users.funnel.passed },
      { name: 'Interview', value: users.funnel.interview },
      { name: 'Hired', value: users.funnel.hired },
      { name: 'Rejected', value: users.funnel.rejected }
  ].filter(d => d.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

  // --- DOWNLOAD HELPER ---
  const downloadCSV = () => {
    const headers = ["Name", "Email", "Mobile", "Position", "Status", "Date"];
    const rows = usersList.map(u => [
      u.name, 
      u.email, 
      u.mobile || "N/A", 
      u.positionApplied || (u.jobPost?.title || "General"), 
      u.examStatus, 
      new Date(u.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "applicants_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sidebar Items
  const SidebarItem = ({ name, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(name);
        setIsSidebarOpen(false); // Close sidebar on mobile select
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${
        activeTab === name 
          ? "bg-gradient-to-r from-blue-50 to-white text-primary shadow-sm border-l-4 border-primary" 
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === name ? "text-primary" : "text-gray-400 group-hover:text-gray-600"}`} />
      <span className="relative z-10">{name}</span>
    </button>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50/50">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex-shrink-0 shadow-xl md:shadow-none`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center md:hidden mb-6">
             <h2 className="text-lg font-bold text-gray-800">Menu</h2>
             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="w-6 h-6" />
             </button>
          </div>
          
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 hidden md:block">Admin Portal</h2>
          <div className="space-y-2 flex-grow">
            <SidebarItem name="Overview" icon={HomeIcon} />
            <SidebarItem name="Careers" icon={BriefcaseIcon} />
            <SidebarItem name="Exams" icon={AcademicCapIcon} />
            <SidebarItem name="Applicants" icon={UserGroupIcon} />
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
             <div className="text-xs text-gray-400 text-center">
                &copy; 2026 Admin Dashboard
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full h-[calc(100vh-64px)]">
        
        {/* Mobile Header Toggle */}
        <div className="md:hidden mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{activeTab}</h1>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bars3Icon className="w-6 h-6" />
            </button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-8 hidden md:block">{activeTab}</h1>

        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
           <div className="space-y-8 animate-fadeIn pb-12">
             
             {/* 1. High-Level Metrics */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard 
                  title="Total Applicants" 
                  value={users.funnel.Total} 
                  icon={UserGroupIcon} 
                  colorClass={{ bg: 'bg-blue-600', text: 'text-white' }} // Updated colors
                  footer={`${users.recent.length} new in last 7 days`}
               />
               <StatCard 
                  title="Active Job Posts" 
                  value={jobs.activeCount} 
                  icon={BriefcaseIcon} 
                  colorClass={{ bg: 'bg-purple-600', text: 'text-white' }}
                  footer={`${jobs.all.length} total posts`}
               />
               <StatCard 
                  title="Pending Reviews" 
                  value={users.funnel.Pending} 
                  icon={DocumentTextIcon} 
                  colorClass={{ bg: 'bg-orange-500', text: 'text-white' }}
                  footer="Requires attention"
               />
               <StatCard 
                  title="Hired Candidates" 
                  value={users.funnel.hired} 
                  icon={CheckBadgeIcon} 
                  colorClass={{ bg: 'bg-green-600', text: 'text-white' }}
                  footer={`${((users.funnel.hired / users.funnel.Total) * 100 || 0).toFixed(1)}% conversion rate`}
               />
             </div>
             
             {/* 1.5 Quick Actions (NEW) */}
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                    <p className="text-sm text-gray-500">Manage your recruitment pipeline efficiently.</p>
                  </div>
                  <div className="hidden md:block text-xs font-medium text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">
                     Superadmin Controls
                  </div>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <QuickActionBtn icon={PlusIcon} label="Post New Job" color="bg-blue-600" link="/admin/jobs/create" />
                   <QuickActionBtn icon={AcademicCapIcon} label="Create Exam" color="bg-purple-600"  link="/admin/exams/create" /> 
                   <QuickActionBtn icon={UserGroupIcon} label="Review Applicants" color="bg-orange-500" onClick={() => { setActiveTab("Applicants"); setStatusFilter("PENDING"); }} />
                   <QuickActionBtn icon={RocketLaunchIcon} label="Export CSV" color="bg-gray-700" onClick={downloadCSV} />
               </div>
             </div>

             {/* 2. Charts Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Applicants by Position Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-800">Applicants by Position</h3>
                      <button onClick={downloadCSV} className="text-xs text-primary font-medium hover:underline">Download Report</button>
                   </div>
                   <div className="flex-1 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={positionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                        >
                          {positionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                   </div>
                </div>

                {/* Application Status Chart - DONUT */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                   <h3 className="font-bold text-gray-800 mb-6">Application Status Funnel</h3>
                   <div className="flex-1 w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60} // Donut style
                          outerRadius={90}
                          fill="#8884d8"
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                         <Legend 
                            verticalAlign="middle" 
                            align="right" 
                            layout="vertical"
                            iconType="circle"
                            wrapperStyle={{ right: 0 }}
                            formatter={(value, entry) => <span className="text-sm text-gray-600 font-medium ml-2">{value}</span>}
                         />
                      </PieChart>
                    </ResponsiveContainer>
                   </div>
                </div>
             </div>

             {/* 3. Detailed Lists */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Recent Registrations */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-800">Recent Registrations</h3>
                      <button onClick={() => setActiveTab('Applicants')} className="text-xs text-primary hover:underline font-medium">View All</button>
                   </div>
                   <div className="space-y-2">
                      {users.recent.map(user => (
                         <ActivityFeedItem 
                            key={user.id}
                            title={user.name}
                            subtitle={`Registered for ${user.positionApplied || 'General Role'}`}
                            time={new Date(user.createdAt).toLocaleDateString()}
                            type="user"
                         />
                      ))}
                      {users.recent.length === 0 && <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-400 text-sm">No recent activity</div>}
                   </div>
                </div>

                {/* Recent Exams */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-800">Recent Exam Submissions</h3>
                      <Link href="/admin/exams" className="text-xs text-primary hover:underline font-medium">View All</Link>
                   </div>
                   <div className="space-y-2">
                      {exams.recentResponses.map(res => (
                         <ActivityFeedItem 
                            key={res.id}
                            title={res.user?.name || "Unknown User"}
                            subtitle={`Submitted ${res.exam?.title || "Exam"}`}
                            time={new Date(res.submittedAt).toLocaleDateString()}
                            type="exam"
                         />
                      ))}
                       {exams.recentResponses.length === 0 && <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-400 text-sm">No recent submissions</div>}
                   </div>
                </div>
             </div>
             
             {/* 4. Top Performing Jobs Table */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Top Performing Job Posts</h3>
                    <button onClick={() => setActiveTab("Careers")} className="text-xs text-primary font-medium hover:underline">Manage Jobs</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Job Title</th>
                                <th className="px-6 py-4 font-semibold">Location</th>
                                <th className="px-6 py-4 font-semibold">Applications</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.top.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{job.title}</div>
                                        <div className="text-xs text-gray-400">{job.type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{job.location}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 w-16 overflow-hidden">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(job._count.applicants * 5, 100)}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{job._count.applicants}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                                            job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${job.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                            {job.isActive ? 'Active' : 'Closed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
           </div>
        )}

        {/* CAREERS (JOBS) TAB */}
        {activeTab === "Careers" && (
          <div className="space-y-6 animate-fadeIn pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                  <h3 className="text-lg font-bold text-gray-900 hidden md:block">Jobs</h3>
                  <div className="relative flex-1 sm:flex-none">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search jobs..." 
                      className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm w-full sm:w-64 bg-gray-50 focus:bg-white transition-colors"
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                    />
                  </div>
                  <select 
                      className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
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
                 className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-700 transition font-medium text-sm shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
               >
                 <PlusIcon className="w-4 h-4" /> Create  Job
               </Link>
            </div>

            {/* Job List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="grid grid-cols-1 divide-y divide-gray-100">
                 {paginatedJobs.length > 0 ? (
                    paginatedJobs.map(job => (
                      <div key={job.id} className="p-6 hover:bg-gray-50/50 transition flex flex-col sm:flex-row justify-between gap-4 group">
                         <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
                               💼
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                               <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1.5">
                                  <span>{job.location}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{job.type}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className={job.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                                     {job.isActive ? "Active" : "Closed"}
                                  </span>
                                  {job.exam && (
                                     <>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full text-xs font-medium border border-purple-100">
                                            <AcademicCapIcon className="w-3 h-3"/> {job.exam.title}
                                        </span>
                                     </>
                                  )}
                               </div>
                               <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                  <span>Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                          <div className="flex items-center gap-3 mt-4 sm:mt-0 ml-16 sm:ml-0">
                            <div className="text-center px-4 hidden sm:block">
                               <div className="text-xl font-bold text-gray-900">{job._count?.applicants || 0}</div>
                               <div className="text-xs text-gray-500 uppercase font-medium tracking-wide">Applicants</div>
                            </div>
                            <div className="flex gap-2 border-l pl-4 border-gray-200">
                               <button 
                                  onClick={() => {
                                      setPositionFilter(job.title);
                                      setActiveTab("Applicants");
                                  }}
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition" 
                                  title="View Linked Applicants"
                               >
                                  <UserGroupIcon className="w-5 h-5" />
                               </button>
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
                    <div className="p-16 text-center">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-2xl">💼</div>
                       <h3 className="text-gray-900 font-medium mb-1">No jobs found</h3>
                       <p className="text-gray-500 text-sm">Create a new job post to get started.</p>
                    </div>
                 )}
               </div>
               <Pagination totalItems={filteredJobs.length} currentPage={jobPage} setCurrentPage={setJobPage} itemsPerPage={5} />
            </div>
          </div>
        )}

        {/* EXAMS TAB */}
        {activeTab === "Exams" && (
           <div className="space-y-6 animate-fadeIn pb-12">
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
                 <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group flex flex-col h-full hover:border-blue-200">
                   <div className="flex justify-between items-start mb-4">
                     <Link href={`/admin/exams/${exam.id}`} className="font-bold text-lg leading-tight hover:text-primary block line-clamp-2 min-h-[3.5rem]">
                       {exam.title}
                     </Link>
                     <span className={`px-2.5 py-1 text-xs rounded-full font-bold whitespace-nowrap ml-2 flex-shrink-0 ${exam.type === 'YES_NO' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                       {exam.type === 'YES_NO' ? 'Yes/No' : 'MCQ'}
                     </span>
                   </div>
                   
                   <div className="text-sm text-gray-500 mb-6 flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                          <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-gray-700">{exam.questions.length} Questions</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-400 font-mono bg-gray-50 p-1.5 rounded truncate">ID: {exam.id}</p>
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
                            className="flex items-center justify-center w-10 h-full bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition"
                         >
                            <TrashIcon className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
             <Pagination totalItems={filteredExams.length} currentPage={examPage} setCurrentPage={setExamPage} itemsPerPage={5} />
           </div>
        )}

        {/* APPLICANTS TAB */}
        {activeTab === "Applicants" && (
           <div className="space-y-6 animate-fadeIn pb-12">
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

                    {/* Sort Filter - NEW */}
                    <select 
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white min-w-[120px]"
                        value={sortFilter}
                        onChange={(e) => setSortFilter(e.target.value)}
                    >
                        <option value="Newest">Newest First</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="Name A-Z">Name A-Z</option>
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
                           <div className="relative">
                             <select
                               value={user.examStatus}
                               onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                               className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all ${
                                 user.examStatus === 'PASSED' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                                 user.examStatus === 'FAILED' ? 'bg-red-100 text-red-700 focus:ring-red-500' :
                                 user.examStatus === 'COMPLETED' ? 'bg-yellow-100 text-yellow-700 focus:ring-yellow-500' :
                                 user.examStatus === 'HIRED' ? 'bg-blue-100 text-blue-700 focus:ring-blue-500' :
                                 user.examStatus === 'REJECTED' ? 'bg-gray-200 text-gray-700 focus:ring-gray-500' :
                                 'bg-gray-100 text-gray-600 focus:ring-gray-400'
                               }`}
                             >
                                <option value="PENDING">PENDING</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="PASSED">PASSED</option>
                                <option value="FAILED">FAILED</option>
                                <option value="INTERVIEW">INTERVIEW</option>
                                <option value="HIRED">HIRED</option>
                                <option value="REJECTED">REJECTED</option>
                             </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <ChevronRightIcon className="h-3 w-3 rotate-90" />
                             </div>
                           </div>
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
                           <Link href={`/admin/users/${user.id}`} className="text-gray-500 hover:text-primary transition" title="View Answers">
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
               <Pagination 
                   totalItems={filteredUsers.length} 
                   currentPage={candidatePage} 
                   setCurrentPage={setCandidatePage} 
                   itemsPerPage={itemsPerPage}
                   setItemsPerPage={setItemsPerPage}
               />
             </div>
           </div>
        )}

      </main>
    </div>
  );
}
