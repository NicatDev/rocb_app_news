import { useEffect, useRef, useState } from 'react';
import { TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { GT_LANG_CODES, GT_LANG_LABELS, GT_LANGS_CSV } from './gtLanguages';
import './googleTranslateFab.css';

const GT_SCRIPT_ID = 'rocb-google-translate-script';
const GT_MOUNT_ID = 'google_translate_element';
const GT_SELECT_ID = 'rocbGtLangSelect';

function getGtCombo() {
  return document.querySelector(`#${GT_MOUNT_ID} .goog-te-combo`);
}

function applyGtLanguage(lang) {
  const combo = getGtCombo();
  if (!combo) return false;
  combo.value = lang;
  combo.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

function retryApplyLanguage(lang) {
  if (applyGtLanguage(lang)) return;
  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (applyGtLanguage(lang) || tries >= 30) clearInterval(timer);
  }, 200);
}

function initGoogleTranslate() {
  if (window.__rocbGtInited || !window.google?.translate?.TranslateElement) return;
  const mount = document.getElementById(GT_MOUNT_ID);
  if (!mount) return;
  window.__rocbGtInited = true;
  const pageLang = (document.documentElement.lang || 'en').split('-')[0];
  new window.google.translate.TranslateElement(
    {
      pageLanguage: pageLang,
      includedLanguages: GT_LANGS_CSV,
      autoDisplay: false,
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    GT_MOUNT_ID
  );
  [0, 300, 1000].forEach((ms) => setTimeout(hideGtTopChrome, ms));
}

function isInsideGtFab(el) {
  const fab = document.getElementById('rocbGtFab');
  return fab?.contains(el);
}

function isGtBannerIframe(el) {
  if (!el || el.tagName !== 'IFRAME') return false;
  if (el.classList.contains('goog-te-banner-frame')) return true;
  if (el.className && String(el.className).includes('VIpgJd-')) return true;
  if (el.id && String(el.id).includes('container')) return true;
  if (el.classList.contains('skiptranslate') && el.getAttribute('src') === '#') return true;
  return false;
}

function isGtTopChrome(el) {
  if (!el || isInsideGtFab(el)) return false;
  if (el.tagName === 'IFRAME') return isGtBannerIframe(el);
  if (el.tagName === 'DIV' && el.classList.contains('skiptranslate') && el.parentElement === document.body) {
    return !!el.querySelector(
      'iframe.goog-te-banner-frame, iframe[class*="VIpgJd-"], iframe[id*="container"], iframe.skiptranslate[src="#"]'
    );
  }
  return false;
}

function applyGtChromeHide(el) {
  el.style.setProperty('display', 'none', 'important');
  el.style.setProperty('visibility', 'hidden', 'important');
  el.style.setProperty('height', '0', 'important');
  el.style.setProperty('width', '0', 'important');
  el.style.setProperty('overflow', 'hidden', 'important');
}

function hideGtTopChrome() {
  document.querySelectorAll('body > div.skiptranslate, body > iframe.skiptranslate, iframe').forEach((el) => {
    if (!isGtTopChrome(el)) return;
    applyGtChromeHide(el);
  });
  document.body.style.setProperty('top', '0', 'important');
  document.body.style.setProperty('margin-top', '0', 'important');
}

function watchGtTopChrome() {
  hideGtTopChrome();
  if (window.__rocbGtChromeObserver) return;
  window.__rocbGtChromeObserver = new MutationObserver(hideGtTopChrome);
  window.__rocbGtChromeObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
}

function loadGoogleTranslateScript() {
  window.googleTranslateElementInit = initGoogleTranslate;
  if (document.getElementById(GT_SCRIPT_ID)) {
    initGoogleTranslate();
    hideGtTopChrome();
    return;
  }
  const script = document.createElement('script');
  script.id = GT_SCRIPT_ID;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  document.body.appendChild(script);
}

export default function FloatingGoogleTranslate() {
  const { t } = useTranslation();
  const fabRef = useRef(null);
  const [open, setOpen] = useState(false);
  const chooseLabel = t('choose_language') || 'Choose language';

  useEffect(() => {
    watchGtTopChrome();
    return () => {
      window.__rocbGtChromeObserver?.disconnect();
      window.__rocbGtChromeObserver = null;
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!fabRef.current?.classList.contains('is-open')) return;
      if (fabRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const el = fabRef.current;
    if (!el) return;
    el.classList.toggle('is-open', open);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    loadGoogleTranslateScript();
    const sel = document.getElementById(GT_SELECT_ID);
    if (!sel) return undefined;

    const onChange = () => {
      if (!sel.value) return;
      retryApplyLanguage(sel.value);
    };
    sel.addEventListener('change', onChange);
    const focusTimer = setTimeout(() => sel.focus(), 150);
    return () => {
      sel.removeEventListener('change', onChange);
      clearTimeout(focusTimer);
    };
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <div
      ref={fabRef}
      className="rocb-gt-fab notranslate"
      id="rocbGtFab"
    >
      <div
        className="rocb-gt-fab__panel"
        id="rocbGtPanel"
        aria-hidden={open ? 'false' : 'true'}
      >
        <label className="rocb-gt-fab__label" htmlFor={GT_SELECT_ID}>
          {chooseLabel}
        </label>
        <select
          id={GT_SELECT_ID}
          className="rocb-gt-fab__select"
          defaultValue=""
          aria-label={chooseLabel}
        >
          <option value="" disabled>
            {chooseLabel}…
          </option>
          {GT_LANG_CODES.map((code) => (
            <option key={code} value={code}>
              {GT_LANG_LABELS[code] || code}
            </option>
          ))}
        </select>
        <div id={GT_MOUNT_ID} className="rocb-gt-fab__gt-sr" aria-hidden="true" />
      </div>
      <button
        type="button"
        className="rocb-gt-fab__btn"
        aria-expanded={open}
        aria-controls="rocbGtPanel"
        aria-label={t('translate_page') || 'Translate page'}
        title={t('translate') || 'Translate'}
        onClick={handleToggle}
      >
        <TranslationOutlined style={{ fontSize: 22 }} />
      </button>
    </div>
  );
}
