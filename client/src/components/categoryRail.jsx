import React from 'react';

const categories = [
  'All', 'Politics', 'Weather', 'Technology',
  'Sports', 'Crypto', 'Stocks', 'Real Estate',
  'AI', 'Energy', 'Health',
];

const CategoryRail = ({ activeCategory = 'All', onCategoryChange }) => {
  return (
    <div className="w-full border-b border-white/5 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange?.(category)}
              className={`
                whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${
                  category === activeCategory
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-white/10 hover:border-white/40 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CategoryRail;