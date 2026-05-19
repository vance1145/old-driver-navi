const Sidebar = {
  render() {
    return `
      <div class="drawer-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <rect x="2" y="12" width="28" height="12" rx="3" fill="currentColor" opacity="0.15"/>
          <rect x="9" y="7" width="14" height="7" rx="2" fill="currentColor" opacity="0.3"/>
          <circle cx="9" cy="24" r="4.5" fill="#333"/>
          <circle cx="9" cy="24" r="2.5" fill="#fff"/>
          <circle cx="23" cy="24" r="4.5" fill="#333"/>
          <circle cx="23" cy="24" r="2.5" fill="#fff"/>
        </svg>
        老司机导航
      </div>
      <div class="drawer-nav" id="drawerNav">
        ${NAV_DATA.categories.map((cat, i) => `
          <div class="drawer-item${i === 0 ? ' active' : ''}" data-target="${cat.id}">
            <span class="drawer-item-icon">${cat.icon}</span>
            ${cat.name}
          </div>
        `).join('')}
      </div>
    `;
  },

  init() {
    const drawerNav = document.getElementById('drawerNav');
    drawerNav.addEventListener('click', (e) => {
      const item = e.target.closest('.drawer-item');
      if (!item) return;
      document.querySelectorAll('.drawer-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      this.close();
      const target = document.getElementById(`category-${item.dataset.target}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.borderColor = 'var(--accent)';
        setTimeout(() => { target.style.borderColor = ''; }, 1500);
      }
    });

    const overlay = document.getElementById('drawerOverlay');
    overlay.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  open() {
    document.getElementById('drawerOverlay').classList.add('show');
    document.getElementById('drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('drawerOverlay').classList.remove('show');
    document.getElementById('drawer').classList.remove('open');
    document.body.style.overflow = '';
  },

  toggle() {
    if (document.getElementById('drawer').classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  },

  initMobile() {
    this.init();
  }
};
