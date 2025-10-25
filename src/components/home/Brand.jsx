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

const Brand = () => {
  const brands = [
    { icon: <SiNike />, name: "Nike", link: "#" },
    { icon: <SiAdidas />, name: "Adidas", link: "#" },
    { icon: <SiZara />, name: "Zara", link: "#" },
    { icon: <SiPuma />, name: "Puma", link: "#" },
    { icon: <SiUnderarmour />, name: "Under Armour", link: "#" },
    { icon: <SiReebok />, name: "Reebok", link: "#" },
    { icon: <SiUniqlo />, name: "Uniqlo", link: "#" },
  ];

  // duplicate list for seamless effect
  const doubledBrands = [...brands, ...brands];
  const baseX = React.useRef(0);
  const containerRef = React.useRef(null);

  // move continuously each frame
  useAnimationFrame((t) => {
    if (containerRef.current) {
      baseX.current -= 0.5; // speed (increase for faster movement)
      containerRef.current.style.transform = `translateX(${baseX.current}px)`;
      // reset when half scrolled to make it seamless
      if (Math.abs(baseX.current) >= containerRef.current.scrollWidth / 2) {
        baseX.current = 0;
      }
    }
  });

  return (
    <div className="w-full bg-neutral-300 dark:bg-neutral-950 text-gray-800 dark:text-white py-6 overflow-hidden border-y-2 border-black dark:border-white">
      <div ref={containerRef} className="flex whitespace-nowrap">
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
              <span className="text-sm mt-2">{brand.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Brand;
