import React from 'react';
import { motion } from "framer-motion";
import { 
    FaCheckCircle, 
    FaMapMarkedAlt, 
    FaDollarSign, 
    FaFileAlt, 
    FaRegLightbulb
} from 'react-icons/fa';

const primaryNavy = "#172554";
import profilePdf from '../Assets/Features/profile.pdf';


// -----------------------------
// AMENITIES DATA (Copy the full array here)
// -----------------------------
const AMENITIES_DATA = [
    {
        bn: "প্রকল্পের সম্পূর্ণ এলাকা ক্লোজ সার্কিট ক্যামেরার আওতাভুক্ত করা হবে।",
        en: "The entire project area will be covered by Closed-Circuit Television (CCTV) cameras.",
    },
    {
        bn: "প্রকল্পের অভ্যন্তরে রয়েছে ৩০ ফুট থেকে ১০০ ফুট পর্যন্ত প্রশস্ত রাস্তা, নৌ-পরিবহণ ব্যবস্থা ও টানেল।",
        en: "The project features wide roads ranging from 30 feet to 100 feet, waterways, and tunnels.",
    },
    {
        bn: "প্রকল্পের ভিতরে থাকবে নিজস্ব পরিবহনের সুব্যবস্থা এবং প্রয়োজনীয় সংখ্যক হ্যালিপ্যাড ও হেলিকপ্টার রেন্টাল স্টেশন।",
        en: "There will be internal transportation facilities, along with necessary helipads and a helicopter rental station.",
    },
    {
        bn: "বৃক্ষবেষ্টিত সবুজে ঘেরা প্রকল্পটির মধ্যে রয়েছে পার্ক ও খেলাধুলার জন্য  একাধিক সুপ্রশস্ত মাঠ।",
        en: "The project, surrounded by greenery, includes parks and multiple spacious fields, for sports.",
    },
    {
        bn: "স্কুল, কলেজ, মাদ্রাসা, মেডিকেল কলেজ, নগর উন্নয়ন ও গবেষণা ইনস্টিটিউট, বিশ্ববিদ্যালয় ও আইসিটি পার্কসহ বিভিন্ন শিক্ষাপ্রতিষ্ঠানের জন্য রয়েছে নির্ধারিত স্থান।",
        en: "Designated locations are reserved for various educational institutions, including schools, colleges, madrasas, medical colleges, urban development & research institutes, universities, and an ICT park.",
    },
    {
        bn: "আন্তর্জাতিক মানের হাসপাতাল, ক্লিনিক, শপিংমল, কমিউনিটি সেন্টার, বৃদ্ধাশ্রম, শরীর চর্চা কেন্দ্র, ক্লাব, সুইমিংপুল, ঝর্ণা, পাবলিক লাইব্রেরি, লেডিস ক্লাব এবং কনভেনশন সেন্টারের জন্য রয়েছে নির্ধারিত স্থান।",
        en: "Designated areas for international standard hospitals, clinics, shopping malls, community centers, old age homes, gyms, clubs, swimming pools, fountains, public libraries, ladies' clubs, and convention centers.",
    },
    {
        bn: "প্রকল্পে প্রয়োজনীয় সংখ্যক মসজিদসহ ঈদগাহ মাঠ, কবরস্থান এর সুব্যবস্থা থাকবে।",
        en: "The project will have necessary mosques, Eidgah grounds, and graveyards ",
    },
    {
        bn: "বিশুদ্ধ ও পর্যাপ্ত পানি সরবরাহের জন্য থাকবে নিজস্ব ব্যবস্থাপনায় পাম্প হাউজ এবং বৃষ্টির পানি সংগ্রহের সুব্যবস্থা।",
        en: "There will be a dedicated pump house and rainwater harvesting system for the supply of pure and adequate water.",
    },
    {
        bn: "বিদ্যুৎ সরবরাহ নিশ্চিত করণে থাকবে নিজস্ব সাবস্টেশন ও সৌর বিদ্যুৎ সুবিধা।",
        en: "Ensured electricity supply with a dedicated substation and solar power facilities.",
    },
    {
        bn: "সার্বক্ষণিক নিরাপত্তা ব্যবস্থা নিয়ন্ত্রণের জন্য থাকবে নিজস্ব দক্ষ ও চৌকস নিরাপত্তাবাহিনী এবং ফায়ার সার্ভিস স্টেশন।",
        en: "24/7 security managed by a dedicated, skilled security force and a fire service station.",
    },
    {
        bn: "প্রকল্পে থাকবে প্রয়োজনীয় ও পর্যাপ্ত গাড়ি পার্কিংয়ের সুব্যবস্থা, চিড়িয়াখানা, যাদুঘর ও ক্ষুদ্রশিল্প পার্ক।",
        en: "Adequate parking facilities, a zoo, a museum, and a small-scale industrial park will be established.",
    },
    {
        bn: "আবাসিক এলাকার পাশাপাশি থাকছে- বাণিজ্যিক এলাকা, বাজার, ফাইভস্টার হোটেল, কশাইখানা, কারিগরি বিশ্ববিদ্যালয়ের বিষয়ভিত্তিক শিল্প কারখানা, হস্তশিল্প অঞ্চল, কৃষকের বাজার, পেট্রোলপাম্প, সিএনজি ও বৈদ্যুতিক চার্জিং স্টেশন, আবর্জনা প্রক্রিয়াজাতকরণ কারখানা, আবর্জনা সংরক্ষণ হাউস, রিভারভিউ রোড ড্রাইভ জোন এবং ডে-কেয়ার সেন্টার।",
        en: "Alongside residential areas, the project includes commercial areas, markets, a five-star hotel, slaughterhouse, subject-specific industrial factories affiliated with technical universities, a handicraft zone, farmer's market, petrol/CNG/electric charging stations, waste processing plant, waste storage house, a river view road drive zone, and a day-care center.",
    },
];

