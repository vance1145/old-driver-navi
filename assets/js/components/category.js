const Category = {
  render(category, index) {
    return `
      <section class="category-section" id="category-${category.id}" data-category="${category.id}" style="animation: fadeIn 0.4s ease ${index * 0.05}s both;">
        <div class="category-header">
          <span class="category-icon">${category.icon}</span>
          <h2 class="category-title">${category.name}</h2>
          <span style="margin-left:auto;font-size:12px;color:var(--text-muted)">${category.links.length} 个站点</span>
        </div>
        <div class="links-grid" data-category="${category.id}">
          ${category.links.map(link => LinkCard.render(link, category.id)).join('')}
          <div class="add-link-card" data-category="${category.id}">
            <span>+</span> 添加链接
          </div>
        </div>
      </section>
    `;
  },

  renderCustomLinks() {
    const customLinks = Storage.getCustomLinks();
    if (customLinks.length === 0) return '';

    return `
      <section class="category-section" id="category-custom" data-category="custom">
        <div class="category-header">
          <span class="category-icon">📌</span>
          <h2 class="category-title">我的收藏</h2>
          <span style="margin-left:auto;font-size:12px;color:var(--text-muted)">${customLinks.length} 个站点</span>
        </div>
        <div class="links-grid" data-category="custom">
          ${customLinks.map(link => LinkCard.render(link, 'custom', true, link.id)).join('')}
          <div class="add-link-card" data-category="custom">
            <span>+</span> 添加链接
          </div>
        </div>
      </section>
    `;
  },

  renderSearchResults(results, query) {
    if (!results || results.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">未找到与 "<strong>${query}</strong>" 相关的站点</div>
        </div>
      `;
    }

    return results.map((cat, i) => `
      <section class="category-section" style="animation: fadeIn 0.3s ease ${i * 0.05}s both;">
        <div class="category-header">
          <span class="category-icon">${cat.icon}</span>
          <h2 class="category-title">${cat.name}</h2>
          <span style="margin-left:auto;font-size:12px;color:var(--text-muted)">${cat.links.length} 个匹配</span>
        </div>
        <div class="links-grid">
          ${cat.links.map(link => LinkCard.render(link, cat.id)).join('')}
        </div>
      </section>
    `).join('');
  },

  init() {
    document.querySelector('.content').addEventListener('click', (e) => {
      const addBtn = e.target.closest('.add-link-card');
      if (!addBtn) return;
      const category = addBtn.dataset.category;
      App.showAddLinkModal(category);
    });
  }
};
