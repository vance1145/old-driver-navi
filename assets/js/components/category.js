const MAX_VISIBLE = 10;

const Category = {
  render(category, index) {
    const links = category.links;
    const showSeeAll = links.length > MAX_VISIBLE;
    const visible = showSeeAll ? links.slice(0, MAX_VISIBLE) : links;

    return `
      <div class="cat-container" id="category-${category.id}" data-category="${category.id}" style="animation: fadeInScale 0.3s ease ${index * 0.04}s both;">
        <div class="cat-header">
          <span class="cat-icon">${category.icon}</span>
          <span class="cat-title">${category.name}</span>
          <span class="cat-count">${links.length}</span>
        </div>
        <div class="cat-body" id="catBody-${category.id}">
          ${visible.map((link, i) => LinkCard.render(link, category.id, i)).join('')}
        </div>
        <div class="cl-see-all ${showSeeAll ? '' : 'hidden'}" data-category="${category.id}">
          查看全部 ${links.length} 个 <span style="font-size:10px">▸</span>
        </div>
      </div>
    `;
  },

  renderCustomLinks() {
    const links = Storage.getCustomLinks();
    if (links.length === 0) return '';

    return `
      <div class="cat-container" id="category-custom" data-category="custom" style="animation: fadeInScale 0.3s ease 0s both;">
        <div class="cat-header">
          <span class="cat-icon">📌</span>
          <span class="cat-title">我的收藏</span>
          <span class="cat-count">${links.length}</span>
        </div>
        <div class="cat-body" id="catBody-custom">
          ${links.map((link, i) => LinkCard.render(link, 'custom', i, true, link.id)).join('')}
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
          <div class="empty-state-text">未找到与 "<strong>${query}</strong>" 相关的站点</div>
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
      const seeAll = e.target.closest('.cl-see-all');
      if (seeAll) {
        const catId = seeAll.dataset.category;
        const body = document.getElementById(`catBody-${catId}`);
        const category = NAV_DATA.categories.find(c => c.id === catId);
        if (body && category) {
          body.innerHTML = category.links.map((link, i) => LinkCard.render(link, catId, i)).join('');
          seeAll.classList.add('hidden');
        }
        return;
      }

      const addBtn = e.target.closest('.cl-add');
      if (addBtn) {
        App.showAddLinkModal(addBtn.dataset.category);
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
