<script>
// auth-guard.js
(function () {
  // Pages that are allowed without being signed in
  // (keep login.html here; add 404.html if you have one)
  const PUBLIC = new Set(['login.html']);

  function currentPage() {
    const p = location.pathname.split('/').pop();
    return p || 'index.html';
  }
  function currentFullPath() {
    return location.pathname + location.search + location.hash;
  }
  function redirectToLogin() {
    // remember where the user wanted to go
    try {
      sessionStorage.setItem('bayside_next', currentFullPath());
      localStorage.setItem('bayside_next', currentFullPath());
    } catch (_) {}
    // build a login URL in the same folder with ?next=<path>
    const base = location.pathname.replace(/[^/]+$/, '');
    const url = new URL(base + 'login.html', location.origin);
    url.searchParams.set('next', currentFullPath());
    location.replace(url.toString());
  }

  // Wait for Firebase to be initialized (firebase-init.js loads before us)
  function firebaseReady() {
    return new Promise((resolve) => {
      let tries = 0;
      (function check() {
        if (window.firebase && firebase.apps && firebase.apps.length) return resolve();
        if (++tries > 200) return resolve(); // give up after ~2s but still run
        setTimeout(check, 10);
      })();
    });
  }

  firebaseReady().then(() => {
    const page = currentPage();
    const openToPublic = PUBLIC.has(page);
    const auth = firebase.auth();

    auth.onAuthStateChanged(async (user) => {
      // Not signed in → everything except PUBLIC goes to login
      if (!user) {
        if (!openToPublic) redirectToLogin();
        return;
      }

      // Already signed in and on login.html → send to next/default
      if (page === 'login.html') {
        let next = new URLSearchParams(location.search).get('next');
        try {
          next = next || sessionStorage.getItem('bayside_next') || localStorage.getItem('bayside_next');
        } catch (_) {}
        if (next && !/login\.html$/i.test(next)) {
          return location.replace(next);
        }
        // default destination if no "next"
        return location.replace('index.html');
      }
    });
  });
})();
</script>
