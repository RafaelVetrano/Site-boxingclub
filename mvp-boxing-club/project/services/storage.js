// services/storage.js — localStorage facade (swap with real API later)
(function () {
  const PREFIX = 'bc_';
  const KEYS = {
    users:    PREFIX + 'users',
    session:  PREFIX + 'session',
    adminSession: PREFIX + 'admin_session',
    cart:     PREFIX + 'cart',
    orders:   PREFIX + 'orders',
    plans:    PREFIX + 'plans',         // user_id -> plan obj
    schedule: PREFIX + 'schedule',
    products: PREFIX + 'products',
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    // notify listeners across contexts
    window.dispatchEvent(new CustomEvent('bc:storage', { detail: { key } }));
  }
  function remove(key) {
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('bc:storage', { detail: { key } }));
  }

  function uid(prefix = 'id') {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // simple async hash (sha-256)
  async function hashPassword(pwd) {
    const enc = new TextEncoder().encode(pwd);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // tiny artificial latency so loading states feel real
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  window.BC_Storage = { KEYS, read, write, remove, uid, hashPassword, delay };
})();
