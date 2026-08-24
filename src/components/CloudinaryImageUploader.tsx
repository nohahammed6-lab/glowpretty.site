import React, { useState, useRef } from 'react';
import { uploadImageToCloudinary } from '../lib/cloudinary';

interface CloudinaryImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  isArabic?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const CloudinaryImageUploader: React.FC<CloudinaryImageUploaderProps> = ({
  value,
  onChange,
  label,
  isArabic = true,
  placeholder,
  className = '',
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: isArabic ? 'يرجى اختيار ملف صورة صالحة (PNG, JPG, WEBP, GIF)' : 'Please select a valid image file',
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatusMessage(null);

    try {
      const secureUrl = await uploadImageToCloudinary(file, (percent) => {
        setProgress(percent);
      });

      onChange(secureUrl);
      setStatusMessage({
        type: 'success',
        text: isArabic ? 'تم رفع الصورة بنجاح إلى Cloudinary! ✨' : 'Image uploaded successfully to Cloudinary! ✨',
      });
    } catch (error: any) {
      console.error('Cloudinary Upload Error:', error);
      setStatusMessage({
        type: 'error',
        text: error?.message || (isArabic ? 'فشل رفع الصورة إلى Cloudinary' : 'Failed to upload image to Cloudinary'),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-[#594045]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Upload Zone / Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-3 sm:p-4 text-center transition-all bg-white ${
          isDragging
            ? 'border-[#9b0044] bg-[#fdf5f7] scale-[1.01]'
            : 'border-[#D4AF37]/50 hover:border-[#9b0044]/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Uploading State */}
        {uploading ? (
          <div className="py-3 flex flex-col items-center justify-center space-y-2">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span className="material-symbols-outlined animate-spin text-2xl text-[#9b0044]">
                progress_activity
              </span>
            </div>
            <p className="text-xs font-bold text-[#9b0044]">
              {isArabic ? `جاري رفع الصورة إلى Cloudinary... (${progress}%)` : `Uploading image to Cloudinary... (${progress}%)`}
            </p>
            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden border border-[#D4AF37]/30">
              <div
                className="bg-gradient-to-r from-[#9b0044] to-[#D4AF37] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Image Preview thumbnail if value exists */}
            {value ? (
              <div className="relative group shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-xs bg-gray-50">
                <img
                  src={value}
                  alt="Uploaded Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on image error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setStatusMessage(null);
                  }}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  title={isArabic ? 'إزالة الصورة' : 'Remove Image'}
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#fdf5f7] border border-[#D4AF37]/40 text-[#9b0044] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
              </div>
            )}

            {/* Instruction / Actions */}
            <div className="flex-1 text-start min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-burgundy text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-base">upload</span>
                  <span>{isArabic ? 'اختر صورة من جهازك' : 'Choose File'}</span>
                </button>
                <span className="text-[11px] text-gray-500 font-medium">
                  {isArabic ? 'أو اسحب الصورة هنا (Cloudinary)' : 'or drag & drop here'}
                </span>
              </div>

              {/* Direct URL input fallback / view */}
              <input
                type="url"
                value={value}
                required={required}
                onChange={(e) => {
                  onChange(e.target.value);
                  if (statusMessage) setStatusMessage(null);
                }}
                placeholder={placeholder || (isArabic ? 'رابط الصورة (secure_url)...' : 'Image secure_url...')}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-gray-700 bg-gray-50 focus:bg-white focus:border-[#9b0044] outline-none truncate"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span className="material-symbols-outlined text-base shrink-0">
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="flex-1">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
