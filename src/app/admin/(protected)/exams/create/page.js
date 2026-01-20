"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    PlusIcon, 
    TrashIcon, 
    ArrowLeftIcon, 
    CheckCircleIcon, 
    DocumentTextIcon, 
    ListBulletIcon 
} from "@heroicons/react/24/outline";

export default function CreateExam() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { 
        id: Date.now(), 
        text: "Are you over 18?", 
        type: "RADIO", 
        options: ["Yes", "No"], 
        requiresExplanation: false,
        explanationLabel: "",
        wordLimit: 100
    }
  ]);
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper functions
  const addQuestion = () => {
    setQuestions([
        ...questions, 
        { 
            id: Date.now(), 
            text: "", 
            type: "RADIO", 
            options: ["Yes", "No"],
            requiresExplanation: false,
            wordLimit: 100 
        }
    ]);
  };

  const removeQuestion = (id) => {
    if(questions.length > 1) {
        setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const addOption = (qId) => {
    setQuestions(questions.map(q => {
        if (q.id === qId) {
            return { ...q, options: [...(q.options || []), "New Option"] };
        }
        return q;
    }));
  };

  const updateOption = (qId, optionIdx, value) => {
    setQuestions(questions.map(q => {
        if (q.id === qId) {
            const newOptions = [...q.options];
            newOptions[optionIdx] = value;
            return { ...q, options: newOptions };
        }
        return q;
    }));
  };

  const removeOption = (qId, optionIdx) => {
    setQuestions(questions.map(q => {
        if (q.id === qId) {
            return { ...q, options: q.options.filter((_, idx) => idx !== optionIdx) };
        }
        return q;
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (questions.length === 0) return alert("Add at least one question.");
    
    setLoading(true);
    
    try {
      const payload = {
          title,
          type: "CUSTOM",
          windowStart: windowStart || null,
          windowEnd: windowEnd || null,
          questions: questions.map(q => ({
              id: q.id.toString(),
              text: q.text,
              type: q.type,
              options: q.options || [],
              requiresExplanation: q.requiresExplanation,
              explanationLabel: q.explanationLabel,
              wordLimit: parseInt(q.wordLimit) || 100
          }))
      };

      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // alert("Exam created successfully!");
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        const err = await res.json();
        alert("Failed to create exam: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors font-medium">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-white p-8 border-b border-gray-100">
             <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
             <p className="text-gray-500 text-sm mt-1">Design your exam with multiple question types.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Exam Title */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Assessment Title</label>
              <input 
                type="text" 
                required
                className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-lg transition-all"
                placeholder="e.g. Senior Nursing Staff Assessment 2024"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            {/* Exam Timing Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">Start Date & Time</label>
                   <input 
                      type="datetime-local" 
                      className="w-full border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-700 font-medium"
                      value={windowStart}
                      onChange={e => setWindowStart(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">End Date & Time</label>
                   <input 
                      type="datetime-local" 
                      className="w-full border border-blue-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-gray-700 font-medium"
                      value={windowEnd}
                      onChange={e => setWindowEnd(e.target.value)}
                   />
                </div>
                <div className="col-span-full text-xs text-blue-600">
                    * Leave empty if the exam should be accessible anytime.
                </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-end border-b pb-4">
                  <label className="block text-lg font-bold text-gray-800">Questions ({questions.length})</label>
               </div>
              
              {questions.map((q, idx) => (
                <div key={q.id} className="relative bg-gray-50 p-6 rounded-xl border border-gray-200 group transition-all hover:shadow-md hover:border-gray-300">
                  <div className="absolute top-4 left-4 bg-white w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold text-gray-400 border border-gray-100 shadow-sm">
                      {idx + 1}
                  </div>
                  
                  <div className="ml-10 space-y-4">
                     {/* Question Header: Text & Type */}
                     <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                             <input 
                                type="text" 
                                required
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium"
                                placeholder="Enter question text..."
                                value={q.text}
                                onChange={e => updateQuestion(q.id, 'text', e.target.value)}
                              />
                        </div>
                        <div className="sm:w-48">
                            <select 
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white cursor-pointer"
                                value={q.type}
                                onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                            >
                                <option value="RADIO">Multiple Choice</option>
                                <option value="RADIO_WITH_INPUT">MCQ + Input</option>
                                <option value="TEXT">Descriptive Text</option>
                            </select>
                        </div>
                     </div>

                     {/* Options Management (Only for RADIO types) */}
                     {(q.type === 'RADIO' || q.type === 'RADIO_WITH_INPUT') && (
                         <div className="bg-white p-4 rounded-lg border border-gray-100">
                             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Options</label>
                             <div className="space-y-2">
                                 {q.options?.map((opt, optIdx) => (
                                     <div key={optIdx} className="flex items-center gap-2">
                                         <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                                         <input 
                                            type="text"
                                            className="flex-1 border-b border-transparent hover:border-gray-300 focus:border-primary outline-none py-1 text-sm bg-transparent"
                                            value={opt}
                                            onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                         />
                                         <button 
                                            type="button" 
                                            onClick={() => removeOption(q.id, optIdx)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                         >
                                             <TrashIcon className="w-4 h-4" />
                                         </button>
                                     </div>
                                 ))}
                                 <button 
                                    type="button" 
                                    onClick={() => addOption(q.id)}
                                    className="text-sm text-primary font-medium flex items-center mt-2 hover:underline"
                                 >
                                     <PlusIcon className="w-3 h-3 mr-1" /> Add Option
                                 </button>
                             </div>
                         </div>
                     )}

                     {/* Configuration: Explanation limit & Flags */}
                     <div className="flex flex-wrap gap-6 pt-2">
                        {/* Word Limit */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Max Words:</label>
                            <input 
                                type="number"
                                className="w-20 border p-2 rounded-lg text-sm bg-white"
                                value={q.wordLimit || 100}
                                onChange={(e) => updateQuestion(q.id, 'wordLimit', e.target.value)}
                            />
                        </div>

                        {/* Requires Explanation (Only Radio) */}
                        {q.type === 'RADIO' && (
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={q.requiresExplanation || false}
                                    onChange={(e) => updateQuestion(q.id, 'requiresExplanation', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">Require explanation for "Yes"</span>
                            </label>
                        )}
                     </div>

                     {/* Explanation Label (If required) */}
                     {q.requiresExplanation && (
                         <div className="animate-fadeIn">
                             <input 
                                type="text"
                                className="w-full border p-2 rounded-lg text-sm bg-white placeholder:text-gray-400"
                                placeholder="Label for explanation field (e.g. 'Please provide details...')"
                                value={q.explanationLabel || ""}
                                onChange={(e) => updateQuestion(q.id, 'explanationLabel', e.target.value)}
                             />
                         </div>
                     )}

                  </div>

                  {/* Remove Question Button */}
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(q.id)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2"
                    title="Remove Question"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-gray-100">
               <button 
                  type="button" 
                  onClick={addQuestion} 
                  className="flex items-center gap-2 text-primary font-bold hover:bg-blue-50 px-6 py-3 rounded-lg transition-colors border border-dashed border-blue-200 w-full sm:w-auto justify-center"
                >
                  <PlusIcon className="w-5 h-5" /> Add New Question
                </button>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="
                        px-10 py-3 bg-gray-900 text-white rounded-lg font-bold text-lg shadow-lg 
                        hover:bg-black hover:shadow-xl transition-all 
                        disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto
                    "
                >
                    {loading ? "Creating..." : "Publish Assessment"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
