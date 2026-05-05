import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';

// প্রকল্পের নাগরিক সুবিধার তালিকা
const facilitiesList = [
  "প্রকল্পের সম্পূর্ণ এলাকা ক্লোজ সার্কিট ক্যামেরার আওতা ভুক্ত করা হবে।",
  "সার্বক্ষণিক নিরাপত্তা ব্যবস্থা নিয়ন্ত্রণের জন্য থাকবে নিজস্ব দক্ষ ও চৌকস নিরাপত্তাবাহিনী এবং ফায়ার সার্ভিস স্টেশন।",
  "প্রকল্পের অভ্যন্তরে রয়েছে ২৫ ফুট থেকে ১০০ ফুট পর্যন্ত প্রশস্ত রাস্তা।",
  "প্রকল্পের ভিতর থাকবে নিজস্ব পরিবহন ব্যবস্থা, প্রয়োজনীয় সংখ্যক হ্যালিপ্যাড ও হেলিকপ্টার রেন্টাল স্টেশন।",
  "বৃক্ষবেষ্টিত সবুজে ঘেরা প্রকল্পটির মধ্যে রয়েছে পার্ক ও খেলাধুলার জন্য একাধিক সুপ্রশস্ত মাঠ।",
  "আন্তর্জাতিক মানের হাসপাতাল, ক্লিনিক, শপিংমল, কমিউনিটি সেন্টার, বৃদ্ধাশ্রম, শরীর চর্চা কেন্দ্র, ক্লাব, সুমিং পুল, ঝর্ণা, পাবলিক লাইব্রেরি, লেডিস ক্লাব এবং কনভেনশন সেন্টারের জন্য রয়েছে নির্ধারিত স্থান।",
  "প্রকল্পে প্রয়োজনীয় সংখ্যক মসজিদ সহ ঈদগাহ মাঠ, কবরস্থান।",
  "বিশুদ্ধ ও পর্যাপ্ত পানি সরবরাহের জন্য থাকবে নিজস্ব ব্যবস্থাপনায় পাম্প হাউজ ।",
  "বিদ্যুৎ সরবরাহ নিশ্চিত করনে থাকবে নিজস্ব সাব স্টেশন এবং সৌর বিদ্যুৎ উৎপাদন ও সরবরাহের ব্যবস্থা।"
];

const AlHamraFacilities = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 sm:py-24 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            প্রকল্পের প্রিমিয়াম নাগরিক সুবিধাসমূহ
          </h2>
          <p className="text-lg text-gray-600 mt-3 max-w-3xl mx-auto">
            একটি আধুনিক ও স্বয়ংসম্পূর্ণ জীবনযাপনের জন্য প্রয়োজনীয় সকল সুবিধা নিয়ে গড়ে উঠছে আমাদের এই প্রকল্প।
          </p>
          <div className="mt-5 w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Facilities Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {facilitiesList.map((facility, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-start p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-xl hover:bg-white border-l-4 border-red-500 transition-all duration-300 transform hover:-translate-y-1"
            >
              <FaCheckCircle className="flex-shrink-0 mt-1 mr-4 text-2xl text-red-600" />
              <p className="text-base text-gray-700 leading-relaxed">
                {facility}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AlHamraFacilities;