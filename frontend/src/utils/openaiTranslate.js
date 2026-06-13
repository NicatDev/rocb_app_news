import { translateHtmlApi } from '../api/translate';

const STORAGE_KEY = 'openai_page_lang';
const ORIGINAL_ATTR = 'data-openai-original-html';
const CONTENT_SELECTOR = '[data-openai-translate="main"]';
/** Keep each API call small to avoid nginx/gunicorn 502 timeouts. */
const CLIENT_CHUNK_SIZE = 3500;

let loadingCount = 0;

const splitHtmlChunks = (html, maxLen = CLIENT_CHUNK_SIZE) => {
    if (!html || html.length <= maxLen) return [html];
    const chunks = [];
    let start = 0;
    while (start < html.length) {
        let end = Math.min(start + maxLen, html.length);
        if (end < html.length) {
            const splitAt = html.lastIndexOf('</', start, end);
            if (splitAt > start + maxLen / 3) {
                end = splitAt + html.slice(splitAt).indexOf('>') + 1;
            }
        }
        chunks.push(html.slice(start, end));
        start = end;
    }
    return chunks;
};

/** Wait for React/i18n re-render to finish before reading DOM for translation. */
export const waitForDomStable = () =>
    new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(resolve, 80);
            });
        });
    });

const getContentElements = () => Array.from(document.querySelectorAll(CONTENT_SELECTOR));

const ensureOriginalHtml = (el) => {
    if (!el.hasAttribute(ORIGINAL_ATTR)) {
        el.setAttribute(ORIGINAL_ATTR, el.innerHTML);
    }
    return el.getAttribute(ORIGINAL_ATTR);
};

const showLoading = () => {
    loadingCount += 1;
    if (document.getElementById('openai-translate-loading')) return;
    const overlay = document.createElement('div');
    overlay.id = 'openai-translate-loading';
    overlay.className = 'openai-translate-loading';
    overlay.innerHTML = `
      <div class="openai-translate-loading__panel">
        <div class="openai-translate-loading__spinner"></div>
        <p>Translating page…</p>
      </div>`;
    document.body.appendChild(overlay);
};

const hideLoading = () => {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount > 0) return;
    document.getElementById('openai-translate-loading')?.remove();
};

const translateHtmlInChunks = async (html, targetLang, sourceLang) => {
    const chunks = splitHtmlChunks(html);
    if (chunks.length === 1) {
        return translateHtmlApi(html, targetLang, sourceLang);
    }
    const parts = [];
    for (let i = 0; i < chunks.length; i += 1) {
        parts.push(await translateHtmlApi(chunks[i], targetLang, sourceLang));
    }
    return parts.join('');
};

export const restoreOpenAIOriginal = () => {
    getContentElements().forEach((el) => {
        const original = el.getAttribute(ORIGINAL_ATTR);
        if (original != null) {
            el.innerHTML = original;
        }
    });
    localStorage.setItem(STORAGE_KEY, 'en');
    document.documentElement.lang = 'en';
};

export const switchOpenAILanguage = async (targetLang, { sourceLang } = {}) => {
    const langCode = (targetLang || 'en').toLowerCase();
    const fromLang = sourceLang || 'en';

    if (langCode === 'en') {
        restoreOpenAIOriginal();
        return;
    }

    localStorage.setItem(STORAGE_KEY, langCode);

    const elements = getContentElements();
    if (!elements.length) {
        console.warn('OpenAI translate: no [data-openai-translate="main"] element found.');
        return;
    }

    showLoading();
    try {
        for (const el of elements) {
            const original = ensureOriginalHtml(el);
            const translated = await translateHtmlInChunks(original, langCode, fromLang);
            el.innerHTML = translated;
        }
        document.documentElement.lang = langCode;
    } catch (error) {
        console.error('OpenAI translate error:', error);
        const detail = error.message || error.response?.data?.detail || 'Could not translate this page.';
        window.alert(detail);
    } finally {
        hideLoading();
    }
};

export const applyStoredOpenAILanguage = async () => {
    const saved = (localStorage.getItem(STORAGE_KEY) || 'en').toLowerCase();
    if (saved === 'en') return;
    await waitForDomStable();
    await switchOpenAILanguage(saved, { sourceLang: 'en' });
};

export const getStoredOpenAILanguage = () =>
    (localStorage.getItem(STORAGE_KEY) || 'en').toLowerCase();

export const setStoredOpenAILanguage = (lang) => {
    localStorage.setItem(STORAGE_KEY, (lang || 'en').toLowerCase());
};
