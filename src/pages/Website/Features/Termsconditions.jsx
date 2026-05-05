import React from 'react';
import { motion } from "framer-motion";
import { 
    FaCheckCircle, 
    FaHandPointRight, 
    FaFileContract, 
    FaMoneyBillWave, 
    FaCalendarAlt,
    FaPercentage, 
    FaTimesCircle,
    FaTruckMoving,
    FaUserFriends,
    FaRubleSign,
    FaRegLightbulb 
} from 'react-icons/fa';

// Define the custom color for headers/accents
const primaryNavy = "#172554";

// =====================================================================
// 1. Data Definitions for Terms & Conditions
// =====================================================================

const TERMS_DATA = [
    // Section 1: Purchase and Payment
    {
        icon: FaCheckCircle,
        title_bn: "প্লট বরাদ্দ প্রক্রিয়া",
        title_en: "Plot Allocation Process",
        color: "text-blue-600",
        items: [
            { id: 1, text: "সম্পূর্ণ প্রকল্পটি সেক্টর ও ব্লকে বিভক্ত। প্লট বরাদ্দের ক্ষেত্রে **'আগে আসলে আগে পাবেন'** ভিত্তিতে বুকিং চলছে। একক বা যৌথ নামে এক বা একাধিক প্লট বুকিং দেওয়া যাবে।", tag: "Booking Basis" },
            { id: 2, text: "ক্রেতা কর্তৃক কোম্পানির নির্ধারিত **বুকিং ফরম বা অনলাইন ফরম পূরণ** করতে হবে।", tag: "Form Submission" },
            { id: 3, text: "বুকিং মানি ও ডাউন পেমেন্টসহ মোট মূল্যের কমপক্ষে **২০% প্রদান** করার পর গ্রহীতার নামে স্ট্যাম্পে **প্রাথমিক চুক্তিপত্র** সম্পাদন করা হবে। বুকিং মানি ও ডাউন পেমেন্ট (প্রতিটি) কাঠা প্রতি **২০,০০০/- টাকা**।", tag: "Agreement/Down Payment" },
            { id: 4, text: "সকল প্রকার পেমেন্ট **Al-Hamra Homes এর অনুকূলে** নগদ/চেক/NPSB/RTGS/BFTN এর মাধ্যমে পরিশোধ করে কোম্পানী কর্তৃক প্রদত্ত মানিরিসিপ্ট সংগ্রহ করতে হবে।", tag: "Payment Method" },
        ]
    },
    // Section 2: Registration and Discount
    {
        icon: FaMoneyBillWave,
        title_bn: "রেজিস্ট্রেশন ও ডিসকাউন্ট",
        title_en: "Registration & Discounts",
        color: "text-green-600",
        items: [
            { id: 5, text: "এককালীন ক্রয়ের ক্ষেত্রে জমির মোট মূল্যের **৫০% টাকা প্রদানের পর**, অবশিষ্ট টাকা পরবর্তী **৬০ দিনের মধ্যে পরিশোধ সাপেক্ষে** রেজিস্ট্রেশন সম্পন্ন হবে।", tag: "Lump Sum Payment" },
            { id: 6, text: "এককালীন ক্রয়ের ক্ষেত্রে মোট মূল্যের উপর **১৪% ডিসকাউন্ট** পাবেন। কিস্তিতে ক্রয়ের ক্ষেত্রে সম্পূর্ণ মূল্য পরিশোধের পর রেজিস্ট্রেশন সম্পন্ন করা হবে।", tag: "Discount Policy" },
            { id: 7, text: "কিস্তিতে প্লট ক্রয়ের ক্ষেত্রে বুকিং মানি ও ডাউন পেমেন্ট বাদে অবশিষ্ট টাকা **৬ বছরে মোট ৭২টি কিস্তিতে** পরিশোধ করতে হবে।", tag: "Installment Plan" },
            { id: 8, text: "প্লটের সম্পূর্ণ মূল্য ও রেজিস্ট্রি খরচ প্রদান করার পর, ক্রেতার অনুকূলে বা তার মনোনীত ব্যক্তি বরাবরে **রেজিস্ট্রিকৃত দলিলের মাধ্যমে প্লট হস্তান্তর** করা হবে।", tag: "Handover" },
        ]
    },
    // Section 3: Policy, Cancellation and Changes
    {
        icon: FaFileContract,
        title_bn: "নীতিমালা, বাতিল ও পরিবর্তন",
        title_en: "Policy, Cancellation & Changes",
        color: "text-red-600",
        items: [
            { id: 9, text: "বিদেশে অবস্থানরত ক্রেতাগণ সমপরিমান টাকা **বৈদেশিক মুদ্রায় পরিশোধ** করতে পারবেন। এটি সংশ্লিষ্ট তফসিলি ব্যাংক কর্তৃক নির্ধারিত বিনিময় হারে টাকায় রূপান্তর করা হবে।", tag: "Foreign Currency" },
            { id: 10, text: "বুকিং বাতিল করতে চাইলে, ২ বছরের মধ্যে **১০% সার্ভিস চার্জ** কর্তন করে জমাকৃত টাকা ৩ মাসের মধ্যে ফেরৎ দেওয়া হবে।", tag: "Cancellation (2Yrs)" },
            { id: 11, text: "বুকিং বাতিল: ৩ বছর পূর্ণ হলে জমাকৃত টাকার উপর **৫%, ৪ বছরে ১০% এবং ৫ বছরে ১৫% লভ্যাংশসহ** ৩ মাসের মধ্যে ফেরৎ দেওয়া হবে।", tag: "Cancellation (3Yrs+)" },
            { id: 12, text: "কোনো ক্রেতা একটানা **০৩ মাস কিস্তি প্রদানে ব্যর্থ** হলে লিখিত নোটিশ প্রদান সাপেক্ষে কোম্পানী বুকিং বাতিল করার ক্ষমতা সংরক্ষণ করে।", tag: "Default Policy" },
            { id: 13, text: "ক্রেতা যদি মালিকানা সংক্রান্ত পরিবর্তন করতে চায়, তবে ২য় পক্ষ/পক্ষগণকে কোম্পানীর নির্ধারিত নিয়মানুযায়ী **পরিবর্তন ফি** প্রদান করতে হবে।", tag: "Ownership Change" },
            { id: 14, text: "কোম্পানী যেকোনো সময় **মূল্য তালিকা পরিবর্তন ও পরিবর্ধনের অধিকার সংরক্ষণ করে**, তবে **বুঝিংকৃত প্লটের মূল্য অপরিবর্তিত থাকবে**।", tag: "Price Clause" },
            { id: 15, text: "Al-Hamra Homes ক্রেতাদের সুবিধার্থে **ডিজাইন, নিয়মাবলী এবং লে-আউট প্লান** প্রয়োজনে পরিবর্তন, পরিবর্ধন ও পরিমার্জন করার ক্ষমতা সংরক্ষণ করে।", tag: "Authority Rights" },
        ]
    },
    // Section 4: Use and Special Conditions
    {
        icon: FaUserFriends,
        title_bn: "মৃত্যু/পঙ্গুত্ব এবং ব্যবহার",
        title_en: "Demise, Disability & Usage",
        color: "text-yellow-600",
        items: [
            { id: 16, text: "প্লট গ্রহীতাকে প্রতি মাসের **০১ থেকে ১০ তারিখের মধ্যে** চলতি মাসের কিস্তি পরিশোধ করতে হবে।", tag: "Payment Deadline" },
            { id: 17, text: "প্রকল্পের পানি, গ্যাস, বিদ্যুৎ ইত্যাদি সরবরাহ কোম্পানীর উদ্যোগে ব্যবস্থা করা হবে। **এ সংক্রান্ত যাবতীয় খরচের অংশ প্লট গ্রহীতাকে বহন করতে হবে**।", tag: "Utility Cost" },
            { id: 18, text: "প্রকল্পে মাটি ভরাটসহ সকল প্রকার উন্নয়ন **কোম্পানীর খরচে** সরকারি নীতিমালা অনুযায়ী সম্পন্ন করা হবে।", tag: "Development Cost" },
            { id: 19, text: "বরাদ্দকৃত প্লট **নির্ধারিত উদ্দেশ্যেই ব্যবহার** করা যাবে।", tag: "Plot Usage" },
            { id: 20, text: "গ্রাহক প্রদত্ত চুক্তিনামার অধীনে যাবতীয় শর্তাবলী তার/তাদের অবর্তমানে **নমিনীর ক্ষেত্রেও সমভাবে প্রযোজ্য** হবে।", tag: "Nominee Clause" },
            { id: 21, text: "কোনো গ্রাহক **৫০% বা তার অধিক কিস্তি পরিশোধ করে মৃত্যুবরণ করলে** তার নমিনীর নিকট আর কোনো কিস্তি গ্রহণ না করেই নির্ধারিত সময়ে প্লট বুঝিয়ে দেওয়া হবে।", tag: "Demise Policy" },
            { id: 22, text: "দুর্ঘটনায় গ্রাহক পঙ্গুত্ব বরণ করলে/কর্মক্ষম হলে প্লটের মোট মূল্যের উপর **২০% টাকা ডিসকাউন্ট** করা হবে।", tag: "Disability Discount" },
        ]
    },
];

