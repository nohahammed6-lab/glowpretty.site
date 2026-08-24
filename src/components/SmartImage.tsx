import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../lib/cloudinary';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: string;
  onClick?: () => void;
  priority?: boolean;
  targetWidth?: number;
  width?: number | string;
  height?: number | string;
}

/**
 * SmartImage Component
 * Optimized for high-speed rendering with Cloudinary transformation,
 * native lazy-loading, layout shift prevention, and smooth fade-in.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackIcon = 'photo_camera',
  onClick,
  priority = false,
  targetWidth = 600,
  width,
  height,
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, { width: targetWidth });
  const hasValidSrc = Boolean(optimizedSrc && optimizedSrc.trim().length > 0);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(!hasValidSrc);

  useEffect(() => {
    if (!hasValidSrc) {
      setIsLoaded(false);
      setHasError(true);
      return;
    }

    setHasError(false);
    setIsLoaded(false);

    // Fast check: if the browser has already cached this exact URL, show it immediately
    const img = new Image();
    img.src = optimizedSrc;
    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [optimizedSrc, hasValidSrc]);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {/* Luxury Skeleton Loading Shimmer */}
      {hasValidSrc && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-stone-200/60 dark:bg-stone-800/60 animate-pulse flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-amber-500/40 text-xl animate-spin">
            sync
          </span>
        </div>
      )}

      {/* Error / Empty Fallback */}
      {!hasValidSrc || hasError ? (
        <div className="w-full h-full bg-[#FAF6ED] dark:bg-stone-800 border border-[#D4AF37]/30 flex flex-col items-center justify-center text-[#D4AF37] p-3 text-center">
          <span className="material-symbols-outlined text-3xl mb-1 opacity-70">
            {fallbackIcon}
          </span>
          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 truncate max-w-full">
            {alt || 'صورة غير متاحة'}
          </span>
        </div>
      ) : (
        /* Rendered Image with key to force immediate unmount of stale image buffer and smooth transition */
        <img
          key={optimizedSrc}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => {
            setIsLoaded(true);
            setHasError(false);
          }}
          onError={() => {
            setIsLoaded(false);
            setHasError(true);
          }}
          className={`transition-opacity duration-300 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
    </div>
  );
};

