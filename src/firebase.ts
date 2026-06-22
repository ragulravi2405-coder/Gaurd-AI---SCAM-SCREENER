import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDF6TbtIXcJuj97FhfkOq-vq5GeJBMbUYM",
  authDomain: "baviclipmart.firebaseapp.com",
  databaseURL: "https://baviclipmart-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "baviclipmart",
  storageBucket: "baviclipmart.firebasestorage.app",
  messagingSenderId: "508973564396",
  appId: "1:508973564396:web:21b1ad184e2efe658b40c9",
  measurementId: "G-734L62ECZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Analytics safely inside a try/catch since it might refuse to load in cross-origin iframes
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics blocked or failed to initialize in iframe environment:", e);
}

export { app, analytics };
