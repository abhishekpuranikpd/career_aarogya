import Image from "next/image";

export default function Footer() {
  const partners = [
    {
      url: "https://res.cloudinary.com/dorreici1/image/upload/v1763636388/420a5318-cb6c-4915-a728-979d8973a9d1.png",
      alt: "Aarogya Aadhar Main"
    },
    {
      url: "https://res.cloudinary.com/dorreici1/image/upload/v1763636568/6bdabdf5-194a-4cac-a00d-e174147561a8.png",
      alt: "Partner 1"
    },
    {
      url: "https://res.cloudinary.com/dorreici1/image/upload/v1761822292/31712b9dcb3dd72cc635256117eb2f75af4ba69a_ew2h8z.png",
      alt: "Partner 2"
    },
    {
      url: "https://res.cloudinary.com/dorreici1/image/upload/v1763636613/9038662b-9ff4-43f9-84be-06aa4ef1a090.png",
      alt: "Partner 3"
    }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        
        {/* Logos Section */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-8 opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
           {partners.map((p, idx) => (
             <div key={idx} className="relative h-16 w-32 sm:w-40 transition-transform hover:scale-105">
               <Image 
                 src={p.url} 
                 alt={p.alt} 
                 fill 
                 className="object-contain"
               />
             </div>
           ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Aarogya Aadhar. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-primary transition">Privacy Policy</a>
             <a href="#" className="hover:text-primary transition">Terms of Service</a>
             <a href="#" className="hover:text-primary transition">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
