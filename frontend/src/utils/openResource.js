const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://app.rocbeurope.org/api/v1/').replace(
  /\/?$/,
  '/'
);

const PREVIEWABLE_EXT = /\.(pdf|png|jpe?g|gif|webp|svg|bmp)$/i;

export function getResourcePreviewUrl(resource) {
  if (!resource?.file) return null;
  if (resource.preview_url) return resource.preview_url;
  if (resource.id) return `${API_BASE}rtc-resources/${resource.id}/preview/`;
  return resource.file;
}

export function canPreviewInline(resource) {
  if (!resource?.file) return false;
  const path = String(resource.file).split('?')[0].toLowerCase();
  return PREVIEWABLE_EXT.test(path);
}

export function openResource(resource) {
  if (!resource) return;

  if (resource.external_link) {
    window.open(resource.external_link, '_blank', 'noopener,noreferrer');
    return;
  }

  if (!resource.file) return;

  const url = getResourcePreviewUrl(resource) || resource.file;
  window.open(url, '_blank', 'noopener,noreferrer');
}
