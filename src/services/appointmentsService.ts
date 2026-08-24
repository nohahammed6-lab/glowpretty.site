import { Appointment } from '../types';
import { subscribeToDocArray, saveDocArray } from '../lib/firebase';

const DOC_KEY = 'appointments';

/**
 * Real-time listener for client appointments from Firestore
 */
export function subscribeAppointments(onData: (items: Appointment[]) => void): () => void {
  return subscribeToDocArray<Appointment>(
    DOC_KEY,
    (items) => {
      const validItems = (items || [])
        .filter((item) => Boolean(item && (item.clientName || item.serviceName)))
        .map((item, idx) => ({
          ...item,
          id: item.id || `apt-fixed-${idx}`,
        }));
      onData(validItems);
    },
    []
  );
}

/**
 * Save appointments array (Only called upon explicit user action)
 */
export async function saveAppointments(items: Appointment[]): Promise<void> {
  await saveDocArray<Appointment>(DOC_KEY, items);
}
