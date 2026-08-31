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
 * High-speed resilient rendering with Cloudinary optimization,
 * native lazy-loading, automatic original URL fallback on error,
 * no-referrer policy, and smooth layout stability.
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
  const [currentSrc, setCurrentSrc] = useState<string>(optimizedSrc || src || '');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync currentSrc when src prop changes
  useEffect(() => {
    const nextOptimized = getOptimizedImageUrl(src, { width: targetWidth });
    const nextSrc = nextOptimized || src || '';
    setCurrentSrc(nextSrc);
    setIsLoaded(false);
    setHasError(!nextSrc || nextSrc.trim().length === 0);

    if (!nextSrc || !nextSrc.trim()) return;

    // Check if image is already loaded in DOM or memory
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    const probe = new Image();
    probe.referrerPolicy = 'no-referrer';
    probe.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    probe.src = nextSrc;
    if (probe.complete && probe.naturalWidth > 0) {
      setIsLoaded(true);
      setHasError(false);
    }
  }, [src, targetWidth]);

  const hasValidSrc = Boolean(currentSrc && currentSrc.trim().length > 0);

  const handleError = () => {
    // If the optimized URL failed, fallback to the original raw src once before showing error
    if (src && currentSrc !== src) {
      setCurrentSrc(src);
      setIsLoaded(false);
    } else {
      setIsLoaded(false);
      setHasError(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      {/* Luxury Skeleton Loading Shimmer */}
      {hasValidSrc && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#f7f3eb] dark:bg-stone-800 animate-pulse flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-[#D4AF37]/50 text-xl animate-spin">
            spa
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
            {alt || 'صورة صالون غلو بريتي'}
          </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => {
            setIsLoaded(true);
            setHasError(false);
          }}
          onError={handleError}
          className={`transition-opacity duration-300 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
    </div>
  );
};
