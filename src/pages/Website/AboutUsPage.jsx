import React from "react";
import { motion } from "framer-motion";
import { 
    FaMapMarkerAlt, 
    FaRoad, 
    FaIndustry, 
    FaHandsHelping,
    FaBuilding,
    FaShieldAlt
} from "react-icons/fa"; 
// ধরে নিন আপনার রিয়েল এস্টেট ব্যানার ইমপোর্ট করা আছে
import realEstateBanner from "./Assets/Galary/10.jpg"; 
import { Link } from "react-router-dom";

// ব্রেডক্রাম্বস কম্পোনেন্ট (প্রিমিয়াম গ্রেডিয়েন্ট)
const Breadcrumbs = ({ crumbs }) => (
    <nav className="text-sm font-medium mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="list-none p-0 inline-flex">
            {crumbs.map((crumb, index) => {
                const isActive = index === crumbs.length - 1;
                
                // সক্রিয় আইটেমের জন্য গ্রেডিয়েন্ট ক্লাস 
                // টপবার গ্রেডিয়েন্ট হওয়ায় টেক্সটকে সাদা (White) বা হালকা রাখা ভালো
                const activeClasses = 'font-bold text-white'; 
                
                return (
                    <li key={index} className="flex items-center">
                        <a 
                            href={crumb.href} 
                            // টপবার গ্রেডিয়েন্ট হওয়ায় টেক্সট রঙ পরিবর্তন
                            className={`transition-colors ${
                                isActive 
                                    ? activeClasses 
                                    : 'text-gray-200 hover:text-white' // হালকা রঙ ব্যবহার করা হয়েছে
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


const AlHamraProjectElegant = () => {
    
    // ব্রেডক্রাম্বস ডেটা
    const breadcrumbsData = [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "Our Project", href: "/projects/flagship" },
    ];
    
    // ১. ডেটা স্ট্রাকচার: রিয়েল এস্টেট ইনফরমেশন
    const locationData = [
        {
            icon: FaMapMarkerAlt,
            title: "সুবিধাজনক অবস্থান",
            description: "ঢাকা-নবাবগঞ্জের প্রধান সড়কের পাশে , যা ইতিমধ্যেই ৪ লেনে উন্নীত করার পরিকল্পনা গৃহীত হয়েছে।",
        },
        {
            icon: FaRoad,
            title: "উন্নত ও বহুমুখী যোগাযোগ ব্যবস্থা",
            description: "প্রকল্পটি ঢাকা জিরো পয়েন্ট (গুলিস্তান) থেকে ১৫ কিলোমিটার, তৃতীয় ধাপে অনুমোদিত মেট্রোরেল সংযোগ আমাদের প্রকল্পের নিকটবর্তী, মোহাম্মদপুর বসিলা ব্রিজ থেকে ১৩ কিলোমিটার, হেমায়েতপুর, সাভার থেকে ২১ কিলোমিটার দূরত্বে, ঢাকা আউটার সার্কুলার রিং রোড এর পাশেই , রিভার পার্ক মডেল টাউন অবস্থিত।",
        },
        {
            icon: FaIndustry,
            title: "অর্থনৈতিক কেন্দ্রবিন্দু",
            description: "বাংলাদেশের বৃহত্তম কেরানীগঞ্জ বিসিক শিল্পনগরী ও নবাবগঞ্জ অর্থনৈতিক অঞ্চল সংলগ্ন। সামনে রয়েছে আইটি পার্ক, পাওয়ার স্টেশনসহ একাধিক সরকারি মেগা প্রকল্প।",
        },
    ];
    
    // ২. নতুন ডেটা স্ট্রাকচার: গুণমান ও ভিত্তি
    const qualityData = [
        {
            icon: FaBuilding,
            title: "স্ট্রাকচারাল শ্রেষ্ঠত্ব",
            description: "সর্বাধুনিক Reinforced Cement Concrete (RCC) ফ্রেমওয়ার্ক এবং অভিজ্ঞ স্ট্রাকচারাল ইঞ্জিনিয়ারিং নিশ্চিত করে ভূ-কম্পন প্রতিরোধী (Earthquake Resistant) এবং দীর্ঘস্থায়ী কাঠামো।",
        },
        {
            icon: FaShieldAlt,
            title: "প্রিমিয়াম ফিনিশিং",
            description: "ইমপোর্টেড চীনামাটির (Porcelain) টাইলস, উচ্চমানের স্যানিটারি ওয়্যার (যেমন: RAK/Equivalent) এবং উন্নত পেইন্ট ব্যবহার করা হয়েছে এক অতুলনীয় আভিজাত্যের জন্য।",
        },
        {
            icon: FaHandsHelping,
            title: "নির্ভরযোগ্য সরবরাহ",
            description: "BSRM/KSRM-এর মতো শীর্ষ ব্র্যান্ডের রড এবং উচ্চ-গ্রেডের সিমেন্ট ব্যবহার করে নির্মাণ কাজে শূন্য-আপস নীতি বজায় রাখা হয়েছে।",
        },
    ];


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }} 
            className="min-h-screen mt-12 bg-white" 
        >
            
            {/* >>> ১. গ্রেডিয়েন্ট টপবার সেকশন শুরু <<< */}
            <div 
                className="bg-gradient-to-r from-[#172554] to-[#1E3A8A] pt-24 pb-5 px-4 sm:px-6 lg:px-20 text-white shadow-xl" // গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড
            > 
                {/* ব্রেডক্রাম্বস কম্পোনেন্ট */}
                <Breadcrumbs crumbs={breadcrumbsData} />
                
                {/* ১. Heading & Slogan */}
                <div className="text-center mb-5 max-w-7xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl font-medium uppercase tracking-[0.3em] text-amber-300 mb-4" // হালকা গোল্ডেন এক্সেন্ট
                    >
                        OUR PROJECTS
                    </motion.h2>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-4xl md:text-4xl font-extrabold text-white drop-shadow-md leading-tight" // টাইটেল সাদা
                    >
                        AL HAMRA HOMES 
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-gray-200 text-lg md:text-xl mt-6 max-w-4xl mx-auto leading-relaxed" // প্যারা সাদা/হালকা
                    >
                        AL HAMRA HOMES-এর  প্রকল্পটি—একটি অনন্য ও সম্ভাবনাময় আবাসন ও অর্থনৈতিক হাব হিসেবে গড়ে উঠছে। গ্রাহক সেবার মান সর্বোচ্চ রাখতে আমরা বদ্ধপরিকর।
                    </motion.p>
                </div>
            </div>
            {/* >>> গ্রেডিয়েন্ট টপবার সেকশন শেষ <<< */}
            
            {/* ২. কন্টেন্ট এরিয়া */}
            <div className="py-20 px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto"> 
                
                {/* ইমেজ ও টেক্সট সেকশন */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24"> 
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9 }}
                    >
                        <img
                            src={realEstateBanner} 
                            alt="Project Location"
                            className="w-full h-auto object-cover rounded-2xl shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-500" 
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9 }}
                        className="space-y-7 lg:pl-10" 
                    >
                        <h3 className="text-2xl font-semibold text-amber-600">A Vision for the Future</h3>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#172554] leading-snug">কেন আমাদের প্রকল্পটি শ্রেষ্ঠ?</h2>
                        <p className="text-gray-700 text-justify text-xl leading-8 border-l-4 border-amber-500 pl-4">
                            গুলিস্তান জিরো পয়েন্ট থেকে মাত্র **১৫ কিঃমিঃ** দূরে, যেখান থেকে গাড়িতে পৌঁছানো সম্ভব মাত্র **৩০ মিনিটে**। ঢাকা শহরের কেন্দ্র এবং অন্যান্য গুরুত্বপূর্ণ অঞ্চলের সাথে দ্রুত ও সহজ সংযোগ আমাদের প্রকল্পের প্রধান আকর্ষণ।
                        </p>
                        
                    </motion.div>
                </div>

                {/* ৩. Key Feature Cards (অবস্থান ও অর্থনৈতিক কেন্দ্রবিন্দু) */}
                <div className="text-center mb-14">
                    <h3 className="text-4xl font-extrabold text-gray-800">অতুলনীয় অর্থনৈতিক সম্ভাবনা</h3>
                    <p className="text-lg text-gray-600 mt-2">আমাদের প্রকল্পের ভিত্তি স্থাপিত হয়েছে দেশের মূল অর্থনৈতিক চালিকাশক্তিগুলোর ঠিক কেন্দ্রে।</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24"> 
                    {locationData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.18 }}
                            className="bg-[#172554] rounded-xl p-10 text-white shadow-2xl flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 relative overflow-hidden transform hover:ring-2 hover:ring-amber-500" 
                        >
                            <div className="p-4 bg-white bg-opacity-10 rounded-full mb-5">
                                <item.icon size={45} className="text-amber-500" /> 
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                            <p className="text-base text-gray-200">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
                
                {/* ৪. Unmatched Quality & Foundation */}
                <div className="text-center mb-14">
                    <h3 className="text-4xl font-extrabold text-gray-800">অতুলনীয় গুণমান ও স্থায়িত্ব</h3>
                    <p className="text-lg text-gray-600 mt-2">আমরা প্রতিটি নির্মাণ কাজে বিশ্বমানের উপকরণ ও প্রযুক্তির ব্যবহার নিশ্চিত করি।</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24"> 
                    {qualityData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.18 }}
                            className="bg-white rounded-xl p-10 shadow-2xl flex flex-col items-center text-center border-t-4 border-amber-500 hover:scale-[1.03] transition-all duration-300" 
                        >
                            <div className="p-4 bg-amber-500 bg-opacity-10 rounded-full mb-5">
                                <item.icon size={45} className="text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-[#172554]">{item.title}</h3>
                            <p className="text-base text-gray-700">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
                
                {/* ৫. Natural Beauty & Heritage */}
                <div className="bg-gray-50 rounded-xl shadow-inner p-14 text-center mb-24 border-b-8 border-amber-500/50"> 
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl font-bold text-amber-600 mb-4" 
                    >
                        প্রাকৃতিক সৌন্দর্য ও ঐতিহ্য
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-gray-700 text-xl max-w-4xl mx-auto leading-loose" 
                    >
                        প্রকল্পের দুই পাশে রয়েছে ঐতিহাসিক ধলেশ্বরী ও ইছামতি নদী। এটি একটি **উন্নত জীবনধারা** এবং **ঐতিহ্যের** এক সুবর্ণ সমন্বয়।
                    </motion.p>
                </div>

                {/* ৬. CTA Section */}
                <div className="text-center mb-16">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl font-bold text-gray-800 mb-8"
                    >
                        আপনার স্বপ্নের প্লট বুক করুন আজই
                    </motion.h3>
                <Link to="/contact-us">
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(245, 158, 11, 0.6)" }} 
    whileTap={{ scale: 0.95 }}
    className="bg-[#172554] text-white font-extrabold py-5 px-16 rounded-lg shadow-xl transition-all duration-300 uppercase tracking-widest text-lg"
  >
    যোগাযোগ করুন
  </motion.button>
</Link>
                </div>
            </div>
        </motion.div>
    );
};

export default AlHamraProjectElegant;