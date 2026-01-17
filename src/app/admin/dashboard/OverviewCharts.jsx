"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function OverviewCharts({ users, jobs, exams }) {

    // 1. Status Distribution
    const statusCounts = users.reduce((acc, user) => {
        const status = user.examStatus || 'PENDING';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
    }));

    // 2. Applications by Job/Exam
    const jobCounts = users.reduce((acc, user) => {
        const title = user.positionApplied || (user.jobPost?.title) || "General";
        acc[title] = (acc[title] || 0) + 1;
        return acc;
    }, {});

    const jobData = Object.keys(jobCounts).map(title => ({
        name: title.length > 20 ? title.substring(0, 20) + '...' : title,
        count: jobCounts[title]
    })).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10

    // 3. Registration Timeline (Date Wise)
    const timelineCounts = users.reduce((acc, user) => {
        const date = new Date(user.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(timelineCounts).sort((a, b) => new Date(a) - new Date(b));

    // Cumulative or Daily? Let's do Daily for now
    const timelineData = sortedDates.map(date => ({
        date,
        applicants: timelineCounts[date]
    }));

    return (
        <div className="space-y-8 mt-8">
            <h2 className="text-xl font-bold text-gray-800">Advanced Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Status Distribution - Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Application Status Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Applications per Job - Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Top Roles by Applications</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={jobData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Registration Timeline - Area Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-700 mb-4">Application Trends (Last 30 Days)</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={timelineData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" />
                                <Tooltip />
                                <Area type="monotone" dataKey="applicants" stroke="#8884d8" fillOpacity={1} fill="url(#colorApplicants)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
