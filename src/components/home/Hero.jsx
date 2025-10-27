"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const images = ["/im2.png", "/im1.png", "/im4.png", "/im3.png"];

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
      transition: { staggerChildren: 0.2 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.5, type: "spring", stiffness: 200 },
    },
    hover: {
      scale: 1.05,
      boxShadow: "8px 10px 0px #ff2b78",
      transition: { type: "spring", stiffness: 400 },
    },
    tap: {
      scale: 0.95,
      boxShadow: "3px 5px 0px #ff2b78",
    },
  };

  return (
    <section className="bg-white text-gray-900 dark:bg-black dark:text-white overflow-hidden py-20 md:py-2 lg:pt-7 relative">
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row justify-between gap-8 px-4 sm:px-6 lg:px-5 md:mb-5">

        {/* LEFT SIDE */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full lg:w-1/2 "
        >
          <motion.div variants={textVariants} className="fontAnton tracking-[6px] sm:text-center lg:text-left">
            <h1 className="font-extrabold leading-[0.8] select-none mb-6 lg:mb-8">
              <motion.span
                className="block text-gray-900 dark:text-white text-8xl sm:text-9xl md:text-[10rem] lg:text-[10rem]"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                STREET
              </motion.span>
              <motion.span
                className="block text-[#bdf800] text-7xl sm:text-9xl md:text-[8rem] lg:text-[6rem] -mt-1 lg:-mt-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                STYLE
              </motion.span>
              <motion.span
                className="block text-[#ff2b78] text-8xl sm:text-9xl md:text-[10rem] lg:text-[10rem] -mt-1 lg:-mt-2"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                THRIFT
              </motion.span>
            </h1>
          </motion.div>

          <div className="mt-4 lg:-mt-4 w-full mx-auto text-sm text-left sm:text-center md:text-center lg:text-left text-gray-600 dark:text-gray-300 leading-relaxed">
            <p className="sm:max-w-md sm:mx-auto lg:mx-0  ">
              <span className="text-yellow-600 dark:text-yellow-300 text-lg">
                Mumbai's Underground Fashion Market
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">
                Discover unique vintage pieces, street fashion finds, and
                one of a kind thrift treasures from Mumbai's coolest sellers.
              </span>
            </p>
          </div>

          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="show"
            className="mt-6 lg:mt-4 sm:flex sm:items-center sm:justify-center lg:justify-start" 
          >
            <motion.div whileHover="hover" whileTap="tap">
              <Link
                href="/search"
                className="inline-flex items-center justify-center font-semibold px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base relative overflow-hidden group"
                style={{
                  backgroundColor: "#bdf800",
                  color: "#000",
                  boxShadow: "5px 7px 0px #ff2b78",
                }}
              >
                <motion.span className="absolute inset-0 bg-white/20 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="relative z-10">EXPLORE FINDS</span>
              </Link>
            </motion.div>
          </motion.div>

        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="w-full lg:w-1/2"
        >
          <motion.div animate="show" className="lg:flex flex-col gap-4">
            {/* First Row */}
            <div className="flex gap-4">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  className={`bg-white text-black rounded-[20px] overflow-hidden relative cursor-pointer ${i === 0 ? "w-[200px] md:w-[250px]" : "w-[250px] md:w-[405px]"
                    } h-[170px]`}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    rotateZ: i === 0 ? -1 : 1,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.img
                    src={images[i]}
                    alt={`Card ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Second Row */}
            <div className="flex gap-4 my-2">
              {[2, 3].map((i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  className={`bg-white text-black rounded-[20px] overflow-hidden relative cursor-pointer ${i === 2 ? "w-[250px] md:w-[405px]" : "w-[200px] md:w-[250px]"
                    } h-[170px]`}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    rotateZ: i === 2 ? -1 : 1,
                    transition: { type: "spring", stiffness: 300 },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.img
                    src={images[i]}
                    alt={`Card ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Background Dots */}
      <motion.div
        className="absolute top-20 left-5 w-2 h-2 bg-[#bdf800] rounded-full opacity-60 hidden sm:block"
        animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-5 w-3 h-3 bg-[#ff2b78] rounded-full opacity-40 hidden sm:block"
        animate={{ y: [0, 15, 0], x: [0, -15, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute top-1/2 left-10 w-1 h-1 bg-gray-500 dark:bg-white rounded-full opacity-30 hidden sm:block"
        animate={{ y: [0, -30, 0], x: [0, 20, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </section>
  );
};

export default Hero;
