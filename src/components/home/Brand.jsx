"use client";
import Link from "next/link";
import React from "react";
import { motion, useAnimationFrame } from "framer-motion";
import {
  SiNike,
  SiAdidas,
  SiZara,
  SiPuma,
  SiUnderarmour,
  SiReebok,
  SiUniqlo,
} from "react-icons/si";
import { ArrowRight } from "lucide-react";

const Brand = () => {
  const brands = [
    { icon: <SiNike />, name: "Nike", link: "/search?category=nike" },
    { icon: <SiAdidas />, name: "Adidas", link: "/search?category=adidas" },
    { icon: <SiZara />, name: "Zara", link: "/search?category=zara" },
    { icon: <SiPuma />, name: "Puma", link: "/search?category=puma" },
    { icon: <SiUnderarmour />, name: "Under Armour", link: "/search?category=under-armour" },
    { icon: <SiReebok />, name: "Reebok", link: "/search?category=reebok" },
    { icon: <SiUniqlo />, name: "Uniqlo", link: "/search?category=uniqlo" },
  ];

  const doubledBrands = [...brands, ...brands];
  const baseX = React.useRef(0);
  const containerRef = React.useRef(null);
  const paused = React.useRef(false);

  useAnimationFrame(() => {
    if (!paused.current && containerRef.current) {
      baseX.current -= 0.8; // speed
      containerRef.current.style.transform = `translateX(${baseX.current}px)`;
      if (Math.abs(baseX.current) >= containerRef.current.scrollWidth / 2) {
        baseX.current = 0;
      }
    }
  });

  return (
    <div className="relative w-full bg-neutral-300 dark:bg-neutral-950 text-gray-800 dark:text-white py-6 overflow-hidden border-y-2 border-black dark:border-white">

      {/* Arrow icon */}
      <motion.div
        className="absolute top-11 right-6 bg-gray-200 dark:bg-neutral-800 p-3 rounded-full shadow-md cursor-pointer z-10"
        whileHover={{
          scale: 1.2,
          backgroundColor: "#84cc16",
          color: "#000",
          boxShadow: "0 0 20px #84cc16",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        <ArrowRight className="w-6 h-6" />
      </motion.div>

      {/* Marquee container */}
      <div
        ref={containerRef}
        className="flex whitespace-nowrap"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        {doubledBrands.map((brand, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.3,
              color: "#84cc16",
              textShadow: "0px 0px 10px #84cc16",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Link
              href={brand.link}
              className="mx-16 text-5xl text-black dark:text-white sm:text-6xl flex flex-col items-center"
            >
              {brand.icon}
              <span className="text-lg mt-2">{brand.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Brand;
