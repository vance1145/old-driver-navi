const Sidebar = {
  render() {
    return `
      <div class="sidebar-logo">
        <svg class="sidebar-logo-icon" viewBox="0 0 32 32" fill="none">
          <rect x="2" y="12" width="28" height="12" rx="3" fill="currentColor" opacity="0.15"/>
          <rect x="9" y="7" width="14" height="7" rx="2" fill="currentColor" opacity="0.3"/>
          <circle cx="9" cy="24" r="4.5" fill="#333"/>
          <circle cx="9" cy="24" r="2.5" fill="#fff"/>
          <circle cx="23" cy="24" r="4.5" fill="#333"/>
          <circle cx="23" cy="24" r="2.5" fill="#fff"/>
        </svg>
        老司机导航
      </div>
      <ul class="nav-list" id="navList">
        ${NAV_DATA.categories.map((cat, i) => `
          <li class="nav-item${i === 0 ? ' active' : ''}" data-target="${cat.id}">
            <span class="nav-item-icon">${cat.icon}</span>
            ${cat.name}
          </li>
        `).join('')}
      </ul>
    `;
  },

  init() {
    const navList = document.getElementById('navList');
    navList.addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const target = document.getElementById(`category-${item.dataset.target}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.category;
          document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          const navItem = document.querySelector(`.nav-item[data-target="${id}"]`);
          if (navItem) navItem.classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -60% 0px' });

    document.querySelectorAll('.category-section').forEach(section => observer.observe(section));
  },

  renderMobile() {
    return `
      <div class="mobile-sidebar" id="mobileSidebar">
        <div class="mobile-sidebar-header">
          <div class="sidebar-logo" style="border:none;margin:0;padding:0;">
            <svg class="sidebar-logo-icon" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="12" width="28" height="12" rx="3" fill="currentColor" opacity="0.15"/>
              <rect x="9" y="7" width="14" height="7" rx="2" fill="currentColor" opacity="0.3"/>
              <circle cx="9" cy="24" r="4.5" fill="#333"/>
              <circle cx="9" cy="24" r="2.5" fill="#fff"/>
              <circle cx="23" cy="24" r="4.5" fill="#333"/>
              <circle cx="23" cy="24" r="2.5" fill="#fff"/>
            </svg>
            老司机导航
          </div>
          <button class="mobile-sidebar-close" id="mobileSidebarClose">✕</button>
        </div>
        <ul class="nav-list" id="mobileNavList">
          ${NAV_DATA.categories.map((cat, i) => `
            <li class="nav-item${i === 0 ? ' active' : ''}" data-target="${cat.id}">
              <span class="nav-item-icon">${cat.icon}</span>
              ${cat.name}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  },

  initMobile() {
    const toggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('mobileSidebar');
    const close = document.getElementById('mobileSidebarClose');
    const navList = document.getElementById('mobileNavList');

    if (toggle) toggle.addEventListener('click', () => sidebar.classList.add('show'));
    if (close) close.addEventListener('click', () => sidebar.classList.remove('show'));

    if (navList) {
      navList.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (!item) return;
        sidebar.classList.remove('show');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const target = document.getElementById(`category-${item.dataset.target}`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    sidebar.addEventListener('click', (e) => {
      if (e.target === sidebar) sidebar.classList.remove('show');
    });
  }
};
