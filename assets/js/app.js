const App = {
  init() {
    Theme.init();
    this.renderLayout();
    Header.init();
    Category.init();
    LinkCard.init();
    Widgets.initClock();
    this.initBackToTop();
    this.initModal();
    this.checkExtra();
  },

  renderLayout() {
    document.querySelector('.header-placeholder').innerHTML = Header.render();
    this.renderContent();
  },

  renderContent() {
    const content = document.querySelector('.content');
    const customSection = Category.renderCustomLinks();

    const allCategories = NAV_DATA.categories.map((cat, i) => Category.render(cat, i)).join('');

    content.innerHTML = `
      <div class="search-results-header" id="searchResultsHeader"></div>
      <div class="cat-grid" id="categoryContainer">
        ${customSection}
        ${allCategories}
      </div>
    `;
  },

  searchLinks(query) {
    const header = document.getElementById('searchResultsHeader');
    const container = document.getElementById('categoryContainer');

    if (!query || query.trim() === '') {
      this.clearSearch();
      return;
    }

    const trimmed = query.trim();
    if (trimmed.startsWith('/')) {
      const searchQuery = trimmed.slice(1).trim().toLowerCase();
      const results = Search.search(searchQuery);
      container.innerHTML = results
        ? Category.renderSearchResults(results, searchQuery)
        : '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">未找到匹配结果</div></div>';
      return;
    }

    const lower = trimmed.toLowerCase();
    const results = [];
    const customLinks = Storage.getCustomLinks();

    if (customLinks.length > 0) {
      const matched = customLinks.filter(l =>
        l.title.toLowerCase().includes(lower) || (l.desc && l.desc.toLowerCase().includes(lower))
      );
      if (matched.length > 0) {
        results.push({ icon: '📌', name: '我的收藏', id: 'custom', links: matched });
      }
    }

    for (const category of NAV_DATA.categories) {
      const matchingLinks = category.links.filter(link =>
        link.title.toLowerCase().includes(lower) ||
        (link.desc && link.desc.toLowerCase().includes(lower))
      );
      if (matchingLinks.length > 0) {
        results.push({ ...category, links: matchingLinks });
      }
    }

    if (results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">未找到与 "<strong>${trimmed}</strong>" 相关的站点</div>
        </div>`;
      header.classList.add('show');
      header.innerHTML = `搜索 "<strong>${trimmed}</strong>" 未找到匹配站点`;
      return;
    }

    header.classList.add('show');
    header.innerHTML = `搜索 "<strong>${trimmed}</strong>" 共找到 ${results.reduce((s, c) => s + c.links.length, 0)} 个结果 <span style="cursor:pointer;margin-left:10px;color:var(--accent)" onclick="App.clearSearch()">✕ 清除</span>`;
    container.innerHTML = Category.renderSearchResults(results, trimmed);
  },

  clearSearch() {
    const header = document.getElementById('searchResultsHeader');
    header.classList.remove('show');
    header.innerHTML = '';
    Search.clear();
    document.getElementById('searchInput').value = '';
    this.renderContent();
  },

  showAddLinkModal(category) {
    const modal = document.getElementById('addLinkModal');
    modal.classList.add('show');
    modal.dataset.category = category;
    document.getElementById('modalTitle').textContent = '添加链接';
    document.getElementById('linkTitle').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkDesc').value = '';
    document.getElementById('linkTitle').focus();
  },

  showEditLinkModal(linkId, title, url, desc) {
    const modal = document.getElementById('addLinkModal');
    modal.classList.add('show');
    modal.dataset.editId = linkId;
    document.getElementById('modalTitle').textContent = '编辑链接';
    document.getElementById('linkTitle').value = title;
    document.getElementById('linkUrl').value = url;
    document.getElementById('linkDesc').value = desc || '';
    document.getElementById('linkTitle').focus();
  },

  initModal() {
    const modal = document.getElementById('addLinkModal');
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm');

    const closeModal = () => {
      modal.classList.remove('show');
      modal.dataset.editId = '';
    };

    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    confirmBtn.addEventListener('click', () => {
      const title = document.getElementById('linkTitle').value.trim();
      const url = document.getElementById('linkUrl').value.trim();
      const desc = document.getElementById('linkDesc').value.trim();
      if (!title || !url) {
        this.showToast('标题和链接不能为空');
        return;
      }

      const editId = modal.dataset.editId;
      const customLinks = Storage.getCustomLinks();

      if (editId) {
        const idx = customLinks.findIndex(l => l.id === editId);
        if (idx !== -1) {
          customLinks[idx] = { ...customLinks[idx], title, url, desc };
          Storage.saveCustomLinks(customLinks);
          this.showToast('链接已更新');
        }
      } else {
        customLinks.push({ id: `custom-${Date.now()}`, title, url, desc, icon: '' });
        Storage.saveCustomLinks(customLinks);
        this.showToast('链接已添加');
      }

      closeModal();
      this.renderContent();
    });

    document.getElementById('linkUrl').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmBtn.click();
    });
  },

  initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove('show'), 2000);
  },

  showHomepageGuide() {
    const existing = document.getElementById('homepageGuideModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'homepageGuideModal';
    overlay.innerHTML = `
      <div class="modal" style="max-width:460px">
        <h3 class="modal-title">🏠 设为浏览器启动页 / 主页</h3>
        <div style="font-size:13px;line-height:1.7;color:var(--text-secondary)">
          <p style="margin-bottom:10px;font-weight:600;color:var(--text)">启动页（打开浏览器时自动打开）</p>
          <div style="padding:10px 12px;background:var(--accent-bg);border-radius:8px">
            <strong style="color:var(--text)">Chrome / Edge</strong>
            <ol style="margin:6px 0 0 18px;padding:0">
              <li>右上角菜单 → <strong>设置</strong></li>
              <li>左侧 <strong>启动时</strong> → <strong>打开特定网页</strong></li>
              <li>点击 <strong>添加新网页</strong>，粘贴：</li>
              <li><code style="background:var(--bg);padding:2px 8px;border-radius:4px;font-size:12px;word-break:break-all">${window.location.href}</code></li>
            </ol>
          </div>

          <p style="margin:14px 0 10px;font-weight:600;color:var(--text)">主页（点击浏览器主页按钮时打开）</p>
          <div style="padding:10px 12px;background:var(--accent-bg);border-radius:8px">
            <strong style="color:var(--text)">Chrome / Edge</strong>
            <ol style="margin:6px 0 0 18px;padding:0">
              <li>右上角菜单 → <strong>设置</strong></li>
              <li>左侧 <strong>外观</strong> → 开启 <strong>显示主页按钮</strong></li>
              <li>选择 <strong>输入自定义网址</strong>，粘贴：</li>
              <li><code style="background:var(--bg);padding:2px 8px;border-radius:4px;font-size:12px;word-break:break-all">${window.location.href}</code></li>
            </ol>
          </div>

          <p style="margin-top:10px;font-size:12px;color:var(--text-muted)">其他浏览器操作类似，也可以搜索一下试试</p>
        </div>
        <div class="modal-actions">
          <button class="modal-btn primary" onclick="this.closest('.modal-overlay').remove()">知道了</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  },

  showImportExportModal() {
    const existing = document.getElementById('importExportModal');
    if (existing) existing.remove();

    const data = Storage.exportData();
    const jsonStr = JSON.stringify(data, null, 2);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    overlay.id = 'importExportModal';
    overlay.innerHTML = `
      <div class="modal" style="max-width:480px">
        <h3 class="modal-title">📥 导入/导出书签</h3>
        <div class="modal-field">
          <label class="modal-label">导出数据（复制保存）</label>
          <textarea class="modal-input" id="exportData" style="height:140px;resize:vertical;font-family:monospace;font-size:12px" readonly>${jsonStr}</textarea>
        </div>
        <div class="modal-field">
          <label class="modal-label">导入数据（粘贴后点击导入）</label>
          <textarea class="modal-input" id="importData" style="height:100px;resize:vertical;font-family:monospace;font-size:12px" placeholder="在此粘贴导出的JSON数据..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">关闭</button>
          <button class="modal-btn primary" onclick="App.doImport()">导入</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('exportData').addEventListener('click', () => document.getElementById('exportData').select());
  },

  checkExtra() {
    const p = new URLSearchParams(window.location.search);
    if (p.get('v') !== '2') return;

    const script = document.createElement('script');
    script.src = 'assets/js/data/plus.js';
    script.onload = () => {
      if (sessionStorage.getItem('nsfw-consent')) {
        this.renderContent();
      } else {
        this.showAgeGate();
      }
    };
    document.body.appendChild(script);
  },

  showAgeGate() {
    const overlay = document.createElement('div');
    overlay.className = 'age-gate';
    overlay.innerHTML = `
      <div class="age-gate-box">
        <div class="age-gate-icon">🔞</div>
        <h2 class="age-gate-title">内容警告</h2>
        <p class="age-gate-text">
          以下分类包含受限内容，<strong>未满 18 周岁或所在地区不允许浏览此类内容者请立即离开</strong>。
        </p>
        <p class="age-gate-text" style="font-size:13px;color:var(--text-muted);margin-top:8px;">
          点击下方按钮即代表你已年满 18 周岁，并愿意浏览此类内容。
        </p>
        <div class="age-gate-actions">
          <button class="modal-btn" onclick="window.location.href='https://www.baidu.com'">离开</button>
          <button class="modal-btn primary" id="ageGateConfirm">我已成年（18+），进入</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#ageGateConfirm').addEventListener('click', () => {
      sessionStorage.setItem('nsfw-consent', 'true');
      overlay.remove();
      this.renderContent();
    });
  },

  doImport() {
    const text = document.getElementById('importData').value.trim();
    if (!text) { this.showToast('请粘贴要导入的数据'); return; }
    try {
      const data = JSON.parse(text);
      Storage.importData(data);
      this.showToast('数据导入成功');
      document.getElementById('importExportModal').remove();
      this.renderContent();
    } catch {
      this.showToast('数据格式错误，请检查');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
