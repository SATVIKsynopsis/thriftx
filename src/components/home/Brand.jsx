import React from "react";

const Brand = () => {
  const brands = ["Nike", "Adidas", "Zara", "H&M", "Puma", "Levi’s"];

  // Duplicate the array to make seamless loop
  const doubledBrands = [...brands, ...brands , ...brands];

  return (
    <div className="w-full bg-neutral-900 text-white py-5 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {doubledBrands.map((brand, index) => (
          <span
            key={index}
            className="mx-15 text-4xl font-semibold tracking-widest hover:text-green-600 transition-colors cursor-pointer"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Brand;
