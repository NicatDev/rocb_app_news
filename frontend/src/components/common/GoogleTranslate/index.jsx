import { useEffect, useRef } from 'react';
import styles from './style.module.scss';

const GT_SCRIPT_ID = 'rocb-google-translate-script';
const GT_MOUNT_CLASS = 'rocb-google-translate-mount';

function loadGoogleTranslate(pageLanguage = 'en') {
  if (window.__rocbGoogleTranslateReady) return;

  window.googleTranslateElementInit = () => {
    if (window.__rocbGoogleTranslateReady) return;
    const mounts = document.querySelectorAll(`.${GT_MOUNT_CLASS}`);
    if (!mounts.length || !window.google?.translate?.TranslateElement) return;

    window.__rocbGoogleTranslateReady = true;
    mounts.forEach((mount, index) => {
      if (index > 0) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: pageLanguage.split('-')[0],
          includedLanguages:
            'en,ru,az,fr,de,es,it,tr,uk,pl,ro,ka,kk,uz,tg,hy,be,bs,sq,mk,sr,hr,bg,lt,lv,et,fi,sv,no,da,nl,cs,sk,sl,hu,el,he,pt,mt,is,me,md,ky',
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        mount.id
      );
    });
  };

  if (document.getElementById(GT_SCRIPT_ID)) {
    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
    return;
  }

  const script = document.createElement('script');
  script.id = GT_SCRIPT_ID;
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.defer = true;
  document.body.appendChild(script);
}

export default function GoogleTranslate({ id = 'google_translate_element', className = '', compact = false }) {
  const mountRef = useRef(null);
  const mountId = id;

  useEffect(() => {
    loadGoogleTranslate(document.documentElement.lang || 'en');
  }, []);

  return (
    <div
      className={`${styles.wrap} ${compact ? styles.compact : ''} ${className}`.trim()}
      aria-label="Translate page"
    >
      {!compact && <span className={styles.label}>Translate</span>}
      <div
        id={mountId}
        ref={mountRef}
        className={`${GT_MOUNT_CLASS} ${styles.mount}`}
      />
    </div>
  );
}
