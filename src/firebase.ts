// firebase.ts — optional Firestore helper. Uses Vite env variables prefixed with VITE_
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function initFirebase() {
  // Use Vite env variables. If not present, do nothing.
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    return null;
  }

  if (!getApps().length) {
    app = initializeApp({
      apiKey,
      authDomain,
      projectId,
    } as any);
    db = getFirestore(app);
  }

  return db;
}

export async function saveLogToFirestore(collectionName: string, data: any) {
  try {
    if (!db) initFirebase();
    if (!db) throw new Error('Firestore not initialized (missing VITE_FIREBASE_* env vars)');
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, { ...data, created_at: serverTimestamp() });
    return { id: docRef.id };
  } catch (e) {
    console.error('saveLogToFirestore error', e);
    throw e;
  }
}
