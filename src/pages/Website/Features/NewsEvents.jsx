import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegCalendarAlt, FaTimes, FaHome, FaChevronRight } from 'react-icons/fa';

const primaryRed = "#8B0000";

const NewsEvents = () => {
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // Fetching from your provided API
                const response = await axios.get('https://alhamarahomesbd.com/alhamra-backend/public/api/v1/blogs');
                setBlogs(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching news:", error);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <section className="w-full bg-white font-sans overflow-hidden">
            
            {/* --- Top Gradient Breadcrumb Header --- */}
            <div className="bg-gradient-to-r from-[#172554] to-[#1E3A8A] pt-24 pb-12 px-4 sm:px-6 lg:px-20 text-white shadow-xl flex flex-col items-center border-b-4" style={{ borderBottomColor: primaryRed }}>
             
                <h1 className="mt-24 text-2xl md:text-2xl font-black tracking-tighter uppercase text-center">
                    NEWS <span className="text-white/90">& EVENTS</span>
                </h1>
                <div className="w-16 h-1 bg-white mt-4 rounded-full opacity-50"></div>
            </div>

            {/* --- Main Content Container (Framed) --- */}
            <div className="p-4 md:p-8">
                <div className="relative w-full border border-gray-100 min-h-screen flex flex-col items-center bg-white">
                    
                    {/* --- News Grid --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 p-10 w-full max-w-full">
                        {loading ? (
                            <div className="col-span-full text-center py-20 text-gray-300 animate-pulse tracking-[0.3em] font-bold">
                                SYNCHRONIZING DATA...
                            </div>
                        ) : (
                            blogs.map((blog) => (
                                <motion.div 
                                    key={blog.id}
                                    whileHover={{ y: -8 }}
                                    className="group cursor-pointer bg-white border border-gray-100 p-5 transition-all hover:shadow-2xl relative overflow-hidden"
                                    onClick={() => setSelectedBlog(blog)}
                                >
                                    {/* Moving Perimeter Border */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                                        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke={primaryRed} strokeWidth="3" strokeDasharray="800" strokeDashoffset="800" className="transition-all duration-700 ease-in-out group-hover:stroke-dashoffset-0" />
                                    </svg>

                                    {/* Square Image Box */}
                                    <div className="w-full h-52 overflow-hidden bg-gray-50 mb-5 relative">
                                        <img 
                                            src={blog.image_url} 
                                            alt={blog.title} 
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 px-3 py-1 text-[9px] font-black text-[#172554] tracking-widest uppercase">
                                            News
                                        </div>
                                    </div>

                                    {/* Date & Title */}
                                    <div className="flex items-center gap-2 text-[#8B0000] text-[10px] font-bold uppercase tracking-widest mb-3">
                                        <FaRegCalendarAlt />
                                        {new Date(blog.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 leading-tight uppercase group-hover:text-[#8B0000] transition-colors mb-3">
                                        {blog.title}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-6">
                                        {blog.description}
                                    </p>

                                    <div className="inline-flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-tighter border-b-2 border-transparent group-hover:border-[#8B0000] transition-all pb-1">
                                        Discover More <FaChevronRight className="text-[8px] text-[#8B0000]" />
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Corner Accents (Matching Board Section) */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: primaryRed }} />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: primaryRed }} />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: primaryRed }} />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: primaryRed }} />
                </div>
            </div>

            {/* --- Modal Pop-up --- */}
            <AnimatePresence>
                {selectedBlog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedBlog(null)}
                            className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white w-full max-w-4xl max-h-[85vh] overflow-y-auto border-l-[12px] shadow-2xl rounded-sm"
                            style={{ borderLeftColor: primaryRed }}
                        >
                            <button onClick={() => setSelectedBlog(null)} className="absolute top-6 right-6 z-20 bg-white text-slate-900 p-2 hover:bg-[#8B0000] hover:text-white transition-all shadow-xl">
                                <FaTimes size={18} />
                            </button>

                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
                                    <img src={selectedBlog.image_url} alt={selectedBlog.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
                                    <span className="text-[#8B0000] text-[10px] font-black tracking-[0.3em] uppercase mb-4 block">
                                        Official Update • {new Date(selectedBlog.created_at).getFullYear()}
                                    </span>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase mb-6 leading-tight">
                                        {selectedBlog.title}
                                    </h2>
                                    <div className="w-12 h-1 bg-[#8B0000] mb-8" />
                                    <p className="text-gray-600 leading-relaxed text-sm mb-8">
                                        {selectedBlog.description}
                                    </p>
                                    <button onClick={() => setSelectedBlog(null)} className="w-fit px-8 py-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#8B0000] transition-colors">
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default NewsEvents;