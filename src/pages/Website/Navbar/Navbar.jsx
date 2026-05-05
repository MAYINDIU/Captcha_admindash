import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
    FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube,
    FaPhoneAlt, FaRegPlayCircle, FaChevronDown, FaUserCircle,
    FaUserTie, FaBuilding, FaTools, FaTimes, FaStore, FaUser,
    FaHome, FaEnvelope, FaHandshake, FaMapMarkedAlt, FaRegListAlt, FaClipboardList
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { BsPersonLinesFill, BsFillLightbulbFill, BsStarFill } from "react-icons/bs";
import { MdOutlinePool } from "react-icons/md"; 
import logoStandard from "../Assets/Icons/logo.png";
import riverpark from "../Assets/Icons/riverpark.jpg";
const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    
    // Dropdown states for Desktop
    const [activeDropdown, setActiveDropdown] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    // Scroll Effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close everything on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsRegModalOpen(false);
        setActiveDropdown(null);
    }, [location.pathname]);

    // Data Structures
    const registrationTypes = [
        { name: "Investor", to: "/register", icon: <FaUserTie />, desc: "Explore investment opportunities" },
        { name: "Partner", to: "/register", icon: <FaHandshake />, desc: "Join our business network" },
        { name: "Customer", to: "/register", icon: <FaUser />, desc: "Find your dream property" },
    ];

    const navLinks = [
        { name: "Home", to: "/", icon: <FaHome /> },
                { name: "Our Products", to: "/our-products", icon: <FaEnvelope /> },
        { 
            name: "About Us", 
            dropdown: true,
            subItems: [
                { name: "About Us", to: "/about-us", icon: <BsStarFill /> },
                { name: "Board of Directors", to: "/board-of-directors", icon: <BsPersonLinesFill /> },
                { name: "Vision & Mission", to: "/vission", icon: <BsFillLightbulbFill /> },
                { name: "Company Values", to: "/company-values", icon: <FaHandshake /> },
            ]
        },
        { 
            name: "Projects",
            dropdown: true,
            subItems: [
                { name: "Location Map", to: "/project-location-map", icon: <FaMapMarkedAlt /> },
                 { name: "Project Layout", to: "/project-layout", icon: <FaMapMarkedAlt /> },
                { name: "Amenities", to: "/project-amenities", icon: <MdOutlinePool /> },
                // { name: "Terms & Conditions", to: "/terms-conditions", icon: <FaRegListAlt /> },
            ]
        },
            { name: "News & Events", to: "/news-events", icon: <FaEnvelope /> },
        { name: "Contact", to: "/contact-us", icon: <FaEnvelope /> },
    ];

    const handleRegClick = (path, type) => {
        setIsRegModalOpen(false);
        navigate(path, { state: { type } });
    };

    return (
        <header className={`w-full fixed top-0 left-0 z-[1000] font-sans transition-all duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
            
            {/* --- TOP BAR (Worldwide Style) --- */}
            <div className={`bg-[#f8f9fa] border-b border-gray-200 py-2 hidden lg:block transition-all ${scrolled ? "h-0 py-0 overflow-hidden border-none" : "h-auto"}`}>
                <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-gray-700 text-[14px]">
                    <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-500 text-xs uppercase tracking-wider">Follow Us</span>
                        <div className="flex gap-2">
                            <a href="#" className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200/50 text-gray-600 hover:bg-[#006a4e] hover:text-white transition-all"><FaFacebookF size={12} /></a>
                            <a href="#" className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200/50 text-gray-600 hover:bg-[#006a4e] hover:text-white transition-all"><FaTwitter size={12} /></a>
                            <a href="#" className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200/50 text-gray-600 hover:bg-[#006a4e] hover:text-white transition-all"><FaLinkedinIn size={12} /></a>
                        </div>
                 
                        {/* <div className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-100 text-[#006a4e] group-hover:bg-[#006a4e] group-hover:text-white transition-colors">
                                <FaPhoneAlt size={10} className="rotate-90" />
                            </div>
                            <a href="tel:01987654321" className="font-bold text-[#006a4e] text-xs">01987654321</a>
                        </div> */}
                    </div>
            <NavLink to="/riverpark-galary" className="flex items-center gap-3 shrink-0 group">
                 <div className="bg-white p-2 rounded-xl shadow-sm border-2 border-gray-100 hover:border-red-600 hover:scale-110 hover:shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center h-12 w-24 cursor-pointer">
           
                <img 
                    src={riverpark} 
                    alt="Riverpark Logo" 
                    className="h-10 w-auto object-contain" 
                />
             
                </div>   </NavLink>
            </div>
                </div>
           

            {/* --- MAIN NAVIGATION --- */}
            <nav className="bg-white py-2 lg:py-3 relative">
                <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
             <NavLink to="/" className="flex items-center gap-3 shrink-0 group">
                {/* LOGO */}
                <img 
                    src={logoStandard} 
                    alt="Logo" 
                    className={`transition-all duration-500 object-contain drop-shadow-sm ${scrolled ? 'h-8' : 'h-10'}`} 
                />
    
    {/* TEXT BRANDING - Single Row with Shadow */}
    <div className="flex items-baseline gap-2 transition-all duration-500">
        <span className={`
            font-black tracking-widest uppercase transition-all duration-500
            text-[#004d38] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.1)]
            ${scrolled ? 'text-[15px]' : 'text-[18px]'}
        `}
        style={{ fontFamily: "'Playfair Display', serif" }}> 
            Alhamra
        </span>
        
        <span className={`
            font-medium tracking-[0.2em] uppercase transition-all duration-500
            text-[#c5a059]
            ${scrolled ? 'text-[10px]' : 'text-[12px]'}
        `}
        style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Homes
        </span>
    </div>
</NavLink>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex items-center gap-1">
                        {navLinks.map((link, idx) => (
                            <div key={idx} className="group relative">
                                <NavLink 
                                    to={link.dropdown ? "#" : link.to}
                                    className={({isActive}) => `flex items-center gap-1 px-4 py-2 text-[13px] font-bold transition-all rounded-md whitespace-nowrap ${isActive && !link.dropdown ? "text-[#006a4e] bg-emerald-50" : "text-gray-700 hover:bg-gray-50 hover:text-[#006a4e]"}`}
                                >
                                    {link.name}
                                    {link.dropdown && <FaChevronDown size={8} className="text-gray-400 group-hover:rotate-180 transition-transform" />}
                                </NavLink>
                                {link.subItems && (
                                    <div className="absolute top-full left-0 w-60 bg-white shadow-xl rounded-xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-[1100]">
                                        {link.subItems.map((sub, sIdx) => (
                                            <NavLink key={sIdx} to={sub.to} className="flex items-center gap-3 px-5 py-2.5 text-[12px] text-gray-600 hover:bg-emerald-50 hover:text-[#006a4e] font-semibold transition-colors">
                                                <span className="text-emerald-500">{sub.icon}</span>
                                                {sub.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-3">
                            <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 px-4 py-1.5 border border-[#006a4e] text-[#006a4e] text-[13px] font-bold rounded-md hover:bg-emerald-50 transition-all">
                                <FaUserCircle size={16} /> Login
                            </button>
                           
                        </div>

                        {/* Mobile Toggle */}
                        <button 
                            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className={`h-0.5 w-6 bg-[#006a4e] rounded-full transition-all transform ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
                            <span className={`h-0.5 w-6 bg-[#006a4e] rounded-full transition-all ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
                            <span className={`h-0.5 w-6 bg-[#006a4e] rounded-full transition-all transform ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
                        </button>
                    </div>
                </div>

                {/* --- MOBILE SIDEBAR --- */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className="lg:hidden fixed inset-0 z-[1050]">
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40" 
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <motion.div 
                                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="absolute top-0 right-0 w-[300px] h-screen bg-white shadow-2xl p-6 pt-24"
                            >
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="absolute top-6 right-6 text-gray-500 hover:text-[#006a4e] transition-colors"
                                >
                                    <FaTimes size={24} />
                                </button>

                                {navLinks.map((link, idx) => (
                                    <div key={idx} className="mb-2">
                                        <div 
                                            className="flex justify-between items-center text-gray-800 font-bold p-3 text-sm rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => link.dropdown && setActiveMobileDropdown(activeMobileDropdown === idx ? null : idx)}
                                        >
                                            <span className="flex items-center gap-2">{link.icon} {link.name}</span>
                                            {link.dropdown && <FaChevronDown size={10} className={activeMobileDropdown === idx ? "rotate-180" : ""} />}
                                        </div>
                                        {link.subItems && activeMobileDropdown === idx && (
                                            <div className="mt-1 ml-6 border-l-2 border-emerald-100 space-y-1">
                                                {link.subItems.map((sub, sIdx) => (
                                                    <NavLink key={sIdx} to={sub.to} className="block text-gray-600 font-medium py-2 px-4 text-xs hover:text-[#006a4e]">
                                                        {sub.name}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div className="mt-8 space-y-3">
                                    <button onClick={() => navigate('/login')} className="w-full py-3 border border-[#006a4e] text-[#006a4e] font-bold rounded-xl text-sm">Login</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </nav>

            {/* --- REGISTRATION MODAL (Worldwide Style) --- */}
            <AnimatePresence>
                {isRegModalOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsRegModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-[#006a4e] to-[#004d38] p-10 text-center relative">
                                <button onClick={() => setIsRegModalOpen(false)} className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors">
                                    <FaTimes size={24} />
                                </button>
                                <h3 className="text-3xl font-bold text-white">Join Our Community</h3>
                                <p className="text-emerald-100 text-sm mt-2 uppercase tracking-widest">Select your account type</p>
                            </div>

                            <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50">
                                {registrationTypes.map((type, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handleRegClick(type.to, type.name)}
                                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#006a4e] hover:shadow-xl transition-all duration-300 group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-[#006a4e] text-2xl group-hover:bg-[#006a4e] group-hover:text-white transition-all mb-4">
                                            {type.icon}
                                        </div>
                                        <h4 className="font-bold text-gray-800 group-hover:text-[#006a4e] mb-1">{type.name}</h4>
                                        <p className="text-[10px] text-gray-500 leading-tight">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="p-5 border-t border-gray-100 bg-white text-center">
                                <p className="text-xs text-gray-500">
                                    Already have an account? <button className="text-[#006a4e] font-bold hover:underline">Log in</button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;