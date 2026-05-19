const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', favicon: 'https://icons.duckduckgo.com/ip3/www.google.com.ico' },
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q=', favicon: 'https://icons.duckduckgo.com/ip3/www.bing.com.ico' },
  { id: 'ddgs', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', favicon: 'https://icons.duckduckgo.com/ip3/duckduckgo.com.ico' },
  { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', favicon: 'https://icons.duckduckgo.com/ip3/www.youtube.com.ico' },
  { id: 'bilibili', name: 'B站', url: 'https://search.bilibili.com/all?keyword=', favicon: 'https://icons.duckduckgo.com/ip3/www.bilibili.com.ico' },
  { id: 'xhsh', name: '小红书', url: 'https://www.xiaohongshu.com/search_result?keyword=', favicon: 'https://icons.duckduckgo.com/ip3/www.xiaohongshu.com.ico' },
  { id: 'reddit', name: 'Reddit', url: 'https://www.reddit.com/search/?q=', favicon: 'https://icons.duckduckgo.com/ip3/www.reddit.com.ico' },
  { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=', favicon: 'https://icons.duckduckgo.com/ip3/www.zhihu.com.ico' },
  { id: 'twix', name: 'X', url: 'https://twitter.com/search?q=', favicon: 'https://icons.duckduckgo.com/ip3/twitter.com.ico' },
  { id: 'weibo', name: '微博', url: 'https://s.weibo.com/weibo?q=', favicon: 'https://icons.duckduckgo.com/ip3/weibo.com.ico' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=', favicon: 'https://icons.duckduckgo.com/ip3/www.baidu.com.ico' },
];

const engineById = (id) => SEARCH_ENGINES.find(e => e.id === id) || SEARCH_ENGINES[0];
let currentEngine = engineById(sessionStorage.getItem('navi-default-engine') || 'bing');

async function detectNetworkAndUpdate() {
  if (sessionStorage.getItem('navi-default-engine')) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', signal: controller.signal });
    clearTimeout(timer);
    sessionStorage.setItem('navi-default-engine', 'google');
    updateEngineUI(engineById('google'));
  } catch {
    sessionStorage.setItem('navi-default-engine', 'bing');
  }
}

function updateEngineUI(engine) {
  currentEngine = engine;
  const btn = document.getElementById('engineBtn');
  const img = btn.querySelector('.ef-icon');
  const label = btn.querySelector('.ef-label');
  img.src = engine.favicon;
  label.textContent = engine.name;
  document.querySelectorAll('.eo').forEach(el => el.classList.toggle('active', el.dataset.id === engine.id));
}

function closeDropdown() {
  document.getElementById('engineDropdown').classList.remove('open');
  document.removeEventListener('click', closeDropdownOutside);
}

function closeDropdownOutside(e) {
  if (!e.target.closest('.engine-select')) closeDropdown();
}

const Header = {
  render() {
    return `
      <header class="header">
        <div class="header-inner">
          <div style="display:flex;align-items:center;gap:2px;flex-shrink:0">
            <a class="header-logo" href="#">
              <svg viewBox="0 0 32 32" fill="none">
                <rect x="3" y="13" width="27" height="12" rx="3" fill="var(--accent)"/>
                <rect x="9" y="8" width="14" height="6" rx="2" fill="var(--accent)" opacity="0.55"/>
                <circle cx="9" cy="25" r="4.5" fill="var(--text)"/>
                <circle cx="9" cy="25" r="2.5" fill="var(--bg)"/>
                <circle cx="23" cy="25" r="4.5" fill="var(--text)"/>
                <circle cx="23" cy="25" r="2.5" fill="var(--bg)"/>
                <rect x="12" y="18" width="8" height="2" rx="1" fill="var(--bg)" opacity=".7"/>
              </svg>
              老司机导航
            </a>
            <span class="hp-toggle" id="hpToggle" title="设为主页">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z"/>
              </svg>
            </span>
          </div>
          <div class="search-area">
            <div class="search-box">
              <input class="search-input" id="searchInput" type="text" placeholder="搜索站点 / 回车使用搜索引擎" autocomplete="off" autofocus>
              <button class="search-btn" id="searchBtn">
                <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3451 15.2003C16.6377 15.4915 16.4752 15.772 16.1934 16.0632C16.15 16.1279 16.0958 16.1818 16.0525 16.2249C15.7707 16.473 15.4456 16.624 15.1854 16.3652L11.6848 12.8815C10.4709 13.8198 8.97529 14.3267 7.44714 14.3267C3.62134 14.3267 0.5 11.2314 0.5 7.41337C0.5 3.60616 3.6105 0.5 7.44714 0.5C11.2729 0.5 14.3943 3.59538 14.3943 7.41337C14.3943 8.98802 13.8524 10.5087 12.8661 11.7383L16.3451 15.2003ZM2.13647 7.4026C2.13647 10.3146 4.52083 12.6766 7.43624 12.6766C10.3517 12.6766 12.736 10.3146 12.736 7.4026C12.736 4.49058 10.3517 2.1286 7.43624 2.1286C4.50999 2.1286 2.13647 4.50136 2.13647 7.4026Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="engine-select">
              <button class="ef-btn" id="engineBtn">
                <span style="position:relative;display:inline-flex;align-items:center">
                  <img class="ef-icon" src="${currentEngine.favicon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                  <span class="ef-icon ef-icon-fb" style="display:none">${currentEngine.name.charAt(0)}</span>
                </span>
                <span class="ef-label">${currentEngine.name}</span>
                <span class="ef-arrow">▾</span>
              </button>
              <div class="ef-dropdown" id="engineDropdown">
                ${SEARCH_ENGINES.map(eng => `
                  <button class="eo${eng.id === currentEngine.id ? ' active' : ''}" data-id="${eng.id}">
                    <span style="position:relative;display:inline-flex;align-items:center;flex-shrink:0">
                      <img class="ef-icon" src="${eng.favicon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                      <span class="ef-icon ef-icon-fb" style="display:none">${eng.name.charAt(0)}</span>
                    </span>
                    ${eng.name}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button class="theme-toggle" id="themeToggle" aria-label="切换主题">🌙</button>
            <a class="theme-toggle" href="https://github.com/vance1145/old-driver-navi" target="_blank" aria-label="GitHub 仓库" style="text-decoration:none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
          </div>
        </div>
      </header>
    `;
  },

  init() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => { Theme.toggle(); this.updateThemeIcon(); });
    this.updateThemeIcon();

    const hpToggle = document.getElementById('hpToggle');
    if (localStorage.getItem('navi-homepage') === 'true') hpToggle.classList.add('on');
    hpToggle.addEventListener('click', () => {
      localStorage.setItem('navi-homepage', 'true');
      hpToggle.classList.add('on');
      App.showHomepageGuide();
    });

    document.getElementById('engineBtn').addEventListener('click', () => {
      const dd = document.getElementById('engineDropdown');
      dd.classList.toggle('open');
      if (dd.classList.contains('open')) {
        setTimeout(() => document.addEventListener('click', closeDropdownOutside), 10);
      }
    });

    document.getElementById('engineDropdown').addEventListener('click', (e) => {
      const opt = e.target.closest('.eo');
      if (!opt) return;
      updateEngineUI(engineById(opt.dataset.id));
      closeDropdown();
      document.getElementById('searchInput').focus();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const doSearch = () => {
      const query = searchInput.value.trim();
      if (!query) return;
      if (query.startsWith('/')) { App.searchLinks(query.slice(1)); return; }
      window.open(currentEngine.url + encodeURIComponent(query), '_blank');
    };

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    searchInput.addEventListener('input', () => { App.searchLinks(searchInput.value); });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); searchInput.focus(); }
      }
      if (e.key === 'Escape') { searchInput.blur(); App.clearSearch(); }
    });

    detectNetworkAndUpdate();
  },

  updateThemeIcon() {
    document.getElementById('themeToggle').textContent = Theme.getCurrent() === 'dark' ? '☀️' : '🌙';
  }
};
