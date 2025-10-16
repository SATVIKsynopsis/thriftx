import React from 'react';
import Link from 'next/link';
import { 
  Shirt, 
  Crown, 
  Zap, 
  ShoppingBag, 
  Heart, 
  Star, 
  Sparkles,
  Gift,
  Gem,
  Palette,
  Scissors,
  Camera
} from 'lucide-react';

const categories = [
  { name: "Women's Clothing", icon: Shirt, count: '2,400+ items', path: '/search?category=womens-clothing' },
  { name: "Men's Clothing", icon: Zap, count: '1,800+ items', path: '/search?category=mens-clothing' },
  { name: 'Dresses', icon: Crown, count: '900+ items', path: '/search?category=dresses' },
  { name: 'Shoes', icon: Star, count: '1,200+ items', path: '/search?category=shoes' },
  { name: 'Bags & Accessories', icon: ShoppingBag, count: '800+ items', path: '/search?category=bags-accessories' },
  { name: 'Jewelry', icon: Gem, count: '600+ items', path: '/search?category=jewelry' },
  { name: 'Jackets & Coats', icon: Gift, count: '500+ items', path: '/search?category=jackets-coats' },
  { name: 'Vintage', icon: Camera, count: '750+ items', path: '/search?category=vintage' },
  { name: 'Designer', icon: Sparkles, count: '400+ items', path: '/search?category=designer' },
  { name: 'Tops & Blouses', icon: Heart, count: '1,100+ items', path: '/search?category=tops-blouses' },
  { name: 'Pants & Jeans', icon: Scissors, count: '950+ items', path: '/search?category=pants-jeans' },
  { name: 'Skirts & Shorts', icon: Palette, count: '650+ items', path: '/search?category=skirts-shorts' },
];

const CategoryGrid = () => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Fashion Category</h2>
      <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">
        Discover amazing pre-loved fashion pieces across all your favorite styles
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link
              key={category.name}
              href={category.path}
              className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 text-gray-900 border border-gray-200 transition transform hover:-translate-y-1 hover:shadow-lg hover:border-blue-600"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <IconComponent size={32} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
