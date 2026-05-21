const Category = {
  render(category, index) {
    return `
      <div class="cat-container" id="category-${category.id}" data-category="${category.id}" style="animation: fadeInScale 0.3s ease ${index * 0.04}s both;">
        <div class="cat-header">
          <span class="cat-icon">${category.icon}</span>
          <span class="cat-title">${category.name}</span>
          <span class="cat-count">${category.links.length}</span>
        </div>
        <div class="cat-body" id="catBody-${category.id}">
          ${category.links.map((link, i) => LinkCard.render(link, category.id, i)).join('')}
        </div>
      </div>
    `;
  },

  renderCustomLinks() {
    const links = Storage.getCustomLinks();
    const bodyContent = links.length === 0
      ? '<div style="padding:10px 14px;font-size:12px;color:var(--text-muted);text-align:center">暂无收藏</div>'
      : links.map((link, i) => LinkCard.render(link, 'custom', i, true, link.id)).join('');

    return `
      <div class="cat-container" id="category-custom" data-category="custom" style="animation: fadeInScale 0.3s ease 0s both;">
        <div class="cat-header">
          <span class="cat-icon">📌</span>
          <span class="cat-title">我的收藏</span>
          <span class="cl-add-import" id="importExportLink" title="导入/导出">📥</span>
          <span class="cat-count">${links.length}</span>
        </div>
        <div class="cat-body" id="catBody-custom" style="max-height:252px">
          ${bodyContent}
        </div>
        <div class="cl-add" data-category="custom"><span>+</span> 添加链接</div>
      </div>
    `;
  },

  renderSearchResults(results, query) {
    if (!results || results.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">未找到与 "<strong>${escapeHtml(query)}</strong>" 相关的站点</div>
        </div>
      `;
    }

    return results.map((cat, i) => `
      <div class="cat-container" style="animation: fadeInScale 0.25s ease ${i * 0.04}s both;">
        <div class="cat-header">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-title">${cat.name}</span>
          <span class="cat-count">${cat.links.length} 个匹配</span>
        </div>
        <div class="cat-body">
          ${cat.links.map((link, j) => LinkCard.render(link, cat.id, j)).join('')}
        </div>
      </div>
    `).join('');
  },

  init() {
    document.querySelector('.content').addEventListener('click', (e) => {
      const addBtn = e.target.closest('.cl-add');
      if (addBtn) {
        App.showAddLinkModal(addBtn.dataset.category);
        return;
      }
      if (e.target.closest('#importExportLink')) {
        App.showImportExportModal();
        return;
      }
    });

    document.querySelector('.content').addEventListener('wheel', (e) => {
      const body = e.target.closest('.cat-body');
      if (!body) return;

      const { scrollTop, scrollHeight, clientHeight } = body;
      if (scrollHeight <= clientHeight) return;

      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      const delta = e.deltaY;

      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) return;

      e.preventDefault();
      body.scrollTop += delta;
    }, { passive: false, capture: true });
  }
};
