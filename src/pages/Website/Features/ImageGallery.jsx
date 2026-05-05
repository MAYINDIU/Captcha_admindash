import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpand, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Asset Imports
import Image1 from '../Assets/Galary/1.jpg';
import Image2 from '../Assets/Galary/2.jpg';
import Image3 from '../Assets/Galary/9.jpg';
import Image4 from '../Assets/Galary/4.jpg';
import Image5 from '../Assets/Galary/5.jpg';
import Image6 from '../Assets/Galary/6.jpg';
import Image7 from '../Assets/Galary/7.jpg'; 
import Image8 from '../Assets/Galary/8.jpg';
import riverpark from "../Assets/Icons/riverpark.jpg";

const galleryImages = [
    { id: 1, src: Image1, alt: 'Premium Residential Plot View' },
    { id: 2, src: Image2, alt: 'Project Site Development Work' },
    { id: 3, src: Image3, alt: 'Main Road Access to Project' },
    { id: 4, src: Image4, alt: 'Aerial View of Al Hamra Homes' },
    { id: 5, src: Image5, alt: 'Proposed Commercial Zone' },
    { id: 6, src: Image6, alt: 'Lake valley Agro Resort' },
    { id: 7, src: Image7, alt: 'Project Landscaping Design' },
    { id: 8, src: Image8, alt: 'Al-hamra Documents Delivery ' },
];

const ImageGallery = () => {
    const [lightboxOpen, setLightboxOpen] = useState(-1);

    // --- Logic Functions ---
    const openLightbox = (index) => {
        setLightboxOpen(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = useCallback(() => {
        setLightboxOpen(-1);
        document.body.style.overflow = 'auto';
    }, []);

    const nextImage = useCallback((e) => {
        if (e) e.stopPropagation();
        setLightboxOpen((prevIndex) => (prevIndex + 1) % galleryImages.length);
    }, []);

    const prevImage = useCallback((e) => {
        if (e) e.stopPropagation();
        setLightboxOpen((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
    }, []);

    // --- Keyboard Navigation (Esc, Left, Right) ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxOpen === -1) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

    return (
        <section className="py-12 bg-slate-50 font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* --- Project Logo Card --- */}
                <div className="flex items-center justify-center mb-10 w-full">
                    <Link to="/riverpark-galary">
                        <div className="group bg-white p-2 rounded-xl shadow-sm border-2 border-gray-100 hover:border-red-700 hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center h-32 w-48 cursor-pointer overflow-hidden">
                            <img 
                                src={riverpark} 
                                alt="Riverpark Logo" 
                                className="h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                            />
                        </div>
                    </Link>
                </div>
                
                {/* --- Header --- */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-red-600 mb-3">
                            Project Visuals
                        </h2>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                            আমাদের স্বপ্নের গ্যালারি
                        </h1>
                        <div className="w-24 h-1.5 bg-red-600 mx-auto rounded-full mb-6"></div>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            দেখুন আমাদের প্রকল্পের বাস্তব চিত্র, ডেভেলপমেন্টের অগ্রগতি এবং ভবিষ্যতের নকশা। প্রতিটি ছবি আমাদের প্রতিশ্রুতির প্রতিফলন।
                        </p>
                    </motion.div>
                </div>

                {/* --- Image Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {galleryImages.map((image, index) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative rounded-2xl shadow-md cursor-pointer bg-white transition-all duration-300 hover:shadow-xl hover:ring-4 hover:ring-red-500 hover:ring-offset-4 hover:ring-offset-slate-50"
                            onClick={() => openLightbox(index)}
                        >
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover transform transition-transform duration-700 ease-in-out group-hover:scale-110"
                                />
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 rounded-2xl">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        Al Hamra Homes
                                    </p>
                                    <h3 className="text-white text-base font-bold leading-tight">
                                        {image.alt}
                                    </h3>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300 delay-100">
                                    <FaExpand size={14} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- Enhanced Lightbox Modal --- */}
                <AnimatePresence>
                    {lightboxOpen !== -1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                            onClick={closeLightbox}
                        >
                            {/* --- CLOSE BUTTON --- */}
                            <button
                                className="absolute top-6 right-6 z-[10001] bg-white/10 hover:bg-red-600 text-white p-4 rounded-full transition-all duration-300 group shadow-2xl border border-white/10"
                                onClick={closeLightbox}
                                aria-label="Close"
                            >
                                <FaTimes size={24} className="group-hover:rotate-90 transition-transform" />
                            </button>

                            {/* Navigation Buttons */}
                            <button
                                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all p-4 z-[10001] hidden sm:block hover:scale-125"
                                onClick={prevImage}
                            >
                                <FaArrowLeft size={40} />
                            </button>

                            <button
                                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all p-4 z-[10001] hidden sm:block hover:scale-125"
                                onClick={nextImage}
                            >
                                <FaArrowRight size={40} />
                            </button>

                            {/* Main Image Content */}
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative flex flex-col items-center justify-center max-w-6xl w-full h-full pointer-events-none"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={galleryImages[lightboxOpen].src}
                                    alt={galleryImages[lightboxOpen].alt}
                                    className="max-h-[75vh] md:max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto"
                                />
                                
                                <div className="mt-8 text-center pointer-events-auto">
                                    <h3 className="text-white text-xl md:text-3xl font-black tracking-tight mb-2">
                                        {galleryImages[lightboxOpen].alt}
                                    </h3>
                                    <div className="flex items-center justify-center gap-4">
                                        <span className="h-px w-8 bg-red-600"></span>
                                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                                            {lightboxOpen + 1} / {galleryImages.length} — Al Hamra Homes
                                        </p>
                                        <span className="h-px w-8 bg-red-600"></span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default ImageGallery;