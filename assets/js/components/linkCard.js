function toFaviconUrl(icon) {
  if (!icon) return '';
  try {
    const b64 = icon.match(/favicon\.png\.pub\/v1\/(\S+)/)?.[1];
    if (b64) {
      const url = atob(b64);
      return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
    }
  } catch {}
  return icon;
}

let tooltipEl = null;
let tooltipTimer = null;

function getTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'global-tooltip';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function hideTooltip() {
  clearTimeout(tooltipTimer);
  if (tooltipEl) tooltipEl.classList.remove('show');
}

function showTooltip(item) {
  const review = item.dataset.review;
  if (!review) return;

  const tooltip = getTooltip();
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    const rect = item.getBoundingClientRect();
    tooltip.textContent = review;
    tooltip.style.maxWidth = Math.min(320, Math.max(200, rect.width + 40)) + 'px';

    tooltip.style.left = rect.left + 'px';
    let top = rect.top - 10 - tooltip.offsetHeight;
    if (top < 6) top = rect.bottom + 10;
    tooltip.style.top = top + 'px';

    tooltip.classList.add('show');
  }, 1000);
}

const LinkCard = {
  render(link, categoryId, index, isCustom = false, linkId = null) {
    const id = linkId || `${categoryId}-${link.title.replace(/\s+/g, '-')}`;
    const iconUrl = toFaviconUrl(link.icon);
    const showImg = Boolean(iconUrl);
    const hasReview = Boolean(link.review);
    return `
      <div class="cl-item" data-link-id="${id}" data-category="${categoryId}"${hasReview ? ` data-review="${link.review.replace(/"/g, '&quot;')}"` : ''} draggable="false">
        <span class="cl-num">${index + 1}</span>
        ${showImg
          ? `<img class="cl-icon" src="${iconUrl}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
             <div class="cl-icon-fallback" style="display:none">${link.title.charAt(0)}</div>`
          : `<div class="cl-icon-fallback">${link.title.charAt(0)}</div>`
        }
        <span class="cl-title">${link.title}</span>
        <span class="cl-desc">${link.desc || ''}</span>
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

    document.querySelector('.content').addEventListener('mouseover', (e) => {
      const item = e.target.closest('.cl-item');
      if (!item) { hideTooltip(); return; }
      showTooltip(item);
    }, { passive: true });

    document.querySelector('.content').addEventListener('mouseout', (e) => {
      const item = e.target.closest('.cl-item');
      if (!item) { hideTooltip(); return; }
      if (item.contains(e.relatedTarget)) return;
      hideTooltip();
    }, { passive: true });

    window.addEventListener('scroll', hideTooltip, { passive: true });
  }
};
