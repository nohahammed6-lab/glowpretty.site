import { Review } from '../types';
import { INITIAL_REVIEWS } from '../data/mockData';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'reviews';

/**
 * Real-time listener for client reviews from Firestore
 */
export function subscribeReviews(onData: (items: Review[]) => void): () => void {
  return subscribeToDocArray<Review>(
    DOC_KEY,
    (items) => {
      onData(items || []);
    },
    INITIAL_REVIEWS
  );
}

/**
 * Save reviews array (Only called upon explicit user action)
 */
export async function saveReviews(items: Review[]): Promise<void> {
  await saveDocArray<Review>(DOC_KEY, items);
}