// =====================================================================
// 2. Motion/Framer-Motion Variants (Unchanged)
// =====================================================================

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// =====================================================================
// 3. Sub-Component for Individual Rule Item
// =====================================================================

const RuleItem = ({ rule, index }) => (
    <motion.div
        variants={itemVariants}
        className="flex items-start p-4 bg-white rounded-lg border-l-4 border-red-500 shadow-md hover:shadow-xl transition duration-300"
    >
        <FaHandPointRight className="mt-1 mr-3 text-2xl text-gray-700 flex-shrink-0" />
        <div className="flex flex-col">
            <p className="text-gray-800 leading-relaxed">
                <span className="font-bold text-red-600 mr-2">{index + 1}.</span> 
                {rule.text}
            </p>
            {/* Optional Tag for quick identification */}
            {/* <span className="text-xs text-gray-400 italic mt-1 self-end">{rule.tag}</span> */}
        </div>
    </motion.div>
);

// =====================================================================
// 4. Main Component: TermsAndConditions
// =====================================================================

const TermsAndConditions = () => {
    return (
        <section className="bg-gray-100 font-sans py-16 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Main Title Banner */}
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
                        <span style={{ color: primaryNavy }}>শর্ত ও নিয়মাবলী</span>
                    </h2>
                    <p className="text-xl text-red-600 font-medium">
                        (Terms & Conditions for Plot and Share Purchase)
                    </p>
                    <div className="w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Main Content Grid (1 or 2 Columns for Sections) */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {TERMS_DATA.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border-t-8" style={{ borderColor: section.color }}>
                            
                            {/* Section Header */}
                            <div className="flex items-center mb-6 border-b pb-3">
                                <section.icon className={`text-4xl mr-4 ${section.color}`} />
                                <div className="flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {section.title_bn}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-500">{section.title_en}</p>
                                </div>
                            </div>

                            {/* Rules List */}
                            <div className="space-y-4">
                                {section.items.map((rule, ruleIndex) => (
                                    <RuleItem 
                                        key={ruleIndex} 
                                        rule={rule} 
                                        index={rule.id - 1} // Use the actual ID - 1 for sequencing 1. to 22.
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TermsAndConditions;