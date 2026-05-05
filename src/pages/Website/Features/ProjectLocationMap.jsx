import React from 'react';
import { FaMapPin, FaDownload } from 'react-icons/fa';
import { motion } from "framer-motion";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

// 1. Import the image file directly
import mapImage from '../Assets/Features/location_map.png';

const ProjectLocationMap = () => {
    return (
        <section className="bg-gray-50 font-sans">
            {/* Banner Section */}
            <div className="relative w-full mt-12 h-72 md:h-80 shadow-2xl">
                <div style={{ background: "linear-gradient(to right, #172554, #3B82F6)" }} className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <FaMapPin className="text-white text-5xl mb-4" />
                    <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-white text-4xl md:text-5xl font-extrabold tracking-wider">
                        প্রকল্পের লোকেশন ম্যাপ
                    </motion.h2>
                </div>
            </div>

            <div className="py-16 max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-gray-800">রিভার পার্ক মডেল টাউন লোকেশন ম্যাপ</h3>
                    <p className="text-gray-600 mt-3">ছবিতে ক্লিক করে জুম করুন অথবা ডাউনলোড বাটনে ক্লিক করুন।</p>
                </div>

                {/* --- Zoomable Image --- */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl border flex justify-center">
                    <Zoom>
                        <img
                            src={mapImage} // 2. Use the imported variable here
                            alt="Project Layout Map"
                            className="w-full max-w-full h-auto rounded-xl shadow-lg border-4 border-gray-200"
                        />
                    </Zoom>
                </div>

                {/* --- Download Button --- */}
                <div className="mt-12 text-center">
                    <a
                        href={mapImage} // 3. Use the same variable here
                        download="River_Park_Layout.png"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-slate-800 text-white font-bold text-lg rounded-lg shadow-xl hover:bg-red-700 transition-all duration-300"
                    >
                        <FaDownload />
                        লোকেশন ম্যাপ ডাউনলোড করুন
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ProjectLocationMap;