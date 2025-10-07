(function () {
  const AUTH_KEY = "bayside.auth";                // { name, exp }
  const LEGACY_NAME_KEYS = ["operator", "user", "username"]; // read-only fallbacks
  const REDIRECT_KEY = "bayside.postLoginRedirect";
  const hoursToMs = (h) => h * 3600 * 1000;

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  }
  function writeJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
  }
  function readAuth() {
    // main record
    const rec = readJSON(AUTH_KEY);
    if (rec && rec.exp && rec.name && Date.now() < +rec.exp) return rec;

    // legacy: if an old operator key exists, upgrade it on the fly with a short TTL
    for (const k of LEGACY_NAME_KEYS) {
      const v = localStorage.getItem(k);
      if (v && v.trim()) {
        const name = v.trim();
        const exp = Date.now() + hoursToMs(12);
        const upgraded = { name, exp };
        writeJSON(AUTH_KEY, upgraded);
        return upgraded;
      }
    }
    return null;
  }
  function clearAuthOnly() {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  }

  window.BaysideAuth = {
    /** Set the authenticated user + expiry (stores operator name). */
    setAuth({ name, ttlHours = 12 }) {
      const exp = Date.now() + hoursToMs(ttlHours);
      writeJSON(AUTH_KEY, { name: (name || "").trim(), exp });
    },

    /** Returns truthy if a valid (non-expired) auth is present. */
    isAuthed() {
      return !!readAuth();
    },

    /** Returns the operator/user name, or null. */
    getUserName() {
      const a = readAuth();
      return a ? a.name : null;
    },

    /** Clears auth token and any cached redirect. */
    clear() {
      clearAuthOnly();
      try { sessionStorage.removeItem(REDIRECT_KEY); } catch {}
    },

    /** If not authed, remember current URL and send to login.html with ?next=… */
    enforceGate() {
      if (this.isAuthed()) return;
      try { sessionStorage.setItem(REDIRECT_KEY, window.location.href); } catch {}
      const loginUrl = new URL("login.html", window.location.href);
      loginUrl.searchParams.set("next", window.location.href);
      window.location.replace(loginUrl.toString());
    },

    /** After login, decide where to go. */
    nextUrlAfterLogin(defaultPath = "ParksMowing.html") {
      const uParam = new URLSearchParams(window.location.search).get("next");
      let sParam = null;
      try { sParam = sessionStorage.getItem(REDIRECT_KEY); } catch {}
      const target = uParam || sParam || defaultPath;
      try { sessionStorage.removeItem(REDIRECT_KEY); } catch {}
      return target;
    }
  };
})();
    }
  };
})();
