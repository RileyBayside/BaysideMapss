(function (global) {
  const AUTH_KEY = 'bs_auth';

  function setAuth(ttlHours) {
    const exp = Date.now() + (ttlHours || 12) * 3600 * 1000;
    const payload = { exp };
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(payload)); } catch (e) {}
  }

  function isAuthed() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.exp) return false;
      if (Date.now() > data.exp) {
        localStorage.removeItem(AUTH_KEY);
        return false;
      }
      return true;
    } catch (e) { return false; }
  }

  function clearAuth() { try { localStorage.removeItem(AUTH_KEY); } catch (e) {} }

  function enforceGate() {
    if (isAuthed()) return;
    const path = window.location.pathname || '';
    const atLogin = /(^|\/)login\.html$/.test(path);
    if (!atLogin) {
      const next = encodeURIComponent(window.location.href);
      window.location.replace('login.html?next=' + next);
    }
  }

  global.BaysideAuth = { setAuth, isAuthed, clearAuth, enforceGate };
})(window);