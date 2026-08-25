import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUsg6_6p3OI07o20yaJZgslaWiiU9Vpmc",
  authDomain: "rushgal-9074c.firebaseapp.com",
  projectId: "rushgal-9074c",
  storageBucket: "rushgal-9074c.firebasestorage.app",
  messagingSenderId: "342291762190",
  appId: "1:342291762190:web:9d1bdea88c41bc589d005f",
  measurementId: "G-K7KBRMS2Q1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics is optional and may be unavailable in some browsers/privacy modes.
export const analyticsPromise = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);
