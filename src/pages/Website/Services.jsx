import React, { useState } from "react";
import service1 from "./Assets/services/service.jpg"; 
import service2 from "./Assets/services/basic.jpg";
import service3 from "./Assets/services/family.jpg";
import service4 from "./Assets/services/plutinum.jpg";
import service5 from "./Assets/services/premium.jpg";
import service6 from "./Assets/services/standard.jpg";

const ServicesPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const services = [
    { id: 1, image: service1 },
    { id: 2, image: service2 },
    { id: 3, image: service3 },
    { id: 4, image: service4 },
    { id: 5, image: service5 },
    { id: 6, image: service6 },
  ];

  return (
    <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-20">
      {/* Page Heading */}
      <div className="max-w-6xl mx-auto text-center mt-12 mb-12">
        <h2 className="text-4xl md:text-5xl mt-7 font-extrabold text-[#0097A7] mb-4">
          Our Card Services
        </h2>
       <p className="text-gray-700 text-justify text-lg max-w-full mx-auto">
                At AL-HAMRA HOMES LTD., we provide a wide range of health card solutions designed to make quality healthcare easy, affordable, and accessible for every family. Our services prioritize your well-being, offering comprehensive coverage, exclusive benefits, and seamless support to ensure peace of mind for you and your loved ones. Join the growing community of satisfied families who trust us to safeguard their health with reliability and care.
                </p>

      </div>

      {/* Services Gallery */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="overflow-hidden rounded-2xl shadow-lg cursor-pointer transform transition duration-500 hover:scale-105 hover:shadow-2xl"
            onClick={() => setSelectedImage(service.image)}
          >
            <img
              src={service.image}
              alt={`Service ${service.id}`}
              className="w-full h-56 object-cover"
              style={{ objectPosition: "50% 21%" }}
            />
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-5xl w-full mx-4">
            <img
              src={selectedImage}
              alt="Service"
              className="w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
