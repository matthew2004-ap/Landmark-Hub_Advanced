export const db = {
  async get(k) {
    try {
      const r = await window.storage.get(k, true);
      return r ? JSON.parse(r.value) : null;
    } catch {
      return null;
    }
  },
  async set(k, v) {
    try {
      await window.storage.set(k, JSON.stringify(v), true);
      return true;
    } catch {
      return false;
    }
  },
};
