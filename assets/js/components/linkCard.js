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
  render(link, categoryId, index, isCustom = false, linkId = null) {
    const id = linkId || `${categoryId}-${link.title.replace(/\s+/g, '-')}`;
    const iconUrl = toFaviconUrl(link.icon);
    const showImg = Boolean(iconUrl);
    const hasReview = Boolean(link.review);
    return `
      <div class="cl-item" data-link-id="${id}" data-category="${categoryId}" draggable="false">
        <span class="cl-num">${index + 1}</span>
        ${showImg
          ? `<img class="cl-icon" src="${iconUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
             <div class="cl-icon-fallback" style="display:none">${link.title.charAt(0)}</div>`
          : `<div class="cl-icon-fallback">${link.title.charAt(0)}</div>`
        }
        <span class="cl-title">${link.title}</span>
        <span class="cl-desc">${link.desc || ''}</span>
        ${hasReview ? `
        <div class="cl-review-wrap">
          <span class="cl-review-icon">🔍</span>
          <div class="cl-review-tip">${link.review}</div>
        </div>` : ''}
        ${isCustom ? `
        <div class="cl-actions">
          <button class="cl-act edit-link" data-link-id="${id}" title="编辑">✎</button>
          <button class="cl-act del delete-link" data-link-id="${id}" title="删除">✕</button>
        </div>` : ''}
      </div>
    `;
  },

  findLink(linkId, categoryId) {
    if (categoryId === 'custom') {
      return Storage.getCustomLinks().find(l => l.id === linkId) || null;
    }
    const category = NAV_DATA.categories.find(c => c.id === categoryId);
    if (!category) return null;
    return category.links.find((l, i) => `${categoryId}-${l.title.replace(/\s+/g, '-')}` === linkId) || null;
  },

  init() {
    document.querySelector('.content').addEventListener('click', (e) => {
      if (e.target.closest('.cl-review-wrap')) return;
      if (e.target.closest('.cl-actions')) return;

      const editBtn = e.target.closest('.edit-link');
      if (editBtn) {
        e.stopPropagation();
        const linkId = editBtn.dataset.linkId;
        const link = Storage.getCustomLinks().find(l => l.id === linkId);
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

      const item = e.target.closest('.cl-item');
      if (!item) return;
      const linkId = item.dataset.linkId;
      const categoryId = item.dataset.category;
      const link = this.findLink(linkId, categoryId);
      if (link && link.url) {
        Storage.recordClick(linkId);
        window.open(link.url, '_blank');
      }
    });
  }
};
