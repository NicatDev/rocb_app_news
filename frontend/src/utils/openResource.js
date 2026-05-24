const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://app.rocbeurope.org/api/v1/').replace(
  /\/?$/,
  '/'
);

/** Types browsers usually render in a tab (not Word/Excel). */
const BROWSER_OPEN_EXT = /\.(pdf|png|jpe?g|gif|webp|svg|bmp|txt)$/i;

export function getResourcePreviewUrl(resource) {
  if (!resource?.file) return null;
  if (resource.preview_url) return resource.preview_url;
  if (resource.id) return `${API_BASE}dashboard/rtc-resources/${resource.id}/preview/`;
  return resource.file;
}

export function getResourceDownloadUrl(resource) {
  if (!resource?.file) return null;
  if (resource.id) return `${API_BASE}dashboard/rtc-resources/${resource.id}/download/`;
  return resource.file;
}

export function canOpenInBrowser(resource) {
  if (!resource?.file) return false;
  const path = String(resource.file).split('?')[0].toLowerCase();
  return BROWSER_OPEN_EXT.test(path);
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function openResource(resource) {
  if (!resource) return;

  if (resource.external_link) {
    window.open(resource.external_link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (!resource.file) return;

  if (canOpenInBrowser(resource)) {
    const url = getResourcePreviewUrl(resource) || resource.file;
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const downloadUrl = getResourceDownloadUrl(resource) || resource.file;
  const filename = String(resource.file).split('/').pop()?.split('?')[0] || 'download';
  triggerDownload(downloadUrl, filename);
}
