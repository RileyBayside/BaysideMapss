// firebase-init.js
// Make sure ALL your Firebase CDN imports across the site use the SAME version (10.12.3 below).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";

// ⬇️ REPLACE these values with your project’s config from Firebase Console → Project settings → General.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Export a single initialized app for the whole site to share.
export const app = initializeApp(firebaseConfig);

// (Optional) If you plan to use Analytics on web-only hosting:
// import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
// (async () => { if (await isSupported()) getAnalytics(app); })();
