import React from 'react';
import bannerImage from '../Assets/Slider/client.jpg';

const AlHamraPremiumSection = () => {
  return (
    <section className="bg-white py-0"> 
      <div className="w-full mx-auto px-0"> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch overflow-hidden"> 
          
          {/* Left Side — Image Container */}
          <div className="w-full relative bg-gray-300"> 
            <img
              src={bannerImage}
              alt="Al Hamra Homes Luxury Living"
              className="w-full h-full min-h-[300px] object-cover" 
            />
          </div>

          {/* Right Side — Gradient Background with Premium Content */}
          {/* Updated to a sleek red-to-maroon gradient */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 flex flex-col justify-center"> 
            <div className="p-8 lg:p-12"> 
                <h2 className="text-xl font-medium text-white uppercase tracking-[0.2em] mb-2">
                  আলহামরা হোমস (Al Hamra Homes)
                </h2>
                
                <p className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  আধুনিক স্থাপত্যে আস্থার নতুন নাম
                </p>
                
                <p className="text-lg text-gray-100 mb-8 leading-relaxed">
                  আলহামরা হোমস আপনার স্বপ্নের আবাসনকে বাস্তবে রূপ দিতে প্রতিশ্রুতিবদ্ধ। উদ্ভাবনী নকশা, গুণগত মান এবং নান্দনিকতার সমন্বয়ে আমরা গড়ে তুলি এমন কমিউনিটি, যা আপনার জীবনযাত্রার মানকে নিয়ে যাবে এক নতুন উচ্চতায়।
                </p>

                <a
                  href="/about-us"
                  className="inline-block px-8 py-3 text-md font-bold text-red-700 
                             bg-white rounded-sm shadow-lg 
                             hover:bg-gray-100 transition duration-300 self-start"
                >
                  আমাদের সম্পর্কে জানুন
                </a>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default AlHamraPremiumSection;