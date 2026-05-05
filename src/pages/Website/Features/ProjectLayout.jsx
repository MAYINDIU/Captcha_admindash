import React from 'react';

import { 

    FaMapPin,

    FaFilePdf,

    FaDownload // Added for the download button

} from 'react-icons/fa'; 

import { motion } from "framer-motion";



// --- LOCAL IMAGE IMPORTS ---

import layoutImage from '../Assets/Features/master_layout.jpg';

import layoutPdf from '../Assets/Features/MasterLayout.pdf';



const primaryNavy = "#172554"; // ডিপ নেভি ব্লু



const ProjectLayout = () => {

    return (

        <section className="bg-gray-50 font-sans">

            

            {/* ---------------------------------------------------------------------------------- */}

            {/* 1. Full-Width Banner Section (Top) - Custom Gradient BG and Title */}

            {/* ---------------------------------------------------------------------------------- */}

            <div className="relative w-full h-72 md:h-80 shadow-2xl">

                <div 

                    style={{ background: `linear-gradient(to right, ${primaryNavy}, #3B82F6)` }} 

                    className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center`} 

                >

                    <FaMapPin className="text-white text-5xl mb-4 drop-shadow-lg" /> 

                    <motion.h2

                        initial={{ opacity: 0, y: -20 }}

                        animate={{ opacity: 1, y: 0 }}

                        transition={{ duration: 0.8, delay: 0.2 }}

                        className="text-white text-4xl md:text-5xl font-extrabold tracking-wider drop-shadow-2xl" 

                    >

                        প্রকল্পের লেআউট ম্যাপ

                    </motion.h2>

                    <motion.p 

                        initial={{ opacity: 0, y: 20 }}

                        animate={{ opacity: 1, y: 0 }}

                        transition={{ duration: 0.8, delay: 0.4 }}

                        className="text-blue-100 text-lg mt-3 max-w-2xl"

                    >

                        মাস্টার প্ল্যানের একটি সংক্ষিপ্ত বিবরণ, যেখানে আবাসিক প্লট, বাণিজ্যিক এলাকা এবং মূল সুবিধাসমূহ প্রদর্শিত হয়েছে।

                    </motion.p>

                </div>

            </div>

            

            {/* Main Content Container (Pads the rest of the content) */}

            <div className="py-16 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                

                {/* --- Section Header --- */}

                <div className="text-center mb-4">

                    <h3 className="text-3xl md:text-4xl font-bold text-gray-800">

                        রিভার পার্ক মডেল টাউন লেআউট প্ল্যান

                    </h3>

                    <p className="text-gray-600 mt-3 max-w-3xl mx-auto">

                        উচ্চ-রেজোলিউশনের পিডিএফ খুলতে ম্যাপটিতে ক্লিক করুন, যা আপনাকে জুম করে আমাদের পরিকল্পিত কমিউনিটির প্রতিটি বিবরণ দেখার সুযোগ দেবে। অফলাইনে দেখার জন্য সরাসরি ডাউনলোডের লিঙ্কও উপলব্ধ।

                    </p>

                    <div className="mt-5 w-24 h-1 bg-red-600 mx-auto rounded-full"></div>

                </div>

                

                {/* ---------------------------------------------------------------------------------- */}

                {/* --- Single Layout Image linking to PDF --- */}

                {/* ---------------------------------------------------------------------------------- */}

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl border">

                    <a 

                        href={layoutPdf} 

                        target="_blank" 

                        rel="noopener noreferrer" 

                        className="relative group block w-full shadow-lg rounded-xl overflow-hidden border-4 border-gray-200 hover:border-red-500 transition-all duration-300"

                    >

                        <img

                            src={layoutImage}

                            alt="Project Layout Map"

                            className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"

                        />

                        

                        {/* Overlay with PDF Icon */}

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">

                            <div className="bg-red-600 text-white px-8 py-4 rounded-full font-bold text-xl opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 flex items-center gap-3 shadow-lg">

                                <FaFilePdf className="text-2xl" /> পিডিএফ লেআউট দেখুন

                            </div>

                        </div>

                    </a>

                </div>



                {/* --- Download Button --- */}

                <div className="mt-12 text-center">

                    <a

                        href={layoutPdf}

                        download="Al_Hamra_Project_Layout.pdf"

                        className="inline-flex items-center gap-3 px-10 py-4 bg-slate-800 text-white font-bold text-lg rounded-lg shadow-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"

                    >

                        <FaDownload />

                        লেআউট পিডিএফ ডাউনলোড করুন

                    </a>

                </div>

            </div>

        </section>

    );

};



export default ProjectLayout ;