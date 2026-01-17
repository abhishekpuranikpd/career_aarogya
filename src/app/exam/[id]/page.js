"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// Mock questions for demo if DB is empty
const DEMO_QUESTIONS = {
  "demo-1": [
    { id: "q1", text: "Are you comfortable working in night shifts?", options: ["Yes", "No"] },
    { id: "q2", text: "Do you have prior experience in healthcare?", options: ["Yes", "No"] },
    { id: "q3", text: "Are you willing to relocate if required?", options: ["Yes", "No"] },
  ],
  "demo-2": [
    { id: "w1", text: "Describe a challenging situation you handled in your previous role.", options: [] },
    { id: "w2", text: "Why do you want to join Aarogya Aadhar?", options: [] },
  ]
};

export default function ExamSession({ params }) {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Unwrap params safely
  const examId = params.id; 

  useEffect(() => {
    const fetchExam = async () => {
      try {
        // Try fetching from API first
        const res = await fetch(`/api/exam/${examId}`);
        if (res.ok) {
          const data = await res.json();
          // The API returns { id, title, questions, ... }
          if (data && data.questions) {
            setQuestions(data.questions);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to fetch exam", e);
      }

      // Fallback to demo if API fails or returns nothing (for dev/demo purposes)
      if (DEMO_QUESTIONS[examId]) {
        setQuestions(DEMO_QUESTIONS[examId]);
      } else {
        // Default fallback if nothing found (e.g. for creating new UI flow before backend ready)
        // ideally show error, but keeping empty for now
      }
      setLoading(false);
    };

    if (examId) {
      fetchExam();
    }
  }, [examId]);

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Simulate network delay for submission
    setTimeout(async () => {
       try {
        await fetch("/api/exam/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId,
            answers
            // In a real app, include userId or session token
          })
        });
       } catch (e) {
         console.error(e);
       }
       
      setCompleted(true);
      setSubmitting(false);
    }, 1500);
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading assessment...</div>;

  if (completed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Submitted!</h2>
        <p className="text-gray-500 mb-8 max-w-md">Your responses have been recorded successfully. Our team will review your application and contact you shortly.</p>
        <button 
          onClick={() => router.push('/')} 
          className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Assessment</h1>
          <p className="text-gray-500">Please answer all questions honestly and to the best of your ability.</p>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const isQuestionYesNo = q.options && q.options.length > 0;
            
            return (
              <div key={q.id || idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span>
                  {q.text}
                </h3>
                
                {isQuestionYesNo ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {q.options.map(opt => (
                      <label 
                        key={opt} 
                        className={`
                          flex-1 flex items-center justify-center py-4 px-6 rounded-xl cursor-pointer transition-all border-2
                          ${answers[q.id] === opt 
                            ? 'bg-primary/5 border-primary text-primary font-bold shadow-sm' 
                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name={q.id} 
                          value={opt} 
                          className="hidden"
                          onChange={() => handleAnswer(q.id, opt)}
                          checked={answers[q.id] === opt}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea 
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[140px] text-gray-700 placeholder:text-gray-400"
                    placeholder="Type your detailed answer here..."
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    value={answers[q.id] || ''}
                  ></textarea>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="
              px-10 py-4 bg-primary text-white rounded-full font-bold text-lg shadow-xl 
              hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-1 transition-all 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none
            "
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Response...
              </span>
            ) : 'Submit Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
}
