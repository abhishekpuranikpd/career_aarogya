"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import JobImageUpload from "@/components/JobImageUpload";
import JobPdfUpload from "@/components/JobPdfUpload";

// Helper to format datetime-local from ISO string
function toDatetimeLocal(isoStr) {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    // format: YYYY-MM-DDTHH:mm
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditJobPost({ params }) {
    const router = useRouter();
    const { id: jobId } = use(params);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        responsibilitiesPdf: "",
        location: "",
        type: "Full-time",
        salary: "",
        examId: "",
        isActive: true,
        // New fields
        referenceIdPrefix: "",
        whatsappGroupLink: "",
        examStartDate: "",
        applicationStartDate: "",
        resultDate: "",
        inductionDate: "",
        joiningDate: "",
        applicationProcess: "",
        externalExamUrl: "",
        externalExamId: "",
        externalBatchId: "",
    });
    const [exams, setExams] = useState([]);
    const [externalExams, setExternalExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetch("/api/exam")
            .then(res => res.json())
            .then(data => setExams(data))
            .catch(err => console.error("Failed to fetch exams", err));
            
        fetch("/api/admin/external-data")
            .then(res => res.json())
            .then(data => {
                if(data.exams) setExternalExams(data.exams);
            })
            .catch(err => console.error("Failed to fetch external exams", err));

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
                    responsibilitiesPdf: data.responsibilitiesPdf || "",
                    location: data.location,
                    type: data.type,
                    salary: data.salary || "",
                    examId: data.examId || "",
                    isActive: data.isActive,
                    referenceIdPrefix: data.referenceIdPrefix || "",
                    whatsappGroupLink: data.whatsappGroupLink || "",
                    examStartDate: toDatetimeLocal(data.examStartDate),
                    applicationStartDate: toDatetimeLocal(data.applicationStartDate),
                    resultDate: toDatetimeLocal(data.resultDate),
                    inductionDate: toDatetimeLocal(data.inductionDate),
                    joiningDate: toDatetimeLocal(data.joiningDate),
                    applicationProcess: data.applicationProcess || "",
                    externalExamUrl: data.externalExamUrl || "",
                    externalExamId: data.externalExamId || "",
                    externalBatchId: data.externalBatchId || "",
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
                const data = await res.json();
                alert("Failed to update job: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSyncApplicants = async () => {
        if (!formData.externalExamId || !formData.externalBatchId) {
            alert("Please select an external exam and batch first.");
            return;
        }
        setSyncing(true);
        try {
            const res = await fetch(`/api/admin/jobs/${jobId}/assign-external`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    externalExamId: formData.externalExamId,
                    externalBatchId: formData.externalBatchId
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || "Successfully synced applicants!");
            } else {
                alert("Failed to sync: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSyncing(false);
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

                        {/* Responsibilities PDF */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Roles &amp; Responsibilities (PDF/Docx)</label>
                            <JobPdfUpload
                                onUploadComplete={(url) => setFormData({ ...formData, responsibilitiesPdf: url })}
                                initialUrl={formData.responsibilitiesPdf}
                            />
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

                        {/* ── NEW: Applicant Reference & Communication ── */}
                        <div className="p-5 bg-green-50 rounded-xl border border-green-100 space-y-4">
                            <h3 className="font-semibold text-green-900">Applicant Reference &amp; Communication</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                        Reference ID Prefix <span className="text-xs text-gray-400">(2–4 letters)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none uppercase"
                                        placeholder="e.g. SN"
                                        value={formData.referenceIdPrefix}
                                        onChange={e => setFormData({ ...formData, referenceIdPrefix: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Applicant IDs like: {formData.referenceIdPrefix || "AA"}4821</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                        WhatsApp Group Link
                                    </label>
                                    <input
                                        type="url"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-200 outline-none"
                                        placeholder="https://chat.whatsapp.com/..."
                                        value={formData.whatsappGroupLink}
                                        onChange={e => setFormData({ ...formData, whatsappGroupLink: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── NEW: Important Dates ── */}
                        <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 space-y-4">
                            <h3 className="font-semibold text-amber-900">📅 Important Dates for Applicants</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Application Starts On</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                                        value={formData.applicationStartDate}
                                        onChange={e => setFormData({ ...formData, applicationStartDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Exam Starts On</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                                        value={formData.examStartDate}
                                        onChange={e => setFormData({ ...formData, examStartDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Result Declared On</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                                        value={formData.resultDate}
                                        onChange={e => setFormData({ ...formData, resultDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Induction Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                                        value={formData.inductionDate}
                                        onChange={e => setFormData({ ...formData, inductionDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Joining Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-amber-200 outline-none text-sm"
                                        value={formData.joiningDate}
                                        onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Application Process */}
                        <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 space-y-4">
                            <h3 className="font-semibold text-purple-900 text-lg">📋 Application Process (HTML Supported)</h3>
                            <textarea
                                className="w-full border p-4 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none min-h-[200px] font-mono text-sm leading-relaxed whitespace-pre-wrap"
                                placeholder="Enter application steps (HTML allowed)..."
                                value={formData.applicationProcess}
                                onChange={e => setFormData({ ...formData, applicationProcess: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Linked Exam */}
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2">Exam Link (Internal)</h3>
                            <p className="text-sm text-blue-700 mb-4">Select the internal exam that applicants must take for this position.</p>
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
                            <div className="mt-4 border-t border-blue-200 pt-4">
                                <label className="block text-sm font-medium mb-1 text-blue-900">OR External Exam Configuration (Agent Portal)</label>
                                <p className="text-xs text-blue-700 mb-2">Configure an external exam on Team Aarogya Aadhar portal.</p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-700">External Exam Portal Link (Optional)</label>
                                        <input 
                                            type="url" 
                                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                                            placeholder="https://work.aarogyaaadhar.com/exam/..."
                                            value={formData.externalExamUrl}
                                            onChange={e => setFormData({...formData, externalExamUrl: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-700">Select External Exam</label>
                                        <select
                                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white"
                                            value={formData.externalExamId}
                                            onChange={e => setFormData({...formData, externalExamId: e.target.value, externalBatchId: ""})}
                                        >
                                            <option value="">-- Select Exam from Agent Portal --</option>
                                            {externalExams.map(ex => (
                                                <option key={ex.id} value={ex.id}>{ex.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {formData.externalExamId && (
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-700">Select Batch</label>
                                            <select
                                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none bg-white"
                                                value={formData.externalBatchId}
                                                onChange={e => setFormData({...formData, externalBatchId: e.target.value})}
                                            >
                                                <option value="">-- Select Batch --</option>
                                                {externalExams.find(ex => ex.id === formData.externalExamId)?.batches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    
                                    {formData.externalExamId && formData.externalBatchId && (
                                        <button
                                            type="button"
                                            onClick={handleSyncApplicants}
                                            disabled={syncing}
                                            className="mt-2 w-full py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
                                        >
                                            {syncing ? "Syncing..." : "Sync Current Applicants to External Batch"}
                                        </button>
                                    )}
                                </div>
                            </div>
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
