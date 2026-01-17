import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Force dynamic since we fetch from DB
export const dynamic = 'force-dynamic';

async function getExams() {
  try {
    const exams = await prisma.exam.findMany();
    // Use dummy data if no exams in DB for demonstration
    if (exams.length === 0) {
      return [
        { id: "demo-1", title: "General Aptitude Test", type: "YES_NO", description: "A quick 10-minute test to assess your logical reasoning." },
        { id: "demo-2", title: "Essay Writing", type: "WRITING", description: "Express your views on the future of healthcare." }
      ];
    }
    return exams;
  } catch (e) {
    return [];
  }
}

export default async function ExamList() {
  const exams = await getExams();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Exams</h1>
      <p className="text-gray-500 mb-8">Select an exam to proceed with your application assessment.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${exam.type === 'YES_NO' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {exam.type === 'YES_NO' ? 'Multiple Choice' : 'Writing'}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
            <p className="text-gray-500 mb-6 text-sm">{exam.description || "Complete this assessment to qualify."}</p>
            <Link href={`/exam/${exam.id}`} className="block w-full py-2 text-center border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
              Start Exam
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
