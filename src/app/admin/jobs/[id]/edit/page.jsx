"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import JobImageUpload from "@/components/JobImageUpload";

export default function EditJobPost({ params }) {
    const router = useRouter();
    const { id: jobId } = use(params);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        location: "",
        type: "Full-time",
        salary: "",
        examId: "",
        isActive: true
    });
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch Exams
        fetch("/api/exam")
            .then(res => res.json())
            .then(data => setExams(data))
            .catch(err => console.error("Failed to fetch exams", err));

        // Fetch Job Details
        fetch(`/api/admin/jobs/${jobId}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch job");
                return res.json();
            })
            .then(data => {
                setFormData({
                    title: data.title,
                    description: data.description,
                    imageUrl: data.imageUrl || "",
                    location: data.location,
                    type: data.type,
                    salary: data.salary || "",
                    examId: data.examId || "",
                    isActive: data.isActive
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert("Failed to load job details");
                router.push("/admin/dashboard");
            });
    }, [jobId, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/jobs/${jobId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Job Post updated successfully!");
                router.push("/admin/dashboard");
            } else {
                alert("Failed to update job");
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading job details...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-3xl">
                <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Edit Job Opening</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                                {formData.isActive ? "ACTIVE" : "CLOSED"}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Job Title</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                            <textarea
                                required
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[150px]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Cover Image</label>
                            <JobImageUpload
                                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                            />
                            {formData.imageUrl && (
                                <div className="mt-2 text-xs text-green-600">Current Image Linked</div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Employment Type</label>
                                <select
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Internship</option>
                                    <option>Contract</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
                                <input
                                    type="text"
                                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Salary */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Salary Range (Optional)</label>
                            <input
                                type="text"
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                value={formData.salary}
                                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                            />
                        </div>

                        {/* Linked Exam */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">Assessment Link</h3>
                            <select
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                                value={formData.examId}
                                onChange={e => setFormData({ ...formData, examId: e.target.value })}
                            >
                                <option value="">-- No Exam Linked --</option>
                                {exams.map(exam => (
                                    <option key={exam.id} value={exam.id}>{exam.title} ({exam.type})</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-lg"
                        >
                            {saving ? "Saving Changes..." : "Update Job Post"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
