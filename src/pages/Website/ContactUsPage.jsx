import React from 'react';
import { 
    FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock, 
    FaShieldAlt, FaHeadset, FaChartLine 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- CONFIGURATION ---
const primaryRed = "#8B0000";

const ContactUs = () => {
    
    // Feature Card Component
    const FeatureCard = ({ icon: Icon, title, desc }) => (
        <motion.div 
            whileHover={{ y: -8 }}
            className="bg-white rounded-xl shadow-lg border-t-4 overflow-hidden group transition-all duration-300"
            style={{ borderColor: primaryRed }}
        >
            <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: `${primaryRed}08` }}>
                <div className="p-2 rounded-lg bg-white text-red-900 shadow-sm"><Icon size={20} /></div>
                <h3 className="font-extrabold text-red-900 uppercase tracking-wide text-sm">{title}</h3>
            </div>
            <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    );

    return (
        <section className="py-20 bg-gray-50 font-sans">
            <div className="max-w-6xl mx-auto px-6">
                
                {/* --- HEADER --- */}
                <div className="text-center mt-16 mb-16">
                    <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        আমাদের সাথে যোগাযোগ রাখুন
                    </motion.h2>
                    <p className="text-gray-500">আপনার যেকোনো প্রশ্ন বা পরামর্শের জন্য আমরা প্রস্তুত।</p>
                </div>

                {/* --- FEATURES GRID --- */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    <FeatureCard icon={FaShieldAlt} title="বিশ্বস্ততা" desc="আলহামরা হোমস-এ স্বচ্ছতা এবং মানের নিশ্চয়তা আমাদের মূল লক্ষ্য।" />
                    <FeatureCard icon={FaHeadset} title="সাপোর্ট" desc="আপনার স্বপ্ন পূরণের প্রতিটি ধাপে দক্ষ টিম ২৪/৭ পাশে রয়েছে।" />
                    <FeatureCard icon={FaChartLine} title="আধুনিকায়ন" desc="আধুনিক স্থাপত্যশৈলী এবং উন্নত প্রযুক্তির সমন্বয় আমাদের বৈশিষ্ট্য।" />
                </div>

                {/* --- MAIN SECTION --- */}
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Info Column */}
                    <div className="lg:col-span-4 space-y-6">
                        {[
                            { icon: FaMapMarkerAlt, label: "ঠিকানা", text: "33, Al-Amin Islam Bhaban, Floor-12B, Noyapolton, Dhaka" },
                    
                            { icon: FaEnvelope, label: "ইমেইল", text: "alhamrahomesbd@gmail.com", href: "mailto:alhamrahomesbd@gmail.com" },
                            { icon: FaClock, label: "সময়সূচী", text: "১০:০০ AM - ৭:০০ PM (শনি-বৃহস্পতি)" }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className="text-red-900 mt-1"><item.icon size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">{item.label}</h4>
                                    {item.href ? <a href={item.href} className="text-gray-600 text-sm">{item.text}</a> : <p className="text-gray-600 text-sm">{item.text}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Map & Form */}
                    <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-full">
                            <iframe 
                             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.2398237835396!2d90.27834627441172!3d23.667380078727!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755960aac896217%3A0x9f20332f508ceab1!2sRiver%20Park%20Model%20Town!5e0!3m2!1sen!2sbd!4v1772725402263!5m2!1sen!2sbd" 
                                width="100%" height="100%" className="rounded-lg min-h-[300px]" style={{ border: 0 }} allowFullScreen="" loading="lazy" title="Location"
                            ></iframe>
                        </div>

                    
                        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4" style={{ borderColor: primaryRed }}>
                            <h3 className="font-extrabold text-red-900 mb-6 uppercase text-sm">বার্তা পাঠান</h3>
                            <form className="space-y-4">
                                <input type="text" placeholder="আপনার নাম" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-900 outline-none" />
                                <input type="email" placeholder="ইমেইল" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-900 outline-none" />
                                <textarea placeholder="আপনার বার্তাটি লিখুন" rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-900 outline-none"></textarea>
                                <button type="submit" className="w-full py-3 bg-red-900 text-white font-bold rounded-lg hover:bg-black transition">বার্তা পাঠান</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUs;