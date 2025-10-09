// firebase-init.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Export a single app instance (safe to import on multiple pages)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
