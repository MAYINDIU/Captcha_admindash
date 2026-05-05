import React from 'react';
import platinumLogo from '../../Assets/Icons/logo.png';
import basicLogo from '../../Assets/Icons/logo.png';
import standardLogo from '../../Assets/Icons/logo.png';
import familyLogo from '../../Assets/Icons/logo.png';
import premiumLogo from '../../Assets/Icons/logo.png';
import goldLogo from '../../Assets/Icons/logo.png';
import { Tooltip } from '@mui/material';

const HospitalCards = () => {
  const cards = [
    {
      id: 1,
      type: "PLATINUM",
      cardNumber: "PBL 000 111 222",
      holder: "John Doe",
      logo: platinumLogo,
      gradient: "bg-gradient-to-r from-green-400 to-green-600",
      benefits: ["Free checkup", "24/7 Hospital access", "Priority appointments"]
    },
    {
      id: 2,
      type: "BASIC",
      cardNumber: "BSC 000 222 333",
      holder: "Jane Doe",
      logo: basicLogo,
      gradient: "bg-gradient-to-r from-[#039BE5] to-cyan-400",
      benefits: ["Discount on medicines", "Free annual checkup"]
    },
    {
      id: 3,
      type: "STANDARD",
      cardNumber: "STD 000 333 444",
      holder: "Alice Smith",
      logo: standardLogo,
      gradient: "bg-gradient-to-r from-red-400 to-red-600",
      benefits: ["Free lab tests", "Discount on consultations"]
    },
    {
      id: 4,
      type: "FAMILY",
      cardNumber: "FAM 000 444 555",
      holder: "Bob Smith",
      logo: familyLogo,
      gradient: "bg-gradient-to-r from-pink-400 to-pink-600",
      benefits: ["Covers 4 family members", "Free vaccinations"]
    },
    {
      id: 5,
      type: "PREMIUM",
      cardNumber: "PRM 000 555 666",
      holder: "Charlie Brown",
      logo: premiumLogo,
      gradient: "bg-gradient-to-r from-purple-400 to-purple-600",
      benefits: ["Private room", "Priority ambulance service"]
    },
{
  id: 6,
  type: "GOLD",
  cardNumber: "GLD 000 666 777",
  holder: "David Johnson",
  logo: goldLogo,
  gradient: "bg-gradient-to-r from-yellow-700 via-yellow-600 to-amber-600",
  benefits: ["Free surgeries coverage", "Dedicated support"]
}

  ];

  return (
    <div className="px-3 sm:px-6 lg:px-24 mt-0">
 

<div className="text-center mb-8 font-poppins">
  <h2 className="text-lg lg:text-3xl font-extrabold bg-gradient-to-r from-[#00838F] via-[#00ACC1] to-[#26C6DA] bg-clip-text text-transparent drop-shadow-md">
    Explore Our Exclusive Health Cards
  </h2>
  <p className="text-gray-700 text-sm lg:text-base leading-relaxed max-w-2xl mx-auto mt-3 drop-shadow-sm">
    Unlock affordable healthcare benefits for you and your loved ones.  
    Enjoy priority medical services, exclusive discounts, and peace of mind  
    with our range of tailored health cards designed just for you.
  </p>
</div>



      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {cards.map(({ id, type, cardNumber, holder, logo, gradient, benefits }) => (
          <Tooltip
            key={id}
            title={
              <ul className="text-sm list-disc ml-5">
                {benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            }
            arrow
          >
            <div
              className={`rounded-2xl shadow-xl w-full h-60 p-6 flex flex-col justify-between ${gradient} text-white transition-transform duration-300 transform hover:scale-105 cursor-pointer`}
            >
              {/* Top Row */}
              <div className="flex justify-between items-center">
                <div className="font-semibold text-lg tracking-widest">
                  {type}
                </div>
                <img src={logo} alt="company logo" className="w-12 h-12" />
              </div>

              {/* Card Details */}
              <div className="mt-4">
                <p className="uppercase text-xs tracking-[0.2em] opacity-90">
                  Pleasure Card
                </p>
                <p className="tracking-widest text-lg font-mono font-medium mt-2">
                  {cardNumber}
                </p>
                <div className="mt-3">
                  <p className="text-xs opacity-90">Card Holder</p>
                  <p className="text-sm lg:text-base font-bold">{holder}</p>
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default HospitalCards;
