// Simple client-side gate for GitHub Pages (PIN-based)
(function(){
  const AUTH_KEY = "bs_auth_v1";
  const PIN = "2455"; // <-- site PIN
  function setAuthed() { try { sessionStorage.setItem(AUTH_KEY, "1"); } catch(e) {} }
  function isAuthed() { try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch(e) { return false; } }
  function requireAuth() {
    if (isAuthed()) return;
    var here = window.location.pathname + window.location.search + window.location.hash;
    var loginURL = "login.html?next=" + encodeURIComponent(here);
    if (!/login\.html/i.test(window.location.pathname)) {
      window.location.replace(loginURL);
    }
  }
  // Expose for login page
  window.__auth = { requireAuth, setAuthed, isAuthed, PIN };
  // Auto-enforce on pages that include this script (login.html will skip by design)
  if (!/login\.html/i.test(window.location.pathname)) {
    requireAuth();
  }
})();