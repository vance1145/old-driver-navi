function toFaviconUrl(icon) {
  if (!icon) return '';
  try {
    const b64 = icon.match(/favicon\.png\.pub\/v1\/(\S+)/)?.[1];
    if (b64) {
      const url = atob(b64);
      const domain = new URL(url).hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    }
  } catch {}
  return icon;
}

const LinkCard = {
  render(link, categoryId, isCustom = false, linkId = null) {
    const id = linkId || `${categoryId}-${link.title.replace(/\s+/g, '-')}`;
    const iconUrl = toFaviconUrl(link.icon);
    const showImg = Boolean(iconUrl);
    const hasReview = Boolean(link.review);
    return `
      <div class="link-card" data-link-id="${id}" data-category="${categoryId}" draggable="false">
        <div style="position:relative;width:36px;height:36px;flex-shrink:0">
          ${showImg ? `<img class="link-icon" src="${iconUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
          <div class="link-icon fallback" style="display:${showImg ? 'none' : 'flex'}">${link.title.charAt(0)}</div>
        </div>
        <div class="link-info">
          <div class="link-title">${link.title}</div>
          <div class="link-desc">${link.desc || ''}</div>
          ${hasReview ? `
            <div class="link-review">${link.review}</div>
            <button class="link-review-toggle">展开 <span class="arrow">▸</span></button>
          ` : ''}
        </div>
        <div class="link-card-actions">
          ${isCustom ? `
            <button class="link-action-btn edit-link" data-link-id="${id}" title="编辑">✎</button>
            <button class="link-action-btn delete delete-link" data-link-id="${id}" title="删除">✕</button>
          ` : ''}
        </div>
      </div>
    `;
  },

  findLink(linkId, categoryId) {
    if (categoryId === 'custom') {
      const customLinks = Storage.getCustomLinks();
      return customLinks.find(l => l.id === linkId) || null;
    }
    const category = NAV_DATA.categories.find(c => c.id === categoryId);
    if (!category) return null;
    return category.links.find(l => `${categoryId}-${l.title.replace(/\s+/g, '-')}` === linkId) || null;
  },

  init() {
    document.querySelector('.content').addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.link-review-toggle');
      if (toggleBtn) {
        e.stopPropagation();
        const review = toggleBtn.parentElement.querySelector('.link-review');
        const expanded = review.classList.toggle('expanded');
        toggleBtn.innerHTML = expanded
          ? '收起 <span class="arrow">▾</span>'
          : '展开 <span class="arrow">▸</span>';
        return;
      }

      const editBtn = e.target.closest('.edit-link');
      if (editBtn) {
        e.stopPropagation();
        const linkId = editBtn.dataset.linkId;
        const customLinks = Storage.getCustomLinks();
        const link = customLinks.find(l => l.id === linkId);
        if (link) App.showEditLinkModal(linkId, link.title, link.url, link.desc);
        return;
      }

      const deleteBtn = e.target.closest('.delete-link');
      if (deleteBtn) {
        e.stopPropagation();
        const linkId = deleteBtn.dataset.linkId;
        let customLinks = Storage.getCustomLinks();
        customLinks = customLinks.filter(l => l.id !== linkId);
        Storage.saveCustomLinks(customLinks);
        App.renderContent();
        App.showToast('链接已删除');
        return;
      }

      const card = e.target.closest('.link-card');
      if (!card) return;

      const linkId = card.dataset.linkId;
      const categoryId = card.dataset.category;
      const link = this.findLink(linkId, categoryId);
      if (link && link.url) {
        Storage.recordClick(linkId);
        window.open(link.url, '_blank');
      }
    });
  }
};
