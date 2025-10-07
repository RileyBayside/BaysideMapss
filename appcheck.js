// appcheck.js

// DEV ONLY: prints a debug token once in the console.
// Add it in Firebase Console → App Check → (your Web app) → Debug tokens → Add token.
self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

// Your reCAPTCHA v3 App Check **site key**
const APPCHECK_SITE_KEY = '6LfDGeIrAAAAAH8bc8-SZHLy1fNZNI6bvyoRO7LL';

(function () {
  try {
    if (!window.firebase || !firebase.app) {
      console.error('[AppCheck] Firebase not initialized before appcheck.js');
      return;
    }
    // Start App Check (autoRefresh = true)
    firebase.appCheck().activate(APPCHECK_SITE_KEY, true);
    console.log('[AppCheck] reCAPTCHA v3 activated');
  } catch (e) {
    console.error('[AppCheck] activation error:', e);
  }
})();
