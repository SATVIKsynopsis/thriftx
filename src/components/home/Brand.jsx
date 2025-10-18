import React from "react";
import {
  SiNike,
  SiAdidas,
  SiZara,
  SiPuma,
  SiUnderarmour,
  SiReebok,
  SiAsos,
  SiShopify,
  SiUniqlo,
  SiHollister,
  SiAmericanapparel,
  SiAbercrombie,
  SiAeropostale,
  SiLevis,
  SiTommyhilfiger,
} from "react-icons/si";

const Brand = () => {
  const brands = [
    { icon: <SiNike />, name: "Nike" },
    { icon: <SiAdidas />, name: "Adidas" },
    { icon: <SiZara />, name: "Zara" },
    { icon: <SiPuma />, name: "Puma" },
    { icon: <SiUnderarmour />, name: "Under Armour" },
    { icon: <SiReebok />, name: "Reebok" },
    { icon: <SiShopify />, name: "Shopify" },
    { icon: <SiUniqlo />, name: "Uniqlo" },
  ];

  const doubledBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-neutral-950 text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee items-center">
        {doubledBrands.map((brand, index) => (
          <div
            key={index}
            className="mx-15 text-5xl sm:text-6xl hover:text-green-500 transition-colors duration-300 cursor-pointer flex flex-col items-center"
          >
            {brand.icon}
            <span className="text-sm mt-2">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Brand;
