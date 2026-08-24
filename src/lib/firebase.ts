import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore DB using the specific databaseId if present
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || undefined
);

// Validate connection to Firestore on initial boot as per best practices
if (typeof window !== 'undefined') {
  getDocFromServer(doc(db, 'app_data', 'site_settings'))
    .then(() => {
      console.log('⚡ Firestore connection successfully established.');
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('the client is offline')) {
        console.warn('Firestore is running in offline mode.');
      }
    });
}

// In-Memory Multi-Layer Cache for instantaneous cross-component and in-app browser state
const memoryCache = new Map<string, string>();

// Broadcast Channel for 0ms cross-tab and cross-window sync
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel('glow_pretty_realtime_sync');
  }
} catch {}

export function getStoredJson(docId: string): string {
  if (memoryCache.has(docId)) {
    return memoryCache.get(docId)!;
  }
  try {
    const session = sessionStorage.getItem(`glow_${docId}`);
    if (session) {
      memoryCache.set(docId, session);
      return session;
    }
  } catch {}
  try {
    const local = localStorage.getItem(`glow_${docId}`);
    if (local) {
      memoryCache.set(docId, local);
      return local;
    }
  } catch {}
  return '';
}

export function persistJson(docId: string, json: string) {
  memoryCache.set(docId, json);
  try {
    sessionStorage.setItem(`glow_${docId}`, json);
  } catch {}
  try {
    localStorage.setItem(`glow_${docId}`, json);
  } catch {}
  if (syncChannel) {
    try {
      syncChannel.postMessage({ docId, json, timestamp: Date.now() });
    } catch {}
  }
}

/**
 * Checks if local device cache already exists for key salon data
 */
export function hasLocalCache(): boolean {
  try {
    const hasSrv = Boolean(localStorage.getItem('glow_services') || sessionStorage.getItem('glow_services'));
    const hasSettings = Boolean(localStorage.getItem('glow_site_settings') || sessionStorage.getItem('glow_site_settings'));
    return hasSrv || hasSettings;
  } catch {
    return false;
  }
}

export interface PreloadedData {
  services?: any[];
  categories?: any[];
  siteSettings?: any;
  appointments?: any[];
  reviews?: any[];
  gallery?: any[];
  aboutContent?: any;
  supervisors?: any[];
  coupons?: any[];
  ownerPin?: string;
}

/**
 * High-speed parallel prefetcher for all core database documents on initial app launch.
 * Ensures that on fresh devices/browsers, the latest live data is fetched immediately.
 */
export async function preloadAllDatabaseData(): Promise<PreloadedData> {
  const docIds = [
    'services',
    'categories',
    'site_settings',
    'appointments',
    'reviews',
    'gallery',
    'about_content',
    'supervisors',
    'coupons',
    'owner_pin',
  ];

  const results: PreloadedData = {};

  try {
    const fetchPromises = docIds.map(async (docId) => {
      try {
        const docRef = doc(db, 'app_data', docId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          const json = JSON.stringify(data);
          persistJson(docId, json);
          return { docId, data, success: true };
        }
      } catch (e) {
        console.warn(`Preload fetch error for ${docId}:`, e);
      }
      return { docId, data: null, success: false };
    });

    const settled = await Promise.allSettled(fetchPromises);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && res.value.success && res.value.data) {
        const { docId, data } = res.value;
        if (docId === 'services' && Array.isArray(data.items)) {
          results.services = data.items;
        } else if (docId === 'categories' && Array.isArray(data.items)) {
          results.categories = data.items;
        } else if (docId === 'site_settings') {
          results.siteSettings = data;
        } else if (docId === 'appointments' && Array.isArray(data.items)) {
          results.appointments = data.items;
        } else if (docId === 'reviews' && Array.isArray(data.items)) {
          results.reviews = data.items;
        } else if (docId === 'gallery' && Array.isArray(data.items)) {
          results.gallery = data.items;
        } else if (docId === 'about_content') {
          results.aboutContent = data;
        } else if (docId === 'supervisors' && Array.isArray(data.items)) {
          results.supervisors = data.items;
        } else if (docId === 'coupons' && Array.isArray(data.items)) {
          results.coupons = data.items;
        } else if (docId === 'owner_pin' && data.pin) {
          results.ownerPin = data.pin;
        }
      }
    });
  } catch (err) {
    console.warn('Preload batch error:', err);
  }

  return results;
}

/**
 * Real-time listener for a single document stored under `app_data/{docId}`
 * Optimized for Instagram / In-App Browsers with immediate parallel getDoc
 */
