'use client';

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
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

  // Duplicate the list for seamless scrolling
  const doubledBrands = [...brands, ...brands];

  return (
    <div className="w-full bg-neutral-300 dark:bg-neutral-950 text-gray-800 dark:text-white py-4 overflow-hidden border-y-2 border-black dark:border-white">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 50, // slower for smoother effect
          ease: "linear",
        }}
        style={{ display: "flex" }}
      >
        {doubledBrands.map((brand, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.3,
              color: "#84cc16", // lime-500
              textShadow: "0px 0px 10px #84cc16",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Link
              href={brand.link}
              className="mx-16 text-5xl text-black dark:text-white sm:text-6xl transition-all flex flex-col items-center"
            >
              {brand.icon}
              <span className="text-sm mt-2">{brand.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Brand;
