import React from 'react';

const ThriftXLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="relative flex items-center justify-center">
        {/* Rotating Circle - Green */}
        <div className="absolute w-40 h-40 rounded-full animate-spin-slow-green blend-glow"></div>

        {/* Rotating Circle - Pink (reverse direction) */}
        <div className="absolute w-40 h-40 rounded-full animate-spin-slow-pink blend-glow-reverse"></div>

        {/* Logo Text */}
        <h1 className="text-5xl font-bold text-white relative z-10 pointer-events-none">
          Thrift<span className="text-[#FF007F]">X</span>
        </h1>
      </div>
    </div>
  );
};

export default ThriftXLoader;
