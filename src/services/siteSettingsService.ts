import { SiteSettings } from '../types';
import { INITIAL_SITE_SETTINGS } from '../data/mockData';
import { subscribeToDoc, saveDoc } from '../lib/firebase';

const DOC_KEY = 'site_settings';

/**
 * Real-time listener for salon site settings from Firestore
 */
export function subscribeSiteSettings(onData: (data: SiteSettings) => void): () => void {
  return subscribeToDoc<SiteSettings>(
    DOC_KEY,
    (data) => {
      onData(data || INITIAL_SITE_SETTINGS);
    },
    INITIAL_SITE_SETTINGS
  );
}

/**
 * Save site settings (Only called upon explicit user confirmation)
 */
export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  await saveDoc<SiteSettings>(DOC_KEY, data);
}
