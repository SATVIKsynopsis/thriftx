// Product Detail Component Constants

export const PRODUCT_COLORS = [
  '#6B7244', // Olive green
  '#4A5568', // Gray
  '#5B7B9C'  // Blue gray
];

export const PRODUCT_SIZES = ['Small', 'Medium', 'Large', 'X-Large'];

export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024
};

export const CAROUSEL_SETTINGS = {
  minSwipeDistance: 30,
  transitionDuration: 500,
  defaultVisibleProducts: 4
};

export const TAB_OPTIONS = [
  { id: 'details', label: 'Product Details' },
  { id: 'reviews', label: 'Rating & Reviews' },
  { id: 'faqs', label: 'FAQs' }
];

export const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' }
];

export const THEME_COLORS = {
  primary: 'lime-400',
  secondary: 'gray-800',
  accent: 'green-400',
  text: {
    primary: 'white',
    secondary: 'gray-400',
    muted: 'gray-500'
  }
};

export const ANIMATION_CLASSES = {
  transition: 'transition-all duration-200',
  hover: 'hover:bg-gray-700',
  focus: 'focus:outline-none focus:ring-2 focus:ring-lime-400'
};
