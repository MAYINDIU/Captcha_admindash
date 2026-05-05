import React from 'react';
import {
    HomeModernIcon, // Residential Area
    AcademicCapIcon, // Educational Institution
    ArchiveBoxIcon, // Hospitals
    ShoppingBagIcon, // Shopping Centers
    BookOpenIcon, // Mosque/Graveyard
    TrophyIcon, // Bashundhara Sports City
    FlagIcon, // Golf Driving Range
    SparklesIcon, // Park
} from '@heroicons/react/24/outline';

// Data for the features
const featureData = [
    { name: "Residential Area", icon: HomeModernIcon },
    { name: "Educational Institutions", icon: AcademicCapIcon },
    { name: "Hospitals & Clinics", icon: ArchiveBoxIcon },
    { name: "Shopping Centers", icon: ShoppingBagIcon },
    { name: "Mosque and Graveyard", icon: BookOpenIcon },
    { name: "Sports City Facilities", icon: TrophyIcon },
    { name: "Golf Driving Range", icon: FlagIcon },
    { name: "Lush Green Parks", icon: SparklesIcon },
];

const Features = () => {
    return (
        <>
            {/* Load Tailwind and set custom styles. Using dangerouslySetInnerHTML to correctly handle @import and body styles in JSX. */}
            <script src="https://cdn.tailwindcss.com"></script>
            <style dangerouslySetInnerHTML={{ __html: `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
              body { font-family: 'Inter', sans-serif; }
            `}} />
            
            <section className="py-4 sm:py-24 bg-gray-50 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    
                    {/* Header Section */}
                    <div className="text-center mb-6">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                            Community Features
                        </h2>
                       
                    </div>

                    {/* Features Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
                        {featureData.map((feature) => (
                            <div
                                key={feature.name}
                                  className="group relative p-6 sm:p-8 bg-white rounded-xl shadow-lg 
                                           border-2 border-gray-200 
                                           hover:bg-red-50              {/* Red tint background on hover */}
                                           hover:border-red-600          {/* Red border on hover */}
                                           hover:shadow-2xl              {/* Deeper shadow on hover */}
                                           transition-all duration-300 ease-in-out
                                           transform hover:-translate-y-2 {/* Lift effect on hover */}
                                           flex flex-col items-center text-center cursor-pointer"
                            >
                                {/* Icon Container - Elevated look */}
                                <div className="flex-shrink-0 mb-6">
                                    <div className="flex items-center justify-center h-16 w-16 
                                                bg-red-100 text-red-600 rounded-2xl shadow-md {/* Initial red icon styling */}
                                                group-hover:bg-red-600 group-hover:text-white {/* Icon inversion on hover */}
                                                transition-all duration-300 ease-in-out 
                                                transform group-hover:scale-105">
                                        <feature.icon className="h-8 w-8" aria-hidden="true" />
                                    </div>
                                </div>
                                
                                {/* Feature Name */}
                                <h3 className="text-base font-semibold text-gray-800 
                                            group-hover:text-blue-700 transition-colors duration-300">
                                    {feature.name}
                                </h3>
                                
                                {/* Accent line on hover (bottom border effect) */}
                                <span className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-transparent rounded-t-full 
                                                group-hover:bg-blue-500 transition-all duration-300 ease-in-out">
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Features;