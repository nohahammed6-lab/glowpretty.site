import { CategoryItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/mockData';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'categories';

/**
 * Real-time listener for service categories from Firestore
 */
export function subscribeCategories(onData: (items: CategoryItem[]) => void): () => void {
  return subscribeToDocArray<CategoryItem>(
    DOC_KEY,
    (items) => {
      onData(items || []);
    },
    INITIAL_CATEGORIES
  );
}

/**
 * Save categories array (Only called upon explicit user confirmation)
 */
export async function saveCategories(items: CategoryItem[]): Promise<void> {
  await saveDocArray<CategoryItem>(DOC_KEY, items);
}
