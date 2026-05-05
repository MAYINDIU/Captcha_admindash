import { Carousel } from 'flowbite-react';
import React from 'react';
import slider1 from '../Assets/Slider/slider.jpg';
import slider2 from '../Assets/Slider/slider11.jpg';
import slider3 from '../Assets/Slider/slider12.jpg';
import slider4 from '../Assets/Slider/slider13.jpg';
import slider5 from '../Assets/Slider/slider14.jpg';
import slider6 from '../Assets/Slider/slider15.jpg';
import slider7 from '../Assets/Slider/slider16.jpg';

const Slider = () => {
  const navbarHeight = 64; // Adjust according to your navbar height

  return (
    <div className="w-full">
      {/* Slider container */}
      <div
        className="w-full relative h-[280px] sm:h-[300px] md:h-[400px] lg:h-[calc(100vh-14px)] overflow-hidden"
      >
        <Carousel
          slideInterval={4000} // 4s per slide
          className="h-full w-full relative"
        >
          {[slider1, slider2, slider3, slider4, slider5, slider6,slider7].map((image, index) => (
            <div
              key={index}
              className="w-full h-full flex justify-center items-center"
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover "
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default Slider;
