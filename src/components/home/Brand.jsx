import Link from "next/link";
import React from "react";
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
    { icon: <SiNike />, name: "Nike", link: '#' },
    { icon: <SiAdidas />, name: "Adidas", link: '#' },
    { icon: <SiZara />, name: "Zara", link: '#' },
    { icon: <SiPuma />, name: "Puma", link: '#' },
    { icon: <SiUnderarmour />, name: "Under Armour", link: '#' },
    { icon: <SiReebok />, name: "Reebok", link: '#' },
    { icon: <SiUniqlo />, name: "Uniqlo", link: '#' },
  ];

  const doubledBrands = [...brands, ...brands,];

  return (
    <div className="w-full bg-neutral-300 dark:bg-neutral-950 text-gray-800 dark:text-white py-2 overflow-hidden border-t border-b border-gray-300 dark:border-white">
      <div
        className="flex whitespace-nowrap items-center"
        style={{ animation: "marquee 20s linear infinite" }}
      >
        {doubledBrands.map((brand, index) => (
          <Link
            href={brand.link}
            key={index}
            className="mx-16 text-5xl sm:text-6xl hover:text-lime-500 dark:hover:text-green-500 transition-colors duration-300 flex flex-col items-center"
          >
            {brand.icon}
            <span className="text-sm mt-2">{brand.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Brand;
