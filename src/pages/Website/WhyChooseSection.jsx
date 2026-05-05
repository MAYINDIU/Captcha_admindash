import React from "react";
import { FaShieldAlt, FaStethoscope, FaHandsHelping, FaClock } from "react-icons/fa";

const WhyChooseSection = () => {
  const points = [
    {
      icon: <FaShieldAlt className="text-[#00838F] text-4xl mb-3" />,
      title: "Reliable Protection",
      description:
        "Our health cards provide comprehensive medical coverage and ensure you and your family are protected at all times.",
    },
    {
      icon: <FaStethoscope className="text-[#00ACC1] text-4xl mb-3" />,
      title: "Access to Top Hospitals",
      description:
        "Get priority access to renowned hospitals and clinics with our exclusive health card plans.",
    },
    {
      icon: <FaHandsHelping className="text-[#26C6DA] text-4xl mb-3" />,
      title: "Family Friendly",
      description:
        "Plans available for individuals, couples, and entire families to ensure everyone’s health is taken care of.",
    },
    {
      icon: <FaClock className="text-[#00838F] text-4xl mb-3" />,
      title: "24/7 Support",
      description:
        "Our dedicated support team is available round the clock to assist you with claims, appointments, and inquiries.",
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-20 lg:mt-6 py-16 bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 drop-shadow-md">
          Why Choose Our Health Cards
        </h2>
        <p className="text-gray-600 text-sm lg:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
          Discover the advantages of our carefully crafted health card plans that ensure peace of mind, 
          affordable access to healthcare, and unmatched convenience for you and your family.
        </p>
      </div>

      {/* Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {points.map((point, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-6 shadow-xl flex flex-col items-center text-center transition-transform duration-300 hover:scale-105"
          >
            {point.icon}
            <h3 className="text-xl font-bold mb-2">{point.title}</h3>
            <p className="text-gray-600 text-sm">{point.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseSection;
