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

  getHiddenCategories() {
    return this.get('hidden-categories', []);
  },

  saveHiddenCategories(cats) {
    this.set('hidden-categories', cats);
  },

  getClickCounts() {
    return this.get('click-counts', {});
  },

  saveClickCounts(counts) {
    this.set('click-counts', counts);
  },

  recordClick(linkId) {
    const counts = this.getClickCounts();
    counts[linkId] = (counts[linkId] || 0) + 1;
    this.saveClickCounts(counts);
  },

  exportData() {
    return {
      customLinks: this.getCustomLinks(),
      hiddenCategories: this.getHiddenCategories(),
      theme: localStorage.getItem('navi-theme') || 'light',
      exportedAt: new Date().toISOString()
    };
  },

  importData(data) {
    if (data.customLinks) this.saveCustomLinks(data.customLinks);
    if (data.hiddenCategories) this.saveHiddenCategories(data.hiddenCategories);
    if (data.theme) Theme.set(data.theme);
  }
};
