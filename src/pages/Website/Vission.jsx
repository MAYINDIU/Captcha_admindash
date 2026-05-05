import React from "react";
import { motion } from "framer-motion";
// আইকন ইমপোর্ট আপনার ফাইল পাথ অনুযায়ী একই আছে
 
import { FaEye, FaFlag } from 'react-icons/fa'; 

// ব্রেডক্রাম্বস কম্পোনেন্ট - ডার্ক ব্যাকগ্রাউন্ডের জন্য অপটিমাইজড
const Breadcrumbs = ({ crumbs }) => (
    <nav className="text-sm font-medium mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="list-none p-0 inline-flex">
            {crumbs.map((crumb, index) => {
                const isActive = index === crumbs.length - 1;
                
                // সক্রিয় আইটেমের জন্য গোল্ডেন কালার
                const activeClasses = 'font-bold text-amber-500'; 
                
                return (
                    <li key={index} className="flex items-center">
                        <a 
                            href={crumb.href} 
                            // টেক্সট কালার হালকা করা হয়েছে
                            className={`transition-colors ${
                                isActive 
                                    ? activeClasses 
                                    : 'text-gray-300 hover:text-white' 
                            }`}
                        >
                            {crumb.label}
                        </a>
                        {index < crumbs.length - 1 && (
                            <span className="mx-2 text-gray-400">/</span>
                        )}
                    </li>
                );
            })}
        </ol>
    </nav>
);


const VisionMissionAlHamra = () => {
    
    const primaryNavy = "#172554"; // ডিপ নেভি ব্লু

    const breadcrumbsData = [
        { label: "হোম", href: "/" },
        { label: "আমাদের সম্পর্কে", href: "/about-us" },
        { label: "মিশন ও ভিশন", href: "/vission" },
    ];

    return (
        <div className="bg-slate-50">

        {/* 1. Banner Section (Top) - Gradient BG, No Image */}
        <div className="relative w-full  mt-32 h-48 md:h-48 shadow-xl">
            {/* Consistent Gradient Background */}
            <div 
                className={`absolute inset-0 bg-gradient-to-r from-[#172554] to-[#1E3A8A] flex flex-col items-center justify-center p-4`} 
            >
                {/* ব্রেডক্রাম্বস */}
                <div className="absolute top-0 left-0 w-full pt-4">
                    <Breadcrumbs crumbs={breadcrumbsData} />
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-white text-4xl md:text-5xl font-extrabold text-center tracking-wider drop-shadow-lg mt-12" 
                >
                    আমাদের মিশন ও ভিশন
                </motion.h2>
            </div>
        </div>

            {/* 2. Content Section (Cards) */}
            <div className="py-20 md:py-28 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
                
                    {/* --- Vision Card --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 flex flex-col items-center text-center border-t-8 border-amber-500 transform hover:-translate-y-2 transition-transform duration-300" 
                    >
                        <div className="p-5 rounded-full bg-amber-100 mb-6">
                            <FaEye size={32} className="text-amber-600" /> 
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-black mb-5 text-slate-800">
                            আমাদের ভিশন
                        </h2>
                        
                        <p className="text-gray-600 text-justify text-lg leading-relaxed mb-6">
                            একটি স্মার্ট এবং পরিকল্পিত নগরায়ন গড়ার মাধ্যমে বাংলাদেশের আবাসন খাতে শ্রেষ্ঠত্বের প্রতীক হিসেবে নিজেদের প্রতিষ্ঠিত করা, যেখানে প্রতিটি পরিবার পাবে প্রশান্তি আর আভিজাত্যের ছোঁয়া। </p>

                        <p className="text-gray-700 text-justify text-base leading-relaxed italic border-l-4 border-amber-400 pl-4 bg-amber-50 p-3 rounded-r-lg">
                            "আমরা শুধু ইট-পাথরের কাঠামো গড়ি না, আমরা গড়ি বিশ্বাস এবং স্বপ্নের আগামী।"
                        </p>
                    </motion.div>

                    {/* --- Mission Card --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 flex flex-col items-center text-center border-t-8 border-emerald-500 transform hover:-translate-y-2 transition-transform duration-300" 
                    >
                        <div className="p-5 rounded-full bg-emerald-100 mb-6">
                            <FaFlag size={32} className="text-emerald-600" /> 
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-black mb-5 text-slate-800">
                            আমাদের মিশন
                        </h2>
                        
                        <p className="text-gray-600 text-justify text-lg leading-relaxed mb-6">
                           আমাদের লক্ষ্য হলো গ্রাহকদের জন্য সাশ্রয়ী অথচ বিলাসবহুল আবাসন নিশ্চিত করা। আধুনিক স্থাপত্যশৈলী এবং পরিবেশবান্ধব পরিকল্পনার মাধ্যমে আমরা একটি উন্নত জীবনযাত্রার মান তৈরি করতে কাজ করে যাচ্ছি।

                        </p>
                    
                    </motion.div>
                </div>
            </div>
            
            {/* 3. Call to Action or Footer Info */}
            <div className="py-16 bg-slate-800 text-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-amber-400 text-2xl md:text-3xl font-bold tracking-wide"
                >
                    আল হামরা হোমস: আপনার আস্থার ঠিকানা, স্বপ্নের গন্তব্য।
                </motion.p>
            </div>
        </div>
    );
};

export default VisionMissionAlHamra;