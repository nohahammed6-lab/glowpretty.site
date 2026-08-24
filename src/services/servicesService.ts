import { Service } from '../types';
import { INITIAL_SERVICES } from '../data/mockData';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'services';

/**
 * Real-time listener for salon services and pricing from Firestore
 */
export function subscribeServices(onData: (items: Service[]) => void): () => void {
  return subscribeToDocArray<Service>(
    DOC_KEY,
    (items) => {
      const valid = (items || []).filter((s) => s && (s.title || s.arabicTitle));
      onData(valid.length > 0 ? valid : items);
    },
    INITIAL_SERVICES
  );
}

/**
 * Save services array (Only called upon explicit user confirmation)
 */
export async function saveServices(items: Service[]): Promise<void> {
  await saveDocArray<Service>(DOC_KEY, items);
}
