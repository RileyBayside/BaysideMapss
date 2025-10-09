// firebase-init.js  (ES module)
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";

// ⬇️ Put your real config here (from Firebase Console → Project settings)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
