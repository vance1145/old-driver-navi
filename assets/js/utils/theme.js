const Theme = {
  init() {
    const saved = localStorage.getItem('navi-theme');
    if (saved) {
      this.set(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.set(prefersDark ? 'dark' : 'light');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('navi-theme')) {
        this.set(e.matches ? 'dark' : 'light');
      }
    });
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('navi-theme', theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    this.set(current === 'dark' ? 'light' : 'dark');
  },

  getCurrent() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};
