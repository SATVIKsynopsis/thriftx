import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (email) {
      console.log('Email submitted:', email);
      // Add your newsletter subscription logic here
      setEmail('');
    }
  };

  return (
    <div className="relative bg-black pb-16 sm:pb-24 lg:pb-32">
      {/* Newsletter Box - Overlapping */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12 sm:-bottom-16 lg:-bottom-24 w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-black rounded-3xl px-6 sm:px-12 lg:px-16 py-8 sm:py-10 lg:py-12 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 shadow-2xl">
          {/* Left Side - Text */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <h2 className="text-white text-2xl sm:text-3xl lg:text-[40px] font-normal uppercase tracking-normal font-['Anton'] leading-tight sm:leading-[45px]">
              STAY UPTO DATE ABOUT<br />OUR LATEST OFFERS
            </h2>
          </div>

          {/* Right Side - Form */}
          <div className="w-full max-w-md lg:max-w-sm">
            <div className="flex flex-col gap-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-full bg-white text-gray-800 placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 sm:py-4 rounded-full bg-white text-black font-medium text-sm sm:text-base hover:bg-gray-100 transition-colors"
              >
                Subscribe to Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;
