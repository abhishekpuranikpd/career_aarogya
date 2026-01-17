import Link from "next/link";
import { ArrowRightIcon, UserGroupIcon, AcademicCapIcon, HeartIcon, GlobeAsiaAustraliaIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 via-white to-blue-50 overflow-hidden pt-10">
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 mb-6 animate-fade-in-up">
            <span className="text-blue-700 font-bold text-sm tracking-wider uppercase">Future of Digital Health</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900">
            Shape the Future of <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Healthcare in India</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Join Aarogya Aadhar and become part of a revolutionary mission to digitize and improve healthcare accessibility for a billion lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
              Explore Careers
            </Link>
            <Link href="/register" className="px-8 py-4 bg-white text-primary border-2 border-primary/20 rounded-full font-bold text-lg hover:border-primary hover:bg-blue-50 transition shadow-sm">
              Join Us Now
            </Link>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200/50">
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-1">50+</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Cities</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-1">1M+</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Patients Served</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-1">200+</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Partner Hospitals</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-1">24/7</div>
              <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Build Your Career With Us?</h2>
            <p className="text-gray-500 text-lg">We offer more than just a job. We offer a pathway to make a real difference in the healthcare ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <GlobeAsiaAustraliaIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nationwide Impact</h3>
              <p className="text-gray-500 leading-relaxed">
                Work on projects that scale across India, touching lives in both metro cities and rural heartlands.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <AcademicCapIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Continuous Learning</h3>
              <p className="text-gray-500 leading-relaxed">
                Access to world-class training programs, workshops, and certifications to keep you ahead of the curve.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                 <HeartIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Inclusive Culture</h3>
              <p className="text-gray-500 leading-relaxed">
                We foster a diverse and inclusive environment where every voice is heard and every contribution matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
             <p className="text-blue-100 text-lg mb-8">
               Explore our current openings and find the perfect role where your skills can shine.
             </p>
             <Link href="/careers" className="inline-flex items-center text-white font-bold hover:text-blue-200 transition group">
               View All Open Positions <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
          <div>
            <Link href="/register" className="block px-8 py-4 bg-white text-primary rounded-lg font-bold text-center hover:bg-gray-100 transition shadow-lg">
               Apply General Application
            </Link>
            <p className="text-xs text-center text-blue-200 mt-3">Takes less than 5 minutes</p>
          </div>
        </div>
      </section>

    </div>
  );
}
