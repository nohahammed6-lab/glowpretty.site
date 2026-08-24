import { uploadImageToCloudinary } from './cloudinary';
import { saveDoc, saveDocArray } from './firebase';
import {
  Service,
  GalleryItem,
  AboutContent,
  SiteSettings,
  CategoryItem,
  Review,
} from '../types';

export interface DiscoveredImage {
  id: string;
  sourceType: 'service' | 'gallery' | 'about' | 'site_settings' | 'category' | 'review';
  sourceLabel: string;
  targetId: string;
  fieldKey: string;
  originalUrl: string;
  currentUrl: string;
  isCloudinary: boolean;
  status: 'pending' | 'migrating' | 'success' | 'failed' | 'already_migrated';
  progress?: number;
  error?: string;
  newSecureUrl?: string;
}

export interface AppDataForMigration {
  services: Service[];
  gallery: GalleryItem[];
  aboutContent: AboutContent;
  siteSettings: SiteSettings;
  categories: CategoryItem[];
  reviews: Review[];
}

export interface DatabaseUpdateCallbacks {
  onUpdateService?: (service: Service) => void;
  onUpdateGalleryItem?: (item: GalleryItem) => void;
  onUpdateAboutContent?: (about: AboutContent) => void;
  onUpdateSiteSettings?: (settings: SiteSettings) => void;
  onUpdateCategory?: (cat: CategoryItem) => void;
  onUpdateReview?: (review: Review) => void;
}

/**
  Checks if a URL points to Cloudinary.
 */
export function isCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  const lower = url.toLowerCase();
  return lower.includes('cloudinary.com') || lower.includes('res.cloudinary.com');
}

/**
 * Scans all data stores and compiles a list of discovered image URLs.
 */
export function discoverAllImages(data: AppDataForMigration): DiscoveredImage[] {
  const images: DiscoveredImage[] = [];

  // 1. Services
  (data.services || []).forEach((srv) => {
    if (srv && srv.imageUrl && typeof srv.imageUrl === 'string' && srv.imageUrl.trim()) {
      const isCloud = isCloudinaryUrl(srv.imageUrl);
      images.push({
        id: `service-${srv.id}`,
        sourceType: 'service',
        sourceLabel: `الخدمات: ${srv.arabicTitle || srv.title}`,
        targetId: srv.id,
        fieldKey: 'imageUrl',
        originalUrl: srv.imageUrl,
        currentUrl: srv.imageUrl,
        isCloudinary: isCloud,
        status: isCloud ? 'already_migrated' : 'pending',
        newSecureUrl: isCloud ? srv.imageUrl : undefined,
      });
    }
  });

  // 2. Gallery
  (data.gallery || []).forEach((item) => {
    if (item && item.url && typeof item.url === 'string' && item.url.trim()) {
      const isCloud = isCloudinaryUrl(item.url);
      images.push({
        id: `gallery-${item.id}`,
        sourceType: 'gallery',
        sourceLabel: `معرض الصور: ${item.arabicTitle || item.title}`,
        targetId: item.id,
        fieldKey: 'url',
        originalUrl: item.url,
        currentUrl: item.url,
        isCloudinary: isCloud,
        status: isCloud ? 'already_migrated' : 'pending',
        newSecureUrl: isCloud ? item.url : undefined,
      });
    }
  });

  // 3. About Content
  if (data.aboutContent) {
    const abt = data.aboutContent as any;
    if (abt.mainImageUrl && typeof abt.mainImageUrl === 'string' && abt.mainImageUrl.trim()) {
      const isCloud = isCloudinaryUrl(abt.mainImageUrl);
      images.push({
        id: 'about-mainImageUrl',
        sourceType: 'about',
        sourceLabel: 'قسم عن الصالون: الصورة الرئيسية',
        targetId: 'about_content',
        fieldKey: 'mainImageUrl',
        originalUrl: abt.mainImageUrl,
        currentUrl: abt.mainImageUrl,
        isCloudinary: isCloud,
        status: isCloud ? 'already_migrated' : 'pending',
        newSecureUrl: isCloud ? abt.mainImageUrl : undefined,
      });
    }
    if (abt.secondaryImageUrl && typeof abt.secondaryImageUrl === 'string' && abt.secondaryImageUrl.trim()) {
      const isCloud = isCloudinaryUrl(abt.secondaryImageUrl);
      images.push({
        id: 'about-secondaryImageUrl',
        sourceType: 'about',
        sourceLabel: 'قسم عن الصالون: الصورة الفرعية',
        targetId: 'about_content',
        fieldKey: 'secondaryImageUrl',
        originalUrl: abt.secondaryImageUrl,
        currentUrl: abt.secondaryImageUrl,
        isCloudinary: isCloud,
        status: isCloud ? 'already_migrated' : 'pending',
        newSecureUrl: isCloud ? abt.secondaryImageUrl : undefined,
      });
    }
  }

  // 4. Site Settings
  if (data.siteSettings) {
    const stg = data.siteSettings as any;
    ['heroImageUrl', 'logoUrl', 'bannerImageUrl'].forEach((key) => {
      if (stg[key] && typeof stg[key] === 'string' && stg[key].trim()) {
        const url = stg[key];
        const isCloud = isCloudinaryUrl(url);
        images.push({
          id: `siteSettings-${key}`,
          sourceType: 'site_settings',
          sourceLabel: `إعدادات الموقع: ${key}`,
          targetId: 'site_settings',
          fieldKey: key,
          originalUrl: url,
          currentUrl: url,
          isCloudinary: isCloud,
          status: isCloud ? 'already_migrated' : 'pending',
          newSecureUrl: isCloud ? url : undefined,
        });
      }
    });
  }

  // 5. Categories (if any imageUrl / iconUrl)
  (data.categories || []).forEach((cat: any) => {
    if (cat && cat.imageUrl && typeof cat.imageUrl === 'string' && cat.imageUrl.trim()) {
      const isCloud = isCloudinaryUrl(cat.imageUrl);
      images.push({
        id: `category-${cat.id}`,
        sourceType: 'category',
        sourceLabel: `تصنيفات الخدمات: ${cat.arabicLabel || cat.label}`,
        targetId: cat.id,
        fieldKey: 'imageUrl',
        originalUrl: cat.imageUrl,
        currentUrl: cat.imageUrl,
        isCloudinary: isCloud,
        status: isCloud ? 'already_migrated' : 'pending',
        newSecureUrl: isCloud ? cat.imageUrl : undefined,
      });
    }
  });

  // 6. Reviews (if any avatarUrl / photoUrl)
  (data.reviews || []).forEach((rev: any) => {
    if (rev && rev.avatarUrl && typeof rev.avatarUrl === 'string' && rev.avatarUrl.trim()) {
      const isCloud = isCloudinaryUrl(rev.avatarUrl);
      images.push({
        id: `review-${rev.id}`,
        sourceType: 'review',
        sourceLabel: `تقييمات العملاء: ${rev.name}`,
        targetId: rev.id,
        fieldKey: 'avatarUrl',
        originalUrl: rev.avatarUrl,
        currentUrl: rev.avatarUrl,
        isCloudinary: isCloud,
        status: isCloud ? 'already_migrated' : 'pending',
        newSecureUrl: isCloud ? rev.avatarUrl : undefined,
      });
    }
  });

  return images;
}

/**
 * Downloads an image from any remote URL or Data URI and converts it to a Blob.
 */
export async function downloadImageAsBlob(url: string): Promise<Blob> {
  if (!url || typeof url !== 'string' || !url.trim()) {
    throw new Error('رابط الصورة فارغ وغير صالح للتحميل');
  }

  // If Data URI
  if (url.startsWith('data:')) {
    const res = await fetch(url);
    return await res.blob();
  }

  // Attempt 1: Standard fetch with cors
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      if (blob && blob.size > 0) return blob;
    }
  } catch {}

  // Attempt 2: HTML Image + Canvas with clean URL first
  const tryLoadImage = (srcUrl: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = srcUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('تعذر إعداد Canvas لتحويل الصورة'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size > 0) {
                resolve(blob);
              } else {
                reject(new Error('فشل استخراج ملف الصورة Blob من Canvas'));
              }
            },
            'image/jpeg',
            0.92
          );
        } catch (err: any) {
          reject(
            new Error(
              `تقييدات حماية المتصفح (CORS) منعت قراءة الصورة الأصلية (${err?.message || 'Tainted Canvas'})`
            )
          );
        }
      };

      img.onerror = () => {
        reject(new Error('فشل تحميل الصورة المصدرية من سيرفرها الأصلي (أو انقطاع الاتصال)'));
      };
    });
  };

  try {
    return await tryLoadImage(url);
  } catch {
    // Attempt with timestamp cache-buster if initial clean load failed
    const cacheBuster = url.includes('?') ? `&_cb=${Date.now()}` : `?_cb=${Date.now()}`;
    return await tryLoadImage(`${url}${cacheBuster}`);
  }
}

/**
 * Migrates a single discovered image to Cloudinary and returns the new secure_url.
 */
export async function migrateSingleImage(
  item: DiscoveredImage,
  onProgress?: (percent: number) => void
): Promise<string> {
  // Check if already Cloudinary
  if (isCloudinaryUrl(item.currentUrl)) {
    return item.currentUrl;
  }

  // Attempt 1: Upload directly via URL string (Cloudinary fetches it server-side, bypassing CORS)
  try {
    const secureUrl = await uploadImageToCloudinary(item.currentUrl, onProgress);
    if (secureUrl && isCloudinaryUrl(secureUrl)) {
      return secureUrl;
    }
  } catch (err) {
    console.warn(`Direct URL upload failed for ${item.currentUrl}, trying blob download fallback...`, err);
  }

  // Attempt 2: Fallback to downloading image blob locally and uploading blob
  const blob = await downloadImageAsBlob(item.currentUrl);
  const secureUrl = await uploadImageToCloudinary(blob, onProgress);

  return secureUrl;
}

/**
 * Persists the updated Cloudinary secure_url into Firestore database & local state.
 */
export async function persistMigratedUrl(
  imageItem: DiscoveredImage,
  newSecureUrl: string,
  data: AppDataForMigration,
  callbacks?: DatabaseUpdateCallbacks
): Promise<void> {
  if (imageItem.sourceType === 'service') {
    const updatedServices = (data.services || []).map((srv) => {
      if (srv.id === imageItem.targetId) {
        const updated = { ...srv, imageUrl: newSecureUrl };
        if (callbacks?.onUpdateService) callbacks.onUpdateService(updated);
        return updated;
      }
      return srv;
    });
    await saveDocArray('services', updatedServices);
  } else if (imageItem.sourceType === 'gallery') {
    const updatedGallery = (data.gallery || []).map((gal) => {
      if (gal.id === imageItem.targetId) {
        const updated = { ...gal, url: newSecureUrl };
        if (callbacks?.onUpdateGalleryItem) callbacks.onUpdateGalleryItem(updated);
        return updated;
      }
      return gal;
    });
    await saveDocArray('gallery', updatedGallery);
  } else if (imageItem.sourceType === 'about') {
    const updatedAbout = {
      ...data.aboutContent,
      [imageItem.fieldKey]: newSecureUrl,
    };
    if (callbacks?.onUpdateAboutContent) callbacks.onUpdateAboutContent(updatedAbout);
    await saveDoc('about_content', updatedAbout);
  } else if (imageItem.sourceType === 'site_settings') {
    const updatedSite = {
      ...data.siteSettings,
      [imageItem.fieldKey]: newSecureUrl,
    };
    if (callbacks?.onUpdateSiteSettings) callbacks.onUpdateSiteSettings(updatedSite);
    await saveDoc('site_settings', updatedSite);
  } else if (imageItem.sourceType === 'category') {
    const updatedCategories = (data.categories || []).map((cat: any) => {
      if (cat.id === imageItem.targetId) {
        const updated = { ...cat, imageUrl: newSecureUrl };
        if (callbacks?.onUpdateCategory) callbacks.onUpdateCategory(updated);
        return updated;
      }
      return cat;
    });
    await saveDocArray('categories', updatedCategories);
  } else if (imageItem.sourceType === 'review') {
    const updatedReviews = (data.reviews || []).map((rev: any) => {
      if (rev.id === imageItem.targetId) {
        const updated = { ...rev, avatarUrl: newSecureUrl };
        if (callbacks?.onUpdateReview) callbacks.onUpdateReview(updated);
        return updated;
      }
      return rev;
    });
    await saveDocArray('reviews', updatedReviews);
  }
}
