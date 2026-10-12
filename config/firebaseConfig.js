import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth/react-native";
import { collection, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let app;
let auth = null;
let db = null;

try {
  if (isFirebaseConfigured) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } catch (authError) {
      auth = getAuth(app);
    }

    db = getFirestore(app);
  }
} catch (error) {
  console.warn(
    "Firebase initialization failed. Check your Firebase API key and project settings.",
    error,
  );
  auth = null;
  db = null;
}

export const getUserStudentsCollection = () => {
  if (!db) {
    console.warn("Firebase Firestore is not configured.");
    return null;
  }

  if (auth?.currentUser?.uid) {
    return collection(db, "users", auth.currentUser.uid, "students");
  }

  return collection(db, "students");
};

export const getUserAttendanceCollection = (dateKey) => {
  if (!db) {
    console.warn("Firebase Firestore is not configured.");
    return null;
  }

  if (auth?.currentUser?.uid) {
    return collection(
      db,
      "users",
      auth.currentUser.uid,
      "attendance",
      dateKey,
      "records",
    );
  }

  return collection(db, "attendance", dateKey, "records");
};
