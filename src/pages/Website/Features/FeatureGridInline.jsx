import React from 'react';
import { FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaDollarSign } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Updated feature data with icons and descriptions
const alHamraFeatures = [
  {
    icon: FaBuilding,
    title: "আল-হামরা হোমস",
    description: "আবাসন শিল্পে শতভাগ আস্থা ও নির্ভরযোগ্যতার প্রতীক।"
  },
  {
    icon: FaMapMarkerAlt,
    title: "কেরানীগঞ্জ ও নবাবগঞ্জ",
    description: "ঢাকার প্রাণকেন্দ্র থেকে ১৫ কিলোমিটার এবং ভবিষ্যৎ যোগাযোগের কেন্দ্রবিন্দু।"
  },
  {
    icon: FaRulerCombined,
    title: "মেগা টাউন",
    description: "আন্তর্জাতিক মানের সুবিধা সহ দেশের অন্যতম বৃহৎ পরিকল্পিত নগরী।"
  },
  {
    icon: FaDollarSign,
    title: "সাশ্রয়ী ও লাভজনক বিনিয়োগ",
    description: "আপনার ভবিষ্যতের জন্য একটি সুরক্ষিত এবং মূল্যবান সম্পদ।"
  }
];

const AlHamraFeatures = () => {
  return (
    <section className="py-4 sm:py-4 bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            কেন আল হামরা হোমস আপনার সেরা পছন্দ?
          </h2>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
            আমরা শুধু আবাসন তৈরি করি না, আমরা আপনার স্বপ্নের ঠিকানা গড়ি। আমাদের প্রতিশ্রুতি, স্বচ্ছতা এবং দীর্ঘমেয়াদী পরিকল্পনায় আস্থা রাখুন।
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {alHamraFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-t-4 border-transparent hover:border-red-600"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-red-100 text-red-600 rounded-full mb-5 transition-all duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlHamraFeatures;