
(function () {
  const AUTH_KEY = "bayside.auth";                // { name, exp }
  const REDIRECT_KEY = "bayside.postLoginRedirect";

  const hoursToMs = (h) => h * 3600 * 1000;

  function readAuth() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj !== "object") return null;
      if (!obj.exp || Date.now() > +obj.exp) return null; // expired
      if (!obj.name || typeof obj.name !== "string") return null;
      return obj;
    } catch (e) {
      return null;
    }
  }

  function writeAuth(obj) {
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(obj));
    } catch (e) {
      // storage full / blocked — ignore
    }
  }

  function clearAuth() {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  window.BaysideAuth = {
    /** Set the authenticated user + expiry (stores operator name). */
    setAuth({ name, ttlHours = 12 }) {
      const exp = Date.now() + hoursToMs(ttlHours);
      writeAuth({ name: (name || "").trim(), exp });
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
      clearAuth();
      try { sessionStorage.removeItem(REDIRECT_KEY); } catch (e) {}
    },

    /** If not authed, remember the current URL and send to login.html (with ?next=…) */
    enforceGate() {
      if (this.isAuthed()) return;
      try { sessionStorage.setItem(REDIRECT_KEY, window.location.href); } catch (e) {}
      const loginUrl = new URL("login.html", window.location.href);
      loginUrl.searchParams.set("next", window.location.href);
      window.location.replace(loginUrl.toString());
    },

    /** After login, decide where to go. */
    nextUrlAfterLogin(defaultPath = "ParksMowing.html") {
      const uParam = new URLSearchParams(window.location.search).get("next");
      let sParam = null;
      try { sParam = sessionStorage.getItem(REDIRECT_KEY); } catch (e) {}
      const target = uParam || sParam || defaultPath;
      try { sessionStorage.removeItem(REDIRECT_KEY); } catch (e) {}
      return target;
    }
  };
})();