export function subscribeToDoc<T extends object>(
  docId: string,
  onData: (data: T) => void,
  fallbackData: T
) {
  const docRef = doc(db, 'app_data', docId);
  let lastJson = getStoredJson(docId);

  // Fast direct fetch over HTTP to prevent WebView WebSocket delay
  getDoc(docRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as T;
        const validData = remoteData || fallbackData;
        const newJson = JSON.stringify(validData);
        if (newJson !== lastJson) {
          lastJson = newJson;
          persistJson(docId, newJson);
          onData(validData);
        }
      }
    })
    .catch((err) => {
      console.warn(`Initial fast getDoc for ${docId}:`, err);
    });

  // Listen to BroadcastChannel for instant local cross-tab updates
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.docId === docId && event.data.json) {
      if (event.data.json !== lastJson) {
        lastJson = event.data.json;
        try {
          const parsed = JSON.parse(event.data.json);
          onData(parsed);
        } catch {}
      }
    }
  };
  if (syncChannel) {
    syncChannel.addEventListener('message', handleBroadcast);
  }

  // Real-time Firestore snapshot listener
  const unsubscribeSnapshot = onSnapshot(
    docRef,
    (snapshot: any) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as T;
        const validData = remoteData || fallbackData;
        const newJson = JSON.stringify(validData);
        persistJson(docId, newJson);
        if (newJson !== lastJson) {
          lastJson = newJson;
          onData(validData);
        }
        return;
      }

      // If document doesn't exist remotely yet, check local storage or fallback
      let localData: T | null = null;
      const stored = getStoredJson(docId);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            localData = parsed;
          }
        } catch {}
      }

      const dataToUse = localData || fallbackData;
      const cleanDataToUse = JSON.parse(JSON.stringify(dataToUse));
      setDoc(docRef, cleanDataToUse, { merge: true }).catch(console.error);
      const finalJson = JSON.stringify(dataToUse);
      persistJson(docId, finalJson);
      if (finalJson !== lastJson) {
        lastJson = finalJson;
        onData(dataToUse);
      }
    },
    (error) => {
      console.warn(`Firestore sync error for ${docId}:`, error);
      const stored = getStoredJson(docId);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && JSON.stringify(parsed) !== lastJson) {
            lastJson = JSON.stringify(parsed);
            onData(parsed);
          }
        } catch {}
      }
    }
  );

  return () => {
    unsubscribeSnapshot();
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Save / update a document stored under `app_data/{docId}`
 */
export async function saveDoc<T extends object>(docId: string, data: T) {
  const json = JSON.stringify(data);
  persistJson(docId, json);
  try {
    const docRef = doc(db, 'app_data', docId);
    const cleanData = JSON.parse(json);
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    console.error(`Failed to save ${docId} to Firestore:`, error);
  }
}

/**
 * Save array document
 */
export async function saveDocArray<T>(docId: string, items: T[]) {
  const json = JSON.stringify(items);
  persistJson(docId, json);
  try {
    const docRef = doc(db, 'app_data', docId);
    const cleanItems = JSON.parse(json);
    await setDoc(docRef, { items: cleanItems }, { merge: true });
  } catch (error) {
    console.error(`Failed to save array ${docId} to Firestore:`, error);
  }
}

/**
 * Real-time listener for an array document stored under `app_data/{docId}`
 * Optimized for Instagram / In-App Browsers with immediate parallel getDoc
 */
export function subscribeToDocArray<T>(
  docId: string,
  onData: (items: T[]) => void,
  fallbackData: T[]
) {
  const docRef = doc(db, 'app_data', docId);
  let lastJson = getStoredJson(docId);

  // Fast direct fetch over HTTP to prevent WebView WebSocket delay
  getDoc(docRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const remoteItems = (data && Array.isArray(data.items)) ? (data.items as T[]) : [];
        const newJson = JSON.stringify(remoteItems);
        if (newJson !== lastJson) {
          lastJson = newJson;
          persistJson(docId, newJson);
          onData(remoteItems);
        }
      }
    })
    .catch((err) => {
      console.warn(`Initial fast getDoc for array ${docId}:`, err);
    });

  // Listen to BroadcastChannel for instant local cross-tab updates
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.docId === docId && event.data.json) {
      if (event.data.json !== lastJson) {
        lastJson = event.data.json;
        try {
          const parsed = JSON.parse(event.data.json);
          if (Array.isArray(parsed)) {
            onData(parsed);
          }
        } catch {}
      }
    }
  };
  if (syncChannel) {
    syncChannel.addEventListener('message', handleBroadcast);
  }

  // Real-time Firestore snapshot listener
  const unsubscribeSnapshot = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const remoteItems = (data && Array.isArray(data.items)) ? (data.items as T[]) : [];
        const newJson = JSON.stringify(remoteItems);
        persistJson(docId, newJson);
        if (newJson !== lastJson) {
          lastJson = newJson;
          onData(remoteItems);
        }
        return;
      }

      let localData: T[] | null = null;
      const stored = getStoredJson(docId);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localData = parsed;
          }
        } catch {}
      }

      const dataToUse = localData !== null ? localData : fallbackData;
      const cleanDataToUse = JSON.parse(JSON.stringify(dataToUse));
      setDoc(docRef, { items: cleanDataToUse }, { merge: true }).catch(console.error);
      const finalJson = JSON.stringify(dataToUse);
      persistJson(docId, finalJson);
      if (finalJson !== lastJson) {
        lastJson = finalJson;
        onData(dataToUse);
      }
    },
    (error) => {
      console.warn(`Firestore sync error for array ${docId}:`, error);
      const stored = getStoredJson(docId);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && JSON.stringify(parsed) !== lastJson) {
            lastJson = JSON.stringify(parsed);
            onData(parsed);
          }
        } catch {}
      }
    }
  );

  return () => {
    unsubscribeSnapshot();
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBroadcast);
    }
  };
}
