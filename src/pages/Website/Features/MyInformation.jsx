import React, { useState } from 'react';
import { motion } from "framer-motion";
import { 
    FaMobileAlt, 
    FaSearch, 
    FaMapMarkedAlt, 
    FaDollarSign, 
    FaFileAlt 
} from 'react-icons/fa';

// Define Professional Color Palette
const accentRed = "#DC2626"; // Red 600
const deepNavy = "#172554"; // Custom deep blue/navy

// =====================================================================
// 1. Data Definitions for Documents (Reusing previous data)
// =====================================================================

const DOCUMENT_LINKS = [
    {
        icon: FaMapMarkedAlt,
        title_bn: "প্রকল্পের ম্যাপ",
        title_en: "Project Map",
        link: "#map-link",
    },
    {
        icon: FaDollarSign,
        title_bn: "প্লটের দামের তালিকা",
        title_en: "Plot Price List",
        link: "#price-link",
    },
    {
        icon: FaFileAlt,
        title_bn: "ব্রোশিওর / প্রোফাইল",
        title_en: "Brochure / Profile",
        link: "#brochure-link",
    },
];

// =====================================================================
// 2. Main Component: MyInformation
// =====================================================================

const MyInformation = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [searchStatus, setSearchStatus] = useState(null); // 'loading', 'success', 'error'

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchStatus('loading');
        
        // --- Simulate API call logic here ---
        setTimeout(() => {
            if (mobileNumber.length === 11 && mobileNumber.startsWith('01')) {
                // Simulate success result after search
                setSearchStatus('success');
            } else {
                // Simulate error/not found
                setSearchStatus('error');
            }
        }, 1500);
        // ------------------------------------
    };

    return (
        <section className="bg-gray-100 font-sans py-20 md:py-28">
            <div className="max-w-4xl mx-auto px-4 mt-16 sm:px-6 lg:px-8">
                
                {/* Header and Introduction */}
                <div className="text-center mb-12">
                    <h2 
                        className="text-4xl md:text-5xl font-extrabold mb-2" 
                        style={{ color: deepNavy }}
                    >
                        আমার তথ্য (My Information)
                    </h2>
                    <p className="text-xl text-gray-600 font-medium">
                        আপনার মোবাইল নাম্বার দিয়ে প্লট ক্রয়ের বিস্তারিত তথ্য অনুসন্ধান করতে পারবেন।
                    </p>
                </div>

                {/* --- Search Form Block --- */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white p-8 md:p-12 rounded-xl shadow-2xl border-t-4"
                    style={{ borderColor: accentRed }}
                >
                    <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                        <FaMobileAlt className="mr-3 text-3xl" style={{ color: accentRed }} />
                        মোবাইল নাম্বার দিন
                    </h3>

                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="tel"
                            placeholder="যেমন: ০১৭********"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="flex-grow w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-300 text-lg"
                            required
                        />
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-center px-8 py-3 text-lg font-bold text-white rounded-lg shadow-lg transition duration-300 w-full sm:w-auto"
                            style={{ backgroundColor: deepNavy }}
                            disabled={searchStatus === 'loading'}
                        >
                            {searchStatus === 'loading' ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    অনুসন্ধান চলছে...
                                </span>
                            ) : (
                                <><FaSearch className="mr-2" /> খুঁজুন</>
                            )}
                        </motion.button>
                    </form>

                    {/* Search Results / Status */}
                    {searchStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-md"
                        >
                            <p className="font-bold">অনুসন্ধান সফল!</p>
                            <p>আপনার মোবাইল নম্বরটির বিপরীতে প্লট ক্রয়ের বিস্তারিত তথ্য নিচে দেওয়া হলো (বা একটি সুরক্ষিত লিংকে পাঠানো হবে)।</p>
                        </motion.div>
                    )}
                    {searchStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-md"
                        >
                            <p className="font-bold">তথ্য পাওয়া যায়নি।</p>
                            <p>দয়া করে সঠিক মোবাইল নম্বর দিয়ে আবার চেষ্টা করুন অথবা কাস্টমার কেয়ারে যোগাযোগ করুন।</p>
                        </motion.div>
                    )}
                    
                </motion.div>

                {/* --- Quick Links to Documents (Grid) --- */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 inline-block pb-1">
                        প্রয়োজনীয় নথিপত্র ডাউনলোড করুন
                    </h3>
                    
                    <div className="grid lg:grid-cols-3 sm:grid-cols-3 gap-6 mt-6"> 
                        {DOCUMENT_LINKS.map((doc, index) => (
                            <motion.a 
                                key={index}
                                href={doc.link} 
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="flex flex-col items-center justify-center p-6 bg-white border-b-4 border-red-600 rounded-lg shadow-xl hover:shadow-2xl hover:bg-red-50 transition transform duration-300 group"
                            >
                                <doc.icon className="text-4xl text-red-600 group-hover:text-red-700 mb-2 transition" />
                                <span className="text-lg font-bold text-gray-800">
                                    {doc.title_bn}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {doc.title_en}
                                </span>
                            </motion.a>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default MyInformation;