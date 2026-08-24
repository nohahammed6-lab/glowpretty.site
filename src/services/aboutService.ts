import { AboutContent } from '../types';
import { INITIAL_ABOUT_CONTENT } from '../data/mockData';
import { subscribeToDoc, saveDoc } from '../lib/firebase';

const DOC_KEY = 'about_content';

/**
 * Real-time listener for salon about/story content from Firestore
 */
export function subscribeAboutContent(onData: (data: AboutContent) => void): () => void {
  return subscribeToDoc<AboutContent>(
    DOC_KEY,
    (data) => {
      onData(data || INITIAL_ABOUT_CONTENT);
    },
    INITIAL_ABOUT_CONTENT
  );
}

/**
 * Save about content (Only called upon explicit user confirmation)
 */
export async function saveAboutContent(data: AboutContent): Promise<void> {
  await saveDoc<AboutContent>(DOC_KEY, data);
}
