import React from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import image4 from "../../assets/image4.png";

const Hero = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, type: "spring", stiffness: 80 },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.5, type: "spring", stiffness: 200 }
    },
    hover: {
      scale: 1.05,
      boxShadow: "8px 10px 0px #ff2b78",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: {
      scale: 0.95,
      boxShadow: "3px 5px 0px #ff2b78"
    }
  };

  const imageHoverVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Enhanced text animation variants
  const enhancedTextVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 10,
        duration: 0.8
      }
    }
  };

  // Staggered letter animation for main heading
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 150
      }
    })
  };

  return (
    <section className="bg-[#000] text-white overflow-hidden py-10 md:py-14 lg:py-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-8 lg:gap-5 px-4 sm:px-6 lg:px-5">
        
        {/* LEFT SIDE - Text Content */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full lg:w-1/2 text-center lg:text-left"
        >
          <motion.div variants={textVariants} className="fontAnton tracking-[6px]">
            <h1 className="font-extrabold leading-[0.8] select-none mb-6 lg:mb-8">
              <motion.span 
                className="block text-white text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[8rem]"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                STREET
              </motion.span>
              <motion.span 
                className="block text-[#bdf800] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] -mt-1 lg:-mt-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                STYLE
              </motion.span>
              <motion.span 
                className="block text-[#ff2b78] text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] -mt-1 lg:-mt-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                THRIFT
              </motion.span>
            </h1>
          </motion.div>

          <motion.div 
            variants={enhancedTextVariants}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="mt-4 lg:mt-6 text-sm sm:text-base md:text-lg max-w-md mx-auto lg:mx-0 text-gray-300 leading-relaxed">
              <p className="text-yellow-300 text-xl">
              Mumbai's Underground fashion market
              </p>
              <br />
              <p className="text-neutral-500 lg:-mt-3">
              Discover unique vintage pieces, street fashion finds, and
              one-of-a-kind thrift treasures from Mumbai's coolest sellers.
              </p>
            </p>
          </motion.div>

          <motion.div 
            variants={buttonVariants} 
            initial="hidden" 
            animate="show"
            className="mt-6 lg:mt-8"
            whileHover={{ 
              transition: { 
                type: "spring", 
                stiffness: 500,
                damping: 10
              } 
            }}
          >
            <motion.div
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                href="/search"
                className="inline-flex items-center justify-center font-semibold px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base relative overflow-hidden group"
                style={{
                  backgroundColor: "#bdf800",
                  color: "#000",
                  boxShadow: "5px 7px 0px #ff2b78",
                }}
              >
                {/* Button shine effect */}
                <motion.span 
                  className="absolute inset-0 bg-white/20 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                />
                <span className="relative z-10">EXPLORE FINDS</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - Card Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full lg:w-1/2"
        >
          {/* Mobile Layout - Stacked Cards */}
          <div className="block lg:hidden space-y-4">
            {[image1, image2, image3, image4].map((image, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                className="bg-white text-black rounded-[20px] overflow-hidden w-full h-48 relative"
                whileHover={{ 
                  scale: 1.02,
                  y: -3,
                  transition: { type: "spring", stiffness: 400 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute top-4 left-4 text-lg font-semibold z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg">
                  {["Casual", "Formal", "Party", "Gym"][index]}
                </div>
                <motion.img
                  src={image}
                  alt={["Casual", "Formal", "Party", "Gym"][index]}
                  className="absolute inset-0 w-full h-full object-cover"
                  variants={imageHoverVariants}
                  whileHover={{ scale: 1.05 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Desktop Layout - Original Grid with enhanced animations */}
          <motion.div
            initial="hidden"
            animate="show"
            className="hidden lg:flex flex-col gap-4"
          >
            {/* First Row */}
            <div className="flex gap-4">
              {/* Card 1 (small) */}
              <motion.div
                custom={0}
                variants={cardVariants}
                className="bg-white text-black rounded-[20px] overflow-hidden w-[300px] h-[213px] relative cursor-pointer"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  rotateZ: -1,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="absolute top-4 left-4 text-lg font-semibold z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  Casual
                </motion.div>
                <motion.img
                  src={image1}
                  alt="Casual"
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* Card 2 (large) */}
              <motion.div
                custom={1}
                variants={cardVariants}
                className="bg-white text-black rounded-[20px] overflow-hidden w-[505px] h-[213px] relative cursor-pointer"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  rotateZ: 1,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="absolute top-4 left-4 text-lg font-semibold z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  Formal
                </motion.div>
                <motion.img
                  src={image2}
                  alt="Formal"
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </div>

            {/* Second Row */}
            <div className="flex gap-4">
              {/* Card 3 (large) */}
              <motion.div
                custom={2}
                variants={cardVariants}
                className="bg-white text-black rounded-[20px] overflow-hidden w-[505px] h-[213px] relative cursor-pointer"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  rotateZ: -1,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="absolute top-4 left-4 text-lg font-semibold z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  Party
                </motion.div>
                <motion.img
                  src={image3}
                  alt="Party"
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* Card 4 (small) */}
              <motion.div
                custom={3}
                variants={cardVariants}
                className="bg-white text-black rounded-[20px] overflow-hidden w-[300px] h-[213px] relative cursor-pointer"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  rotateZ: 1,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="absolute top-4 left-4 text-lg font-semibold z-10 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  Gym
                </motion.div>
                <motion.img
                  src={image4}
                  alt="Gym"
                  className="absolute inset-0 w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-5 w-2 h-2 bg-[#bdf800] rounded-full opacity-60 hidden sm:block"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.4, 0.9, 0.4],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-5 w-3 h-3 bg-[#ff2b78] rounded-full opacity-40 hidden sm:block"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      {/* Additional floating element */}
      <motion.div
        className="absolute top-1/2 left-10 w-1 h-1 bg-white rounded-full opacity-30 hidden sm:block"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </section>
  );
};

export default Hero;