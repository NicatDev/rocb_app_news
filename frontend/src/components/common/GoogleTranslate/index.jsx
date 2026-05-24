import { useEffect, useRef, useState } from 'react';
import { TranslationOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './googleTranslateFab.css';

const GT_SCRIPT_ID = 'rocb-google-translate-script';
const GT_MOUNT_ID = 'google_translate_element';
const GT_LANGS =
  'en,ru,az,fr,de,es,it,tr,uk,pl,ro,ka,kk,uz,tg,hy,be,bs,sq,mk,sr,hr,bg,lt,lv,et,fi,sv,no,da,nl,cs,sk,sl,hu,el,he,pt,mt,is,me,md,ky';

function initGoogleTranslate() {
  if (window.__rocbGtInited || !window.google?.translate?.TranslateElement) return;
  const mount = document.getElementById(GT_MOUNT_ID);
  if (!mount) return;
  window.__rocbGtInited = true;
  const pageLang = (document.documentElement.lang || 'en').split('-')[0];
  new window.google.translate.TranslateElement(
    {
      pageLanguage: pageLang,
      includedLanguages: GT_LANGS,
      autoDisplay: false,
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    GT_MOUNT_ID
  );
}

function loadGoogleTranslateScript() {
  window.googleTranslateElementInit = initGoogleTranslate;
  if (document.getElementById(GT_SCRIPT_ID)) {
    initGoogleTranslate();
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

  const handleToggle = (e) => {
    e.stopPropagation();
    const next = !open;
    setOpen(next);
    if (next) {
      loadGoogleTranslateScript();
    }
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
        <p className="rocb-gt-fab__hint">{t('choose_language') || 'Choose language'}</p>
        <div id={GT_MOUNT_ID} />
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
