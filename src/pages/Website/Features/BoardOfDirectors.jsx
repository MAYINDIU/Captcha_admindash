import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronRight, FaHome } from 'react-icons/fa';

// Actual imports
import liton from '../Assets/Icons/liton.png';
import zaman from '../Assets/Icons/zaman.png';

const primaryRed = "#8B0000";

const BoardOfDirectors = () => {
    const directors = [
        { name: "Md.Nazmul Huda Liton", role: "Founder & Chairman", image: liton },
        { name: "Md.Shamsuzzaman Sarker", role: "Founder & CEO", image: zaman }
    ];

    return (
        <section className="w-full bg-white p-4 md:p-8 font-sans">
            {/* Outer Container Border */}
            <div className="relative w-full border border-gray-100 min-h-[80vh] flex flex-col items-center">
                
                {/* --- Top Breadcrumb Header --- */}
                <div className="w-full mt-32 py-0 flex flex-col items-center border-b border-gray-100 bg-white">
                    <nav className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-[0.4em] mb-3">
                        <div className="flex items-center gap-1 hover:text-black cursor-pointer transition-all">
                            <FaHome />
                            <span>Home</span>
                        </div>
                        <FaChevronRight className="text-[8px] opacity-30" />
                        <span style={{ color: primaryRed }} className="font-bold">Board of Directors</span>
                    </nav>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">
                        Board of <span style={{ color: primaryRed }}>Directors</span>
                    </h1>
                </div>

                {/* --- Main Content Grid --- */}
                <div className="relative z-10 flex flex-wrap justify-center gap-12 px-6 py-4 flex-grow">
                    {directors?.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative w-80 bg-white p-6 flex flex-col items-center cursor-pointer border border-gray-50 hover:border-transparent transition-all duration-300"
                        >
                            {/* Individual Card Animated Border */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <rect
                                    x="0" y="0" width="100%" height="100%"
                                    fill="none"
                                    stroke={primaryRed}
                                    strokeWidth="2"
                                    strokeDasharray="800"
                                    strokeDashoffset="800"
                                    className="transition-all duration-700 ease-in-out group-hover:stroke-dashoffset-0"
                                />
                            </svg>

                            {/* Square Image with Corner Accents */}
                            <div className="relative w-48 h-48 mb-6">
                                {/* Corners */}
                                <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ borderColor: primaryRed }}></div>
                                <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ borderColor: primaryRed }}></div>
                                
                                <div className="w-full h-full overflow-hidden border border-gray-100 shadow-sm">
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className="w-full rounded-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1 group-hover:text-[#8B0000] transition-colors uppercase">
                                    {member.name}
                                </h3>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400">
                                    {member.role}
                                </p>
                                
                                {/* Hover Reveal Line */}
                                <div className="h-[2px] mt-4 mx-auto w-0 group-hover:w-full transition-all duration-500" style={{ backgroundColor: primaryRed }} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Section Perimeter Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: primaryRed }} />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: primaryRed }} />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: primaryRed }} />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: primaryRed }} />

           
            </div>
        </section>
    );
};

export default BoardOfDirectors;