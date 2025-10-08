// appcheck.js  (pure JS only)

self.FIREBASE_APPCHECK_DEBUG_TOKEN = true; // dev only

const APPCHECK_SITE_KEY = '6LfDGeIrAAAAAH8bc8-SZHLy1fNZNI6bvyoRO7LL';

function activateAppCheck() {
  try {
    if (!window.firebase || !firebase.app) {
      console.error('[AppCheck] Firebase not initialized before appcheck.js');
      return;
    }
    firebase.appCheck().activate(APPCHECK_SITE_KEY, true); // autoRefresh
    console.log('[AppCheck] reCAPTCHA v3 activated');
  } catch (e) {
    console.error('[AppCheck] activation error:', e);
  }
}

// Wait for full page load (avoids appendChild race in reCAPTCHA init)
window.addEventListener('load', activateAppCheck);
