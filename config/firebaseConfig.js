import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";

// .env की वैल्यू से फ़ालतू स्पेस और कोट्स हटाता है (सबसे आम गलती)
const clean = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");

const firebaseConfig = {
  apiKey: clean(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: clean(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: clean(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: clean(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  ),
  appId: clean(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
};

if (__DEV__) {
  console.log("Firebase config diagnostic:", {
    apiKeyLength: firebaseConfig.apiKey.length, // 39 होनी चाहिए
    apiKeyStartsWithAIza: firebaseConfig.apiKey.startsWith("AIza"), // true होना चाहिए
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });
}
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId,
);

let app = null;
let auth = null;
let db = null;

/**
 * Auth ek hi baar banta hai. Fast Refresh / reload par initializeAuth dobara
 * chalne se "auth/already-initialized" aata hai, to us case mein purana
 * instance (getAuth) wapas de dete hain.
 */
const createAuth = (firebaseApp) => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    if (error?.code === "auth/already-initialized") {
      return getAuth(firebaseApp);
    }
    throw error;
  }
};

if (!isFirebaseConfigured) {
  // Kaun si key missing hai, ye saaf dikhe
  const missing = Object.entries({
    EXPO_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
    EXPO_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  console.warn(
    "Firebase config missing: " +
      missing.join(", ") +
      ". .env file check karein aur `npx expo start -c` se restart karein.",
  );
} else {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = createAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("FIREBASE INIT ERROR:", error);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db };

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
