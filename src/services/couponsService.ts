import { Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/mockData';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'coupons';

/**
 * Real-time listener for salon discount coupons from Firestore
 */
export function subscribeCoupons(onData: (items: Coupon[]) => void): () => void {
  return subscribeToDocArray<Coupon>(
    DOC_KEY,
    (items) => {
      onData(items || []);
    },
    INITIAL_COUPONS
  );
}

/**
 * Save coupons array (Only called upon explicit user action)
 */
export async function saveCoupons(items: Coupon[]): Promise<void> {
  await saveDocArray<Coupon>(DOC_KEY, items);
}