// -----------------------------
// MOTION VARIANTS
// -----------------------------
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
};

// -----------------------------
// Amenity Item subcomponent
// -----------------------------
const AmenityItem = ({ index, bnText, enText }) => (
    <motion.div 
        variants={itemVariants}
        className="flex items-start p-6 bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-1"
    >
        <FaCheckCircle className="mt-1 mr-4 text-3xl text-red-600" />
        <div>
            <p className="text-gray-900 font-semibold text-lg mb-1">{enText}</p>
            <p className="text-sm text-gray-600 italic">{`${index + 1}. ${bnText}`}</p>
        </div>
    </motion.div>
);

// -----------------------------
// Main Component
// -----------------------------
const ProjectAmenities = () => {
    return (
        <section className="bg-gray-50   font-sans">
       

            <div className="max-w-7xl mx-auto px-6 mt-32 py-20">

                {/* INTRO */}
                <div className="text-center mb-16 mt-24">
                 
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 inline-block border-b-4 border-red-500 pb-2 px-3">
                     লিভার পার্ক মডেল টাউন প্রজেক্ট এর আধুনিক সুযোগ-সুবিধা সমূহ
                    </h3>
                </div>

                {/* AMENITIES GRID */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {AMENITIES_DATA.map((amenity, index) => (
                        <AmenityItem key={index} index={index} bnText={amenity.bn} enText={amenity.en} />
                    ))}
                </motion.div>

                {/* DOCUMENTS (1 row, 3 columns) */}
                <div className="mt-20 text-center">
                    <h3 className="text-3xl font-bold text-gray-800 mb-8 border-b-4 border-gray-200 inline-block pb-2">
                        Project Documents (প্রয়োজনীয় নথি)
                    </h3>

                   <div className="grid lg:grid-cols-3 sm:grid-cols-3 gap-6 mt-6"> 
                        <a className="flex flex-col items-center bg-white rounded-xl p-8 shadow-lg border-b-4 border-red-600 hover:bg-red-50 hover:shadow-2xl transition duration-300">
                            <FaMapMarkedAlt className="text-5xl text-red-600 mb-3" />
                            <h4 className="text-xl font-bold text-gray-800">প্রকল্পের ম্যাপ</h4>
                            <p className="text-gray-500 text-sm">Project Map</p>
                        </a>

                        <a className="flex flex-col items-center bg-white rounded-xl p-8 shadow-lg border-b-4 border-red-600 hover:bg-red-50 hover:shadow-2xl transition duration-300">
                            <FaDollarSign className="text-5xl text-red-600 mb-3" />
                            <h4 className="text-xl font-bold text-gray-800">প্লটের দামের তালিকা</h4>
                            <p className="text-gray-500 text-sm">Plot Price List</p>
                        </a>

                      <a 
                            href={profilePdf}
                            target="_blank" 
                            rel="profile"
                            className="flex flex-col items-center bg-white rounded-xl p-8 shadow-lg border-b-4 border-red-600 hover:bg-red-50 hover:shadow-2xl transition duration-300 cursor-pointer"
                            >
                                <FaFileAlt className="text-5xl text-red-600 mb-3" />
                                <h4 className="text-xl font-bold text-gray-800">ব্রোশিওর / প্রোফাইল</h4>
                                <p className="text-gray-500 text-sm">Brochure / Profile</p>
                            </a>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ProjectAmenities;
