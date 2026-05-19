const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`navi-${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`navi-${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(`navi-${key}`);
  },

  getCustomLinks() {
    return this.get('custom-links', []);
  },

  saveCustomLinks(links) {
    this.set('custom-links', links);
  },

  exportData() {
    return {
      customLinks: this.getCustomLinks(),
      theme: localStorage.getItem('navi-theme') || 'light',
      exportedAt: new Date().toISOString()
    };
  },

  importData(data) {
    if (data.customLinks) this.saveCustomLinks(data.customLinks);
    if (data.theme) Theme.set(data.theme);
  }
};
