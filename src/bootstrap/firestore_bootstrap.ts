import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { Env } from "../domain/types/type";

let firestore: Firestore | null = null;

export function getFirestoreInstance(env: Env): Firestore {
    if (firestore) return firestore;
    const firebaseConfig = {
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        projectId: env.FIREBASE_PROJECT_ID,
    };
    let app: FirebaseApp;
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        const existingApp = getApps()[0];
        if (!existingApp) {
            throw new Error("No Firebase app instance found.");
        }
        app = existingApp;
    }
    firestore = getFirestore(app);
    return firestore;
}
