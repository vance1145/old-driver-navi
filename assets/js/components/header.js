const SEARCH_ENGINES = [
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q=' },
  { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=' },
  { id: 'bilibili', name: 'B站', url: 'https://search.bilibili.com/all?keyword=' },
  { id: 'weibo', name: '微博', url: 'https://s.weibo.com/weibo?q=' },
];

let currentEngine = SEARCH_ENGINES[0];

const Header = {
  render() {
    return `
      <header class="header">
        <div class="header-inner">
          <button class="mobile-sidebar-toggle" id="mobileSidebarToggle" aria-label="打开菜单">☰</button>
          <div class="search-area">
            <div class="engine-select" id="engineSelect">
              ${SEARCH_ENGINES.map(eng => `
                <button class="engine-btn${eng.id === currentEngine.id ? ' active' : ''}" data-engine="${eng.id}">${eng.name}</button>
              `).join('')}
            </div>
            <div class="search-box">
              <input class="search-input" id="searchInput" type="text" placeholder="搜索站点或输入关键词搜索全网..." autocomplete="off">
              <button class="search-btn" id="searchBtn">搜索</button>
            </div>
          </div>
          <div class="header-actions">
            <div class="clock-widget" id="clockWidget">
              <div class="clock-time" id="clockTime">00:00</div>
              <div class="clock-date" id="clockDate">----年--月--日</div>
            </div>
            <button class="theme-toggle" id="themeToggle" aria-label="切换主题">🌙</button>
          </div>
        </div>
      </header>
    `;
  },

  init() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      Theme.toggle();
      this.updateThemeIcon();
    });
    this.updateThemeIcon();

    document.getElementById('engineSelect').addEventListener('click', (e) => {
      const btn = e.target.closest('.engine-btn');
      if (!btn) return;
      document.querySelectorAll('.engine-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEngine = SEARCH_ENGINES.find(eng => eng.id === btn.dataset.engine) || SEARCH_ENGINES[0];
      document.getElementById('searchInput').focus();
    });

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const doSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;
      if (query.startsWith('/')) {
        App.searchLinks(query.slice(1));
        return;
      }
      window.open(currentEngine.url + encodeURIComponent(query), '_blank');
    };

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    searchInput.addEventListener('input', () => {
      App.searchLinks(searchInput.value);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          searchInput.focus();
        }
      }
      if (e.key === 'Escape') {
        searchInput.blur();
        App.clearSearch();
      }
    });
  },

  updateThemeIcon() {
    const toggle = document.getElementById('themeToggle');
    toggle.textContent = Theme.getCurrent() === 'dark' ? '☀️' : '🌙';
  }
};
