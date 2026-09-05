/**
 * Cloudinary Unsigned Upload Utility
 * Cloud Name: qazdrpcx
 * Upload Preset: site2_images
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  created_at?: string;
}

export const CLOUDINARY_CLOUD_NAME = 'qazdrpcx';
export const CLOUDINARY_UPLOAD_PRESET = 'site2_images';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Uploads an image file directly to Cloudinary using Unsigned Upload Preset.
 * Returns the `secure_url` string.
 */
export async function uploadImageToCloudinary(
  file: File | Blob | string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type if File object
    if (file instanceof File && !file.type.startsWith('image/')) {
      reject(new Error('الملف المحدد ليس صورة صالحة (الصيغ المسموحة: JPG, PNG, WEBP, GIF, SVG)'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          if (data && data.secure_url) {
            const autoOptimizedUrl = addCloudinaryAutoOptimization(data.secure_url);
            resolve(autoOptimizedUrl);
          } else {
            reject(new Error('استجابة Cloudinary لم تحتوي على رابط آمن (secure_url)'));
          }
        } catch (err) {
          reject(new Error('فشل معالجة استجابة رفع الصورة من Cloudinary'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          const msg = errData?.error?.message || `فشل رفع الصورة (${xhr.status})`;
          reject(new Error(msg));
        } catch {
          reject(new Error(`فشل رفع الصورة إلى Cloudinary (كود: ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('حدث خطأ في الاتصال بالشبكة أثناء رفع الصورة إلى Cloudinary'));
    };

    xhr.send(formData);
  });
}

/**
 * Ensures any Cloudinary image URL contains the auto-format and auto-quality transformations (f_auto,q_auto)
 * to minimize bandwidth / data traffic while preserving pristine visual fidelity.
 */
export function addCloudinaryAutoOptimization(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();

  if (trimmed.includes('res.cloudinary.com') || trimmed.includes('cloudinary.com')) {
    // If it already has both f_auto and q_auto, return as-is
    if (trimmed.includes('f_auto') && trimmed.includes('q_auto')) {
      return trimmed;
    }

    const uploadToken = trimmed.includes('/image/upload/') ? '/image/upload/' : '/upload/';
    const uploadIndex = trimmed.indexOf(uploadToken);
    if (uploadIndex === -1) return trimmed;

    const base = trimmed.slice(0, uploadIndex + uploadToken.length);
    const afterUpload = trimmed.slice(uploadIndex + uploadToken.length);

    const segments = afterUpload.split('/');
    const firstSegment = segments[0] || '';

    const isVersion = /^v\d+$/.test(firstSegment);
    const isFile = segments.length === 1 || (!isVersion && firstSegment.includes('.'));

    if (isVersion || isFile) {
      return base + 'f_auto,q_auto/' + afterUpload;
    } else {
      const existing = firstSegment.split(',').filter((p) => !p.startsWith('f_') && !p.startsWith('q_'));
      existing.unshift('f_auto', 'q_auto');
      segments[0] = existing.join(',');
      return base + segments.join('/');
    }
  }

  return trimmed;
}

/**
 * Optimizes Cloudinary and external image URLs by appending automatic formatting (f_auto, q_auto)
 * and target dimension constraints (e.g. w_500, c_limit) without breaking or corrupting existing URLs.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: { width?: number; height?: number; crop?: string; quality?: string } = {}
): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const trimmed = url.trim();

  // Cloudinary Optimization
  if (trimmed.includes('res.cloudinary.com') || trimmed.includes('cloudinary.com')) {
    const { width, height, crop = 'limit', quality = 'auto' } = options;
    const transformParts: string[] = ['f_auto', `q_${quality}`];

    if (width && width > 0) transformParts.push(`w_${width}`);
    if (height && height > 0) transformParts.push(`h_${height}`);
    if (width || height) transformParts.push(`c_${crop}`);

    const transformStr = transformParts.join(',');

    const uploadToken = trimmed.includes('/image/upload/') ? '/image/upload/' : '/upload/';
    const uploadIndex = trimmed.indexOf(uploadToken);
    if (uploadIndex === -1) return trimmed;

    const base = trimmed.slice(0, uploadIndex + uploadToken.length);
    const afterUpload = trimmed.slice(uploadIndex + uploadToken.length);

    const segments = afterUpload.split('/');
    const firstSegment = segments[0] || '';

    const isVersion = /^v\d+$/.test(firstSegment);
    const isFile = segments.length === 1 || (!isVersion && firstSegment.includes('.'));

    if (isVersion || isFile) {
      return base + transformStr + '/' + afterUpload;
    } else {
      // First segment contains transformations (e.g. f_auto,q_auto)
      // Replace with full transformStr including width/crop if provided, or keep f_auto,q_auto
      segments[0] = transformStr;
      return base + segments.join('/');
    }
  }

  // Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      if (options.width) parsed.searchParams.set('w', options.width.toString());
      parsed.searchParams.set('q', '80');
      parsed.searchParams.set('auto', 'format');
      return parsed.toString();
    } catch {
      return url;
    }
  }

  // Googleusercontent Optimization
  if (url.includes('lh3.googleusercontent.com') && !url.includes('aida-public')) {
    if (options.width) {
      if (url.includes('=')) {
        return url.replace(/=s\d+/, `=s${options.width}`).replace(/=w\d+/, `=w${options.width}`);
      } else {
        return `${url}=w${options.width}-rw`;
      }
    }
  }

  return url;
}
