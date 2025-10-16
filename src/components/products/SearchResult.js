import { motion } from 'motion/react';

export const SearchResultItem = ({
  product,
  onClick,
  isSelected
}) => {
  const imageUrl = product.imageUrl || product.images?.[0] || '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      onClick={() => onClick(product)}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${isSelected
        ? 'bg-blue-50 dark:bg-blue-900/20'
        : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
        }`}
    >
      < div>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-md bg-gray-100 flex-shrink-0 mr-8"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.jpg';
            }}
          />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {product.name}
          </h4>

          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {product.category || 'Uncategorized'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              ₹{product.price?.toLocaleString() || '0'}
            </span>
            {product.condition && (
              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                {product.condition}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};