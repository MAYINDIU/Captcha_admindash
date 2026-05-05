import React, { useState, useEffect } from 'react';
import { 
    FaPhone, FaHome, FaEnvelope, 
    FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGooglePlay, FaArrowUp, 
    FaBuilding, FaKey, FaHandshake, FaMoneyBillAlt 
} from 'react-icons/fa';
import Logo from "../Assets/Icons/logo1.png"; // Assuming logo.png is the white/transparent version

const Footer = () => {
    const [showScroll, setShowScroll] = useState(false);

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) { // show after 300px scroll
                setShowScroll(true);
            } else {
                setShowScroll(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#00291f] text-gray-300 font-sans relative"> 
            <div className="max-w-screen-xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                
                {/* Column 1: About & Social */}
                <div>
                    <div className="mb-6">
                        <img src={Logo} alt="Al-Hamra Homes Logo" className="h-12 mb-3" />
                        <p className="text-sm leading-relaxed">
                            Specializing in premium property development and trusted brokerage services across Dhaka. We build dreams, not just houses.
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <a href="#!" aria-label="Facebook" className="text-gray-400 hover:text-[#c5a059] transition-colors duration-300">
                            <FaFacebookF size={20} />
                        </a>
                        <a href="#!" aria-label="Twitter" className="text-gray-400 hover:text-[#c5a059] transition-colors duration-300">
                            <FaTwitter size={20} />
                        </a>
                        <a href="#!" aria-label="Instagram" className="text-gray-400 hover:text-[#c5a059] transition-colors duration-300">
                            <FaInstagram size={20} />
                        </a>
                        <a href="#!" aria-label="LinkedIn" className="text-gray-400 hover:text-[#c5a059] transition-colors duration-300">
                            <FaLinkedinIn size={20} />
                        </a>
                        <a href="#!" aria-label="Google Play" className="text-gray-400 hover:text-[#c5a059] transition-colors duration-300">
                            <FaGooglePlay size={20} />
                        </a>
                    </div>
                </div>

                {/* Column 2: Services */}
                <div>
                    <h6 className="uppercase font-bold text-white tracking-wider text-base mb-6">Our Offerings</h6>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-center group">
                            <FaBuilding className="mr-3 text-[#c5a059] group-hover:scale-110 transition-transform" /> 
                            <a href="#!" className="hover:text-[#c5a059] transition-colors">Apartment Sales</a>
                        </li>
                        <li className="flex items-center group">
                            <FaKey className="mr-3 text-[#c5a059] group-hover:scale-110 transition-transform" /> 
                            <a href="#!" className="hover:text-[#c5a059] transition-colors">Property Management</a>
                        </li>
                        <li className="flex items-center group">
                            <FaHandshake className="mr-3 text-[#c5a059] group-hover:scale-110 transition-transform" /> 
                            <a href="#!" className="hover:text-[#c5a059] transition-colors">Land Development</a>
                        </li>
                        <li className="flex items-center group">
                            <FaMoneyBillAlt className="mr-3 text-[#c5a059] group-hover:scale-110 transition-transform" /> 
                            <a href="#!" className="hover:text-[#c5a059] transition-colors">Product</a>
                        </li>
                         <li className="flex items-center group">
                            <FaMoneyBillAlt className="mr-3 text-[#c5a059] group-hover:scale-110 transition-transform" /> 
                            <a href="#!" className="hover:text-[#c5a059] transition-colors">Service</a>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Quick Links */}
                <div>
                    <h6 className="uppercase font-bold text-white tracking-wider text-base mb-6">Quick Access</h6>
                    <ul className="space-y-4 text-sm">
                        <li><a href="#!" className="hover:text-[#c5a059] transition-colors">Current Projects</a></li>
                        <li><a href="#!" className="hover:text-[#c5a059] transition-colors">About Us</a></li>
                        <li><a href="#!" className="hover:text-[#c5a059] transition-colors">Client Testimonials</a></li>
                        <li><a href="#!" className="hover:text-[#c5a059] transition-colors">Terms & Privacy</a></li>
                    </ul>
                </div>

                {/* Column 4: Contact */}
                <div>
                    <h6 className="uppercase font-bold text-white tracking-wider text-base mb-6">Get In Touch</h6>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start"><FaHome className="flex-shrink-0 mr-3 mt-1 text-[#c5a059]" /><span>33, Al-Amin Islam Bhaban, Floor-12B, Noyapolton, Dhaka.</span></li>
                        <li className="flex items-start"><FaEnvelope className="flex-shrink-0 mr-3 mt-1 text-[#c5a059]" /><a href="mailto:alhamrahomesbd@gmail.com" className="hover:text-[#c5a059] transition-colors">alhamrahomesbd@gmail.com</a></li>
                    </ul>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="bg-[#001f17] text-center py-5 px-6 lg:px-8 border-t border-gray-800">
                <p className="text-xs text-gray-400">©{new Date().getFullYear()} COMTECH SOFTWARE SOLUTION LTD. All Rights Reserved.</p>
            </div>

            {/* Scroll-to-top Button */}
            {showScroll && (
                <button
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center bg-[#c5a059] text-white rounded-full shadow-lg hover:bg-yellow-600 hover:scale-110 transition-all duration-300 z-50"
                >
                    <FaArrowUp size={18} />
                </button>
            )}

        </footer>
    );
};

export default Footer;