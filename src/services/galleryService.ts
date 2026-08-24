import { GalleryItem } from '../types';
import { INITIAL_GALLERY } from '../data/mockData';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'gallery';

/**
 * Real-time listener for salon gallery photos from Firestore
 */
export function subscribeGallery(onData: (items: GalleryItem[]) => void): () => void {
  return subscribeToDocArray<GalleryItem>(
    DOC_KEY,
    (items) => {
      // Clean and return real gallery items
      const validItems = (items || []).filter((g) => g && typeof g === 'object' && g.url);
      onData(validItems);
    },
    INITIAL_GALLERY
  );
}

/**
 * Save gallery items (Only called upon explicit user confirmation)
 */
export async function saveGallery(items: GalleryItem[]): Promise<void> {
  await saveDocArray<GalleryItem>(DOC_KEY, items);
}
