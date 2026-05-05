import React from 'react';
import { motion } from 'framer-motion';
import Slider from './Slider/Slider';
import Features from './Features/Features';
import ContributingSection from './Features/ContributingSection';
import ImageGallery from './Features/ImageGallery';
import FeatureGridInline from './Features/FeatureGridInline';
import AlHamraFacilities from './Features/AlHamraFacilities';

const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
};

const Home = () => {
    return (
        <div className="space-y-8">

            {/* Hero Slider */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ duration: 0.4 }}
            >
                <Slider />
            </motion.div>

            {/* Product Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ duration: 0.8, delay: 0.2 }}
                className=""
            >
                <Features />
            </motion.div>

            {/* Vision & Mission Section */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <ContributingSection />
            </motion.div>

            {/* Carousel Slider */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ duration: 0.8, delay: 0.6 }}
            >
                <ImageGallery />
            </motion.div>

      
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="  p-10"
            >
                <FeatureGridInline />
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={sectionVariants}
                transition={{ duration: 0.8, delay: 1 }}
            >
                <AlHamraFacilities />
            </motion.div>

        </div>
    );
};

export default Home;
