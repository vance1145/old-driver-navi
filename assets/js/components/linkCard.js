function toFaviconUrl(icon, linkUrl) {
  if (!icon) {
    if (linkUrl) {
      try { return { primary: `https://${new URL(linkUrl).hostname}/favicon.ico`, fallback: '' }; } catch {}
    }
    return { primary: '', fallback: '' };
  }
  try {
    const b64 = icon.match(/favicon\.png\.pub\/v1\/(\S+)/)?.[1];
    if (b64) {
      const url = atob(b64);
      const hostname = new URL(url).hostname;
      return {
        primary: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
        fallback: `https://${hostname}/favicon.ico`
      };
    }
  } catch {}
  return { primary: icon, fallback: '' };
}

const LinkCard = {
  render(link, categoryId, index, isCustom = false, linkId = null) {
    const id = linkId || `${categoryId}-${link.title.replace(/\s+/g, '-')}`;
    const { primary, fallback: fbUrl } = toFaviconUrl(link.icon, link.url);
    const showImg = Boolean(primary);
    const userControlled = isCustom || categoryId === 'custom';
    const title = userControlled ? escapeHtml(link.title) : link.title;
    const desc = userControlled ? escapeHtml(link.desc || '') : (link.desc || '');
    const charFallback = userControlled ? escapeHtml(link.title.charAt(0)) : link.title.charAt(0);
    const fbAttr = fbUrl ? ` data-fallback="${fbUrl}"` : '';
    return `
      <div class="cl-item" data-link-id="${id}" data-category="${categoryId}" draggable="false">
        <span class="cl-num">${index + 1}</span>
        ${showImg
          ? `<img class="cl-icon" src="${primary}" alt="" loading="lazy"${fbAttr} onload="if(!this.naturalWidth){this.style.display='none';this.nextElementSibling.style.display='flex';}" onerror="var f=this.dataset.fallback;if(f&&this.src!==f){this.src=f;}else{this.style.display='none';this.nextElementSibling.style.display='flex';}">
             <div class="cl-icon-fallback" style="display:none">${charFallback}</div>`
          : `<div class="cl-icon-fallback">${charFallback}</div>`
        }
        <span class="cl-title">${title}</span>
        <span class="cl-desc">${desc}</span>
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
        window.open(link.url, '_blank', 'noopener');
      }
    });
  }
};
