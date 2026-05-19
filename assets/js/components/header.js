const SEARCH_ENGINES = [
  { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q=', favicon: 'https://icons.duckduckgo.com/ip3/www.bing.com.ico' },
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', favicon: 'https://icons.duckduckgo.com/ip3/www.google.com.ico' },
  { id: 'ddgs', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', favicon: 'https://icons.duckduckgo.com/ip3/duckduckgo.com.ico' },
  { id: 'zhihu', name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=', favicon: 'https://icons.duckduckgo.com/ip3/www.zhihu.com.ico' },
  { id: 'bilibili', name: 'B站', url: 'https://search.bilibili.com/all?keyword=', favicon: 'https://icons.duckduckgo.com/ip3/www.bilibili.com.ico' },
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
          <span class="hp-toggle" id="hpToggle" title="设为主页">🏠</span>
          <div class="search-area">
            <div class="search-box">
              <input class="search-input" id="searchInput" type="text" placeholder="搜索站点..." autocomplete="off" autofocus>
              <button class="search-btn" id="searchBtn">
                <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M16.3451 15.2003C16.6377 15.4915 16.4752 15.772 16.1934 16.0632C16.15 16.1279 16.0958 16.1818 16.0525 16.2249C15.7707 16.473 15.4456 16.624 15.1854 16.3652L11.6848 12.8815C10.4709 13.8198 8.97529 14.3267 7.44714 14.3267C3.62134 14.3267 0.5 11.2314 0.5 7.41337C0.5 3.60616 3.6105 0.5 7.44714 0.5C11.2729 0.5 14.3943 3.59538 14.3943 7.41337C14.3943 8.98802 13.8524 10.5087 12.8661 11.7383L16.3451 15.2003ZM2.13647 7.4026C2.13647 10.3146 4.52083 12.6766 7.43624 12.6766C10.3517 12.6766 12.736 10.3146 12.736 7.4026C12.736 4.49058 10.3517 2.1286 7.43624 2.1286C4.50999 2.1286 2.13647 4.50136 2.13647 7.4026Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="engine-select">
              <button class="ef-btn" id="engineBtn">
                <img class="ef-icon" src="${currentEngine.favicon}" alt="">
                <span class="ef-label">${currentEngine.name}</span>
                <span class="ef-arrow">▾</span>
              </button>
              <div class="ef-dropdown" id="engineDropdown">
                ${SEARCH_ENGINES.map(eng => `
                  <button class="eo${eng.id === currentEngine.id ? ' active' : ''}" data-id="${eng.id}">
                    <img class="ef-icon" src="${eng.favicon}" alt="">
                    ${eng.name}
                  </button>
                `).join('')}
              </div>
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
    themeToggle.addEventListener('click', () => { Theme.toggle(); this.updateThemeIcon(); });
    this.updateThemeIcon();

    const hpToggle = document.getElementById('hpToggle');
    if (localStorage.getItem('navi-homepage') === 'true') hpToggle.classList.add('on');
    hpToggle.addEventListener('click', () => {
      if (localStorage.getItem('navi-homepage') === 'true') {
        localStorage.removeItem('navi-homepage');
        hpToggle.classList.remove('on');
        App.showToast('已取消首页设置');
      } else {
        localStorage.setItem('navi-homepage', 'true');
        hpToggle.classList.add('on');
        App.showToast('请在浏览器设置中手动将本页设为主页');
      }
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
