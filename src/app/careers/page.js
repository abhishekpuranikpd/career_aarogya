import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { MapPinIcon, CurrencyRupeeIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export const dynamic = 'force-dynamic';

async function getJobs() {
  const jobs = await prisma.jobPost.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  return jobs;
}

export default async function CareersPage() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Mission</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Discover opportunities to shape the future of digital healthcare in India with Livo Aarogya Aadhar PVT LTD.
          </p>
        </div>
      </section>

      {/* Job Grid */}
      <section className="container mx-auto px-4 -mt-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map(job => (
            <div key={job.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
              <Link href={`/careers/${job.id}`} className="block relative h-48 bg-gray-200">
                {job.imageUrl ? (
                  <Image src={job.imageUrl} alt={job.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                    <BriefcaseIcon className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-gray-800 uppercase tracking-wide">
                  {job.type || 'Full-time'}
                </div>
              </Link>
              
              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/careers/${job.id}`} className="block">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">{job.title}</h3>
                </Link>
                <div className="space-y-2 mb-6 flex-grow">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {job.location || 'Remote'}
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                      {job.salary}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-auto">
                  {job.responsibilitiesPdf && (
                    <a 
                      href={job.responsibilitiesPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                      View Roles & Responsibilities
                    </a>
                  )}
                  
                  <Link 
                    href={`/careers/${job.id}`}
                    className="block w-full text-center py-3 bg-gray-50 text-gray-600 font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <h3 className="text-xl font-medium mb-2">No Openings Currently</h3>
            <p>Please check back later or register for general consideration.</p>
          </div>
        )}
      </section>
    </div>
  );
}
