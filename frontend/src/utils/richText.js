import DOMPurify from 'dompurify';

/** Detail pages: keep CKEditor alignment / layout inline styles. */
const DETAIL_PURIFY_CONFIG = {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['style', 'align'],
    ADD_TAGS: ['img', 'figure', 'figcaption'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/media\/|media\/)/i,
};

export function sanitizeForDisplay(html) {
    return DOMPurify.sanitize(html || '', DETAIL_PURIFY_CONFIG);
}

/** Plain-text length for excerpts / expand heuristics (browser). */
export function stripHtmlToText(html) {
    if (!html) return '';
    if (typeof document === 'undefined') {
        return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

export function looksLikeHtml(value) {
    if (!value || typeof value !== 'string') return false;
    return /<[a-z][\s\S]*>/i.test(value);
}
