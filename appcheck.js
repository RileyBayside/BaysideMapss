<!-- appcheck.js -->
<script>
// Firebase App Check (reCAPTCHA v3)
// - Keep this file AFTER firebase-init.js and AFTER the App Check SDK.
// - DEV ONLY: the debug token line prints once to your console so you can
//   register it in Firebase Console → App Check → Web app → Debug tokens.

(function () {
  if (!window.firebase || !firebase.app) {
    console.error('[AppCheck] Firebase not initialized before appcheck.js');
    return;
  }

  // Dev-only helper (remove for production if you prefer)
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;

  const SITE_KEY = '6LfDGeIrAAAAAH8bc8-SZHLy1fNZNI6bvyoRO7LL'; // your site key
  try {
    firebase.appCheck().activate(SITE_KEY, true); // autoRefresh = true
    console.log('[AppCheck] reCAPTCHA v3 activated');
  } catch (e) {
    console.error('[AppCheck] activation error:', e);
  }
})();
</script>
