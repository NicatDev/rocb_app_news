/** Reliable Google Translate trigger (cookie + combo). */

export function getPageLangCode() {
  const html = document.documentElement.lang || 'en';
  return html.split('-')[0].toLowerCase();
}

function writeGoogTransCookie(value) {
  const host = window.location.hostname;
  const base = `googtrans=${value};path=/`;
  document.cookie = base;
  document.cookie = `${base};domain=${host}`;
  const root = host.replace(/^www\./, '');
  if (root.includes('.')) {
    document.cookie = `${base};domain=.${root}`;
  }
}

function clearGoogTransCookie() {
  const exp = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const host = window.location.hostname;
  const clear = `googtrans=;path=/;expires=${exp}`;
  document.cookie = clear;
  document.cookie = `${clear};domain=${host}`;
  const root = host.replace(/^www\./, '');
  if (root.includes('.')) {
    document.cookie = `${clear};domain=.${root}`;
  }
}

export function getGtCombo(mountId = 'google_translate_element') {
  return document.querySelector(`#${mountId} .goog-te-combo`);
}

function triggerComboChange(combo, lang) {
  if (!combo) return false;
  let matched = false;
  for (let i = 0; i < combo.options.length; i += 1) {
    const opt = combo.options[i];
    if (opt.value === lang || opt.value === `|${lang}` || opt.value.endsWith(lang)) {
      combo.selectedIndex = i;
      matched = true;
      break;
    }
  }
  if (!matched) combo.value = lang;
  combo.dispatchEvent(new Event('change', { bubbles: true }));
  if (typeof combo.onchange === 'function') combo.onchange();
  return true;
}

/**
 * Translate page to target language. Uses googtrans cookie + reload (reliable).
 */
export function translatePageTo(targetLang, mountId = 'google_translate_element') {
  if (!targetLang) return;

  const pageLang = getPageLangCode();
  if (targetLang === pageLang) {
    clearGoogTransCookie();
    window.location.reload();
    return;
  }

  writeGoogTransCookie(`/${pageLang}/${targetLang}`);

  const combo = getGtCombo(mountId);
  if (combo) triggerComboChange(combo, targetLang);

  window.location.reload();
}
