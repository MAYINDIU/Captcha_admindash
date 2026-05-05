import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaChevronRight, FaExpand, FaTimes } from 'react-icons/fa';

const primaryRed = "#8B0000";

const RiverparkGalary = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [metaData, setMetaData] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchGallery = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`https://alhamarahomesbd.com/alhamra-backend/public/api/v1/galleries?per_page=20&page=${page}`);
            setImages(response.data.data);
            setMetaData(response.data.meta);
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Error fetching gallery:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery(currentPage);
    }, [currentPage]);

    return (
        <section className="w-full bg-white font-sans min-h-screen">
            
         {/* --- Deep Navy Header --- */}
        <div className="mt-24 bg-gradient-to-r from-[#172554] to-[#1E3A8A] pt-24 pb-6 px-6 lg:px-20 text-white shadow-xl flex flex-col items-center">


            {/* Main Title */}
            <h1 className="text-xl md:text-xl font-black tracking-tighter uppercase text-center leading-none">
                RIVER PARK <span className="text-white/90">GALLERY</span>
            </h1>

            {/* Bengali Content - Small & Elegant */}
            <div className="mt-4 flex flex-col items-center gap-2">
                <div className="w-12 h-[1px] bg-[#8B0000]"></div>
                <p className="text-[11px] md:text-[13px] font-light text-blue-100/80 tracking-wide text-center max-w-md leading-relaxed">
                    রিভার পার্ক মডেল টাউন — আধুনিক নাগরিক সুযোগ-সুবিধা সম্বলিত একটি পরিকল্পিত আবাসন প্রকল্প, যেখানে আপনার স্বপ্ন খুঁজে পাবে এক নতুন ঠিকানা।
                </p>
            
            </div>

    {/* Bottom Accent */}
    <div className="w-1 h-8 bg-gradient-to-b from-white/20 to-transparent mt-0 rounded-full"></div>
</div>

            {/* --- Grid Section --- */}
            <div className="max-w-7xl mx-auto p-4 md:p-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full py-40 text-center animate-pulse text-gray-300 font-bold tracking-widest">
                            SYNCHRONIZING ASSETS...
                        </div>
                    ) : (
                        images.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                className="group relative aspect-square bg-gray-50 cursor-pointer border border-gray-100 shadow-sm overflow-hidden"
                                onClick={() => setSelectedImage(item)}
                            >
                                {/* Sequential Drawing Border */}
                                <div className="absolute inset-0 z-30 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-0 h-[3px] bg-[#8B0000] transition-all duration-300 group-hover:w-full"></div>
                                    <div className="absolute top-0 right-0 w-[3px] h-0 bg-[#8B0000] transition-all duration-300 delay-100 group-hover:h-full"></div>
                                    <div className="absolute bottom-0 right-0 w-0 h-[3px] bg-[#8B0000] transition-all duration-300 delay-200 group-hover:w-full"></div>
                                    <div className="absolute bottom-0 left-0 w-[3px] h-0 bg-[#8B0000] transition-all duration-300 delay-300 group-hover:h-full"></div>
                                </div>

                                <img 
                                    src={item.image_url} 
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20">
                                    <FaExpand className="text-white text-2xl transform scale-50 group-hover:scale-100 transition-transform duration-500" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* --- Pagination --- */}
                {!loading && metaData && metaData.last_page > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-20">
                        {metaData.links.map((link, idx) => (
                            <button
                                key={idx}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() => {
                                    if (link.url) {
                                        const page = new URL(link.url).searchParams.get('page');
                                        setCurrentPage(Number(page));
                                    }
                                }}
                                disabled={!link.url}
                                className={`px-4 py-2 text-[10px] font-bold border uppercase tracking-tighter transition-all 
                                    ${link.active ? 'bg-[#8B0000] text-white border-[#8B0000]' : 'bg-white text-gray-400 hover:border-black hover:text-black border-gray-100'} 
                                    ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- Centerized Medium Modal --- */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        {/* Dark Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
                        />

                        {/* Modal Container: Medium Size (max-w-2xl) */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl shadow-2xl overflow-hidden border-b-8"
                            style={{ borderBottomColor: primaryRed }}
                        >
                            {/* Close Button Inside Modal */}
                            <button 
                                onClick={() => setSelectedImage(null)} 
                                className="absolute top-4 right-4 z-50 bg-white/80 p-2 text-slate-900 hover:bg-[#8B0000] hover:text-white transition-all shadow-lg rounded-full"
                            >
                                <FaTimes size={16} />
                            </button>

                            {/* Image Box */}
                            <div className="w-full bg-gray-100 flex items-center justify-center p-2">
                                <img 
                                    src={selectedImage.image_url} 
                                    alt={selectedImage.title} 
                                    className="w-full h-auto max-h-[60vh] object-contain shadow-sm"
                                />
                            </div>

                            {/* Footer Content */}
                            <div className="p-6 bg-white text-center">
                                <span className="text-[10px] font-black text-[#8B0000] tracking-[0.4em] uppercase block mb-2">
                                    Project Asset
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {selectedImage.title}
                                </h2>
                                <p className="text-gray-400 text-[10px] mt-4 uppercase tracking-widest">
                                    Alhamra Homes - Quality Living
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="w-full h-2" style={{ backgroundColor: primaryRed }} />
        </section>
    );
};

export default RiverparkGalary;