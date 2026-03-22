import React, { useState } from 'react';
import { Calendar, User, ArrowUpRight, ImageOff } from 'lucide-react';
import { ClipLoader } from 'react-spinners';

const hasValidImage = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

const ArticleCard = ({
  image,
  title = 'The Future of Quantum Computing in Global Markets',
  description = 'Exploring how sub-atomic processing is set to redefine high-frequency trading and risk management protocols in the next decade.',
  author = 'Alex Rivers',
  date = 'Oct 24, 2023',
  url,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = hasValidImage(image) && !imgError;

  const handleViewArticle = () => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative max-w-sm rounded-2xl border border-white/10 bg-[#0f0f0f] overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.4)]">

      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-[#1a1a1a]">
        {showImage ? (
          <>
            {/* Spinner while image is loading */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipLoader color="#a855f7" size={28} />
              </div>
            )}
            <img
              src={image}
              alt={title}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setImgLoaded(true); }}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-[#181818] via-[#121212] to-[#0f0f0f] text-gray-500">
            <ImageOff size={26} className="text-gray-600" />
            <p className="text-xs tracking-wide uppercase">No image available</p>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2 font-light">
            {description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[12px] text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User size={14} className="text-purple-500" />
              <span className="truncate max-w-20">{author ?? 'Unknown'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {date}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewArticle}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white hover:text-black transition-all duration-300"
        >
          View Article
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;