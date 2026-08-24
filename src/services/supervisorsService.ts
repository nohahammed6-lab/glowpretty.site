import { Supervisor } from '../types';
import { INITIAL_SUPERVISORS } from '../data/mockData';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'supervisors';

/**
 * Real-time listener for salon staff/supervisors from Firestore
 */
export function subscribeSupervisors(onData: (items: Supervisor[]) => void): () => void {
  return subscribeToDocArray<Supervisor>(
    DOC_KEY,
    (items) => {
      const sanitized = (items || []).filter(Boolean).map((sup, idx) => ({
        ...sup,
        id: sup.id || `sup-fixed-${idx}`,
      }));
      onData(sanitized);
    },
    INITIAL_SUPERVISORS
  );
}

/**
 * Save supervisors array (Only called upon explicit user action)
 */
export async function saveSupervisors(items: Supervisor[]): Promise<void> {
  await saveDocArray<Supervisor>(DOC_KEY, items);
}
