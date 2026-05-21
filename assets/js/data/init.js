const NAV_DATA = { categories: [] };

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str ?? '')));
  return div.innerHTML;
}

const SAFE_PROTOCOLS = ['http:', 'https:', 'ftp:', 'ftps:', 'mailto:'];
function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

function faviconFallbackUrl(url) {
  try { return `https://${new URL(url).hostname}/favicon.ico`; } catch { return ''; }
}
