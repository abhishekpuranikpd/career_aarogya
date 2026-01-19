"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CreateExam() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("YES_NO"); // YES_NO or WRITING
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "", options: ["Yes", "No"] }]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: "", options: type === "YES_NO" ? ["Yes", "No"] : [] }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          questions: questions.map(q => ({ id: q.id.toString(), text: q.text, options: q.options }))
        })
      });

      if (res.ok) {
        alert("Exam created successfully!");
        router.push("/admin/dashboard");
      } else {
        alert("Failed to create exam");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-3xl">
        <Link href="/admin/dashboard" className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Exam</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Exam Title</label>
              <input 
                type="text" 
                required
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. Nursing Entrance Test"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Exam Type</label>
              <select 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  // Reset questions options based on type change
                  setQuestions(questions.map(q => ({ 
                    ...q, 
                    options: e.target.value === "YES_NO" ? ["Yes", "No"] : [] 
                  })));
                }}
              >
                <option value="YES_NO">Yes / No Questions</option>
                <option value="WRITING">Descriptive / Writing</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Questions</label>
                <button type="button" onClick={addQuestion} className="text-sm text-primary flex items-center hover:underline">
                  <PlusIcon className="w-4 h-4 mr-1" /> Add Question
                </button>
              </div>
              
              {questions.map((q, idx) => (
                <div key={q.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="mt-3 text-sm font-bold text-gray-400">#{idx + 1}</span>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      required
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                      placeholder="Enter question text..."
                      value={q.text}
                      onChange={e => updateQuestion(q.id, e.target.value)}
                    />
                    {type === "YES_NO" && (
                      <div className="flex gap-2 mt-2">
                         <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Option: Yes</span>
                         <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Option: No</span>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 mt-2">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
            >
              {loading ? "Creating..." : "Publish Exam"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
