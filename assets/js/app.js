const App = {
  init() {
    Theme.init();
    this.renderLayout();
    Header.init();
    Sidebar.init();
    Sidebar.initMobile();
    LinkCard.init();
    Category.init();
    Widgets.initClock();
    this.initBackToTop();
    this.initModal();
    this.initImportExport();
  },

  renderLayout() {
    document.querySelector('.sidebar').innerHTML = Sidebar.render();
    document.querySelector('.sidebar').insertAdjacentHTML('beforeend', Sidebar.renderMobile());
    document.querySelector('.header-placeholder').innerHTML = Header.render();
    this.renderContent();
  },

  renderContent() {
    const content = document.querySelector('.content');
    const customSection = Category.renderCustomLinks();

    const allCategories = NAV_DATA.categories.map((cat, i) => Category.render(cat, i)).join('');

    content.innerHTML = `
      <div class="search-results-header" id="searchResultsHeader"></div>
      <div id="categoryContainer">
        ${customSection}
        ${allCategories}
      </div>
      ${this.renderFooter()}
    `;
  },

  renderFooter() {
    return `
      <footer class="footer">
        <a href="#" onclick="App.showImportExportModal();return false">📥 导入/导出书签</a>
      </footer>
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
    const customLinks = Storage.getCustomLinks();
    let hasCustomMatch = false;

    if (trimmed.startsWith('/')) {
      const searchQuery = trimmed.slice(1).trim().toLowerCase();
      const results = Search.search(searchQuery);
      container.innerHTML = `
        <div class="search-results-header show" id="searchResultsHeader">
          搜索 "<strong>${searchQuery}</strong>" 共找到 ${results ? results.reduce((s, c) => s + c.links.length, 0) : 0} 个结果
        </div>
        ${results ? Category.renderSearchResults(results, searchQuery) : '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">未找到匹配结果</div></div>'}
      `;
      return;
    }

    const lower = trimmed.toLowerCase();
    const results = [];

    if (customLinks.length > 0) {
      const matched = customLinks.filter(l =>
        l.title.toLowerCase().includes(lower) || (l.desc && l.desc.toLowerCase().includes(lower))
      );
      if (matched.length > 0) {
        hasCustomMatch = true;
        results.push({
          icon: '📌',
          name: '我的收藏',
          id: 'custom',
          links: matched
        });
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
      header.classList.add('show');
      header.innerHTML = `搜索 "<strong>${trimmed}</strong>" 未找到匹配站点`;
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">未找到与 "<strong>${trimmed}</strong>" 相关的站点</div>
        </div>
      `;
      return;
    }

    header.classList.add('show');
    header.innerHTML = `搜索 "<strong>${trimmed}</strong>" 共找到 ${results.reduce((s, c) => s + c.links.length, 0)} 个结果 <span style="cursor:pointer;margin-left:12px;color:var(--accent)" onclick="App.clearSearch()">✕ 清除</span>`;
    container.innerHTML = results.map((cat, i) => {
      if (cat.id === 'custom') {
        return `
          <section class="category-section" style="animation: fadeIn 0.3s ease ${i * 0.05}s both;">
            <div class="category-header">
              <span class="category-icon">📌</span>
              <h2 class="category-title">我的收藏</h2>
            </div>
            <div class="links-grid">
              ${cat.links.map(link => LinkCard.render(link, 'custom', true, link.id)).join('')}
            </div>
          </section>
        `;
      }
      return Category.renderSearchResults([cat], trimmed);
    }).join('');
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

    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('show');
      modal.dataset.editId = '';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
        modal.dataset.editId = '';
      }
    });

    confirmBtn.addEventListener('click', () => {
      const title = document.getElementById('linkTitle').value.trim();
      const url = document.getElementById('linkUrl').value.trim();
      const desc = document.getElementById('linkDesc').value.trim();
      if (!title || !url) {
        this.showToast('标题和链接不能为空');
        return;
      }

      const editId = modal.dataset.editId;
      if (editId) {
        let customLinks = Storage.getCustomLinks();
        const idx = customLinks.findIndex(l => l.id === editId);
        if (idx !== -1) {
          customLinks[idx] = { ...customLinks[idx], title, url, desc };
          Storage.saveCustomLinks(customLinks);
          this.showToast('链接已更新');
        }
      } else {
        const customLinks = Storage.getCustomLinks();
        customLinks.push({
          id: `custom-${Date.now()}`,
          title,
          url,
          desc,
          icon: ''
        });
        Storage.saveCustomLinks(customLinks);
        this.showToast('链接已添加');
      }

      modal.classList.remove('show');
      modal.dataset.editId = '';
      this.renderContent();
      LinkCard.init();
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

  initImportExport() {
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
      <div class="modal" style="max-width:500px">
        <h3 class="modal-title">📥 导入/导出书签</h3>
        <div class="modal-field">
          <label class="modal-label">导出数据（复制保存）</label>
          <textarea class="modal-input" id="exportData" style="height:160px;resize:vertical;font-family:monospace;font-size:12px" readonly>${jsonStr}</textarea>
        </div>
        <div class="modal-field">
          <label class="modal-label">导入数据（粘贴后点击导入）</label>
          <textarea class="modal-input" id="importData" style="height:120px;resize:vertical;font-family:monospace;font-size:12px" placeholder="在此粘贴导出的JSON数据..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">关闭</button>
          <button class="modal-btn primary" onclick="App.doImport()">导入</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    const exportTextarea = document.getElementById('exportData');
    exportTextarea.addEventListener('click', () => exportTextarea.select());
  },

  doImport() {
    const text = document.getElementById('importData').value.trim();
    if (!text) {
      this.showToast('请粘贴要导入的数据');
      return;
    }
    try {
      const data = JSON.parse(text);
      Storage.importData(data);
      this.showToast('数据导入成功');
      document.getElementById('importExportModal').remove();
      this.renderContent();
      LinkCard.init();
    } catch {
      this.showToast('数据格式错误，请检查');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
