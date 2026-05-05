import React from "react";
import { motion } from "framer-motion";
import { 
    FaMapMarkerAlt, 
    FaRoad, 
    FaIndustry, 
    FaTree, 
    FaHandshake, 
    FaLeaf, 
    FaUsers, 
    FaLightbulb, 
    FaRulerCombined 
} from "react-icons/fa";

// --- UPDATED COLORS ---
const primaryRed = "#8B0000"; // Deep Red
const accentGold = "#FFD700"; // Gold / Yellow
const textLight = "#FEECC5"; // Light Text for Dark BG

// ১. প্রকল্পের বৈশিষ্ট্য ডেটা (Feature Data)
const featureData = [
    { 
        icon: FaIndustry, 
        title: "অর্থনৈতিক কেন্দ্রবিন্দু", 
        description: "বাংলাদেশের সবচেয়ে বড় শিল্পনগরী সংলগ্ন নবাবগঞ্জ (ঢাকা ১নং আসন)-এ অবস্থিত।" 
    },
    { 
        icon: FaTree, 
        title: "নৈসর্গিক ডুপ্লেক্স জোন", 
        description: "প্রাকৃতিক পরিবেশে থাকবে ডুপ্লেক্স জোন।" 
    },
    { 
        icon: FaRoad, 
        title: "প্রশস্ত প্রধান সড়ক", 
        description: "প্রধান সড়কের সাথে প্রায় ২ কি. মি. ফ্রন্ট সাইড রয়েছে। এই সড়কটি ইতিমধ্যে ৪ লেনের জন্য প্রস্তাব গৃহীত হয়েছে।" 
    },
    { 
        icon: FaMapMarkerAlt, 
        title: "ঢাকা জিরো পয়েন্টের নিকটবর্তী", 
        description: "প্রকল্পটি ঢাকা জিরো পয়েন্ট থেকে মাত্র ১৫ কি.মি. দূরে অবস্থিত; প্রধান সড়ক দিয়ে মাত্র ৩০ মিনিটে গুলিস্তান আসা সম্ভব।" 
    },
    { 
        icon: FaRulerCombined, 
        title: "সাশ্রয়ী বিনিয়োগ", 
        description: "অন্যান্য সকল সুবিধার সাপেক্ষে প্লটের ক্রয়মূল্য তূলনামূলক সাশ্রয়ী, যা একটি লাভজনক বিনিয়োগের সুযোগ।" 
    },
    { 
        icon: FaUsers, 
        title: "বৃহৎ পরিসরে বাস্তবায়ন", 
        description: "প্রকল্প বাস্তবায়নের জন্য রয়েছে বিপুল পরিমাণ জায়গার সমারোহ।" 
    },
    { 
        icon: FaRoad, 
        title: "উন্নত সংযোগ সড়ক", 
        description: "মাওয়া রোড এবং মোহাম্মদপুর, আদাবর, বসিলা, সিংগাইর-হেমায়েতপুর হয়ে ঢাকা উত্তর সিটিতে যাওয়ার প্রশস্ত সংযোগ সড়ক রয়েছে।" 
    },
    { 
        icon: FaLightbulb, 
        title: "অবিলম্বে পরিষেবা", 
        description: "প্রকল্পের শুরুতেই রয়েছে রাস্তা, বিদ্যুৎ ও পানির সুব্যবস্থা।" 
    }
];

// ২. মূল মূল্যবোধ ডেটা (Values Data)
const valueData = [
    { icon: FaHandshake, title: "বিশ্বাস (Trust)", description: "নির্ভরযোগ্যতার মাধ্যমে দৃঢ় সম্পর্ক স্থাপন এবং শতভাগ স্বচ্ছতা নিশ্চিত করা।" },
    { icon: FaLeaf, title: "স্থায়িত্ব (Sustainability)", description: "পরিবেশবান্ধব অনুশীলন এবং দীর্ঘমেয়াদী উন্নয়নে প্রতিশ্রুতিবদ্ধ।" },
    { icon: FaUsers, title: "ঐক্য (Community)", description: "আমরা যাদের সেবা করি, তাদের কল্যাণ ও জীবনযাত্রার মান উন্নয়নে বিনিয়োগ করা।" },
    { icon: FaLightbulb, title: "উদ্ভাবন (Innovation)", description: "নতুন চ্যালেঞ্জ মোকাবেলায় আধুনিক প্রযুক্তি ও ধারণা নিয়ে ক্রমাগত বিকশিত হওয়া।" },
];

// কম্পোনেন্ট
const ProjectFeaturesAndValues = () => {

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    return (
        <section className="py-20 md:py-28 bg-gray-50"> 
            <div className="max-w-7xl mx-auto px-6">

        
        <div className="text-center mb-16 mt-16">
            <h2 
                className="text-xl font-semibold uppercase tracking-widest mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-300"
                style={{ color: primaryRed }}  // স্টাইল প্রপার্টি দিয়ে গ্রেডিয়েন্ট করা হয় না, তাই এটি বাদ দেওয়া হয়েছে
            >
                আল হামরা হোমস লি: এর বিশেষত্ব
            </h2>
            <h1 
                className="text-4xl md:text-5xl font-extrabold mb-4"
                style={{ color: primaryRed }}
            >
                প্রকল্পের মূল বৈশিষ্ট্য
            </h1>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto pt-4 border-t-2" style={{ borderTopColor: accentGold }}>
                **আল হামরা হোমস  গ্রাহক সেবায় বদ্ধপরিকর।** আবাসন শিল্পে  আমরা আস্থা ও গুণমানের নিশ্চয়তা দেই।
            </p>
        </div>

                {/* --- 2. Key Project Features Grid (Red Gradient Cards) --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-28" 
                >
                    {featureData.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            // Deep Red Gradient Card Design
                            className="text-white rounded-xl p-6 shadow-2xl flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 border-b-4 transform" 
                            style={{ 
                                background: `linear-gradient(135deg, ${primaryRed}, #A52A2A)`, // Red to slightly darker Red
                                borderColor: accentGold, // Gold bottom border
                            }}
                        >
                            <div className="p-3 rounded-full mb-4 shadow-inner" style={{ backgroundColor: textLight + '20' }}>
                                <feature.icon size={30} style={{ color: accentGold }} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 leading-snug">{feature.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: textLight }}>{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>


                {/* --- 3. Values We Live By Section --- */}
                <div className="text-center mb-16">
                    <h2 className="text-xl font-semibold uppercase tracking-widest text-emerald-600 mb-3" style={{ color: primaryRed }}>
                        আমাদের ভিত্তি
                    </h2>
                    <h1 
                        className="text-4xl md:text-5xl font-extrabold mb-12"
                        style={{ color: primaryRed }}
                    >
                        কোম্পানির মূল্যবোধ (Core Values)
                    </h1>
                </div>

                {/* --- 4. Values Grid (White Cards with Red/Gold Accents) --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10" 
                >
                    {valueData.map((value, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            // White Card with Deep Red Top Border and Gold Accents
                            className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center text-center border-t-8 hover:shadow-2xl hover:border-b-8 transition-all duration-300 transform hover:scale-[1.02]"
                            style={{ borderColor: primaryRed }}
                        >
                            <div className="p-5 rounded-full mb-6" style={{ backgroundColor: primaryRed + '10' }}> 
                                <value.icon size={35} style={{ color: accentGold }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3" style={{ color: primaryRed }}>{value.title}</h3>
                            <p className="text-base text-gray-700">{value.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
                
            </div>
        </section>
    );
};

export default ProjectFeaturesAndValues;