import DOMPurify from 'dompurify';

/** Detail pages: keep CKEditor alignment / layout inline styles. */
const DETAIL_PURIFY_CONFIG = {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['style', 'align', 'class', 'src', 'href', 'target', 'rel'],
    ADD_TAGS: ['img', 'figure', 'figcaption'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/|media\/)/i,
};

const ALIGN_CLASS_MAP = {
    left: 'rt-align-left',
    center: 'rt-align-center',
    right: 'rt-align-right',
    justify: 'rt-align-justify',
    start: 'rt-align-left',
    end: 'rt-align-right',
};

function alignmentFromStyle(style) {
    if (!style) return null;
    const m = style.match(/text-align\s*:\s*(left|right|center|justify|start|end)/i);
    return m ? m[1].toLowerCase() : null;
}

function rewriteImageSources(root) {
    if (!root) return;
    root.querySelectorAll('img[src]').forEach((img) => {
        const src = (img.getAttribute('src') || '').trim();
        if (!src || src.startsWith('data:')) return;
        if (src.startsWith('http://') || src.startsWith('https://')) return;
        if (src.startsWith('/media/') || src.startsWith('media/')) return;
        if (src.startsWith('rich_text/')) {
            img.setAttribute('src', `/media/${src}`);
        }
    });
}

function applyAlignmentClasses(root) {
    if (!root) return;
    const nodes = root.querySelectorAll('[style], [align], [class*="align"]');
    nodes.forEach((el) => {
        const fromStyle = alignmentFromStyle(el.getAttribute('style'));
        const fromAlign = (el.getAttribute('align') || '').toLowerCase();
        const className = (el.getAttribute('class') || '').toLowerCase();
        let key = fromStyle || fromAlign || null;

        if (!key) {
            if (className.includes('text-align-center') || className.includes('align-center')) {
                key = 'center';
            } else if (className.includes('text-align-right') || className.includes('align-right')) {
                key = 'right';
            } else if (className.includes('text-align-justify') || className.includes('align-justify')) {
                key = 'justify';
            } else if (className.includes('text-align-left') || className.includes('align-left')) {
                key = 'left';
            }
        }

        const cls = key ? ALIGN_CLASS_MAP[key] : null;
        if (cls) {
            el.classList.add(cls);
        }
    });
}

export function sanitizeForDisplay(html) {
    return DOMPurify.sanitize(html || '', DETAIL_PURIFY_CONFIG);
}

/** Sanitize + map inline alignment to stable CSS classes for display. */
export function prepareRichHtmlForDisplay(html) {
    const clean = sanitizeForDisplay(html);
    if (!clean || typeof document === 'undefined') {
        return clean;
    }
    const doc = new DOMParser().parseFromString(clean, 'text/html');
    rewriteImageSources(doc.body);
    applyAlignmentClasses(doc.body);
    return doc.body.innerHTML;
}

/** Decode entities and strip tags — for card excerpts, tags, titles. */
export function stripHtmlToText(html) {
    if (html == null || html === '') return '';
    let value = String(html).trim();
    if (!value) return '';

    value = value
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#160;/g, ' ');

    if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = value;
        value = tmp.textContent || tmp.innerText || '';
    } else {
        value = value.replace(/<[^>]+>/g, ' ');
    }

    return value.replace(/\s+/g, ' ').trim();
}

/** Comma/semicolon list after stripping CKEditor HTML (e.g. specialization_areas on RTC cards). */
export function plainTextToTagList(raw) {
    const plain = stripHtmlToText(raw);
    if (!plain) return [];
    return plain
        .split(/[,;|]/)
        .map((part) => part.trim())
        .filter(Boolean);
}

/** Best plain excerpt for RTC dashboard cards. */
export function rtcCardExcerpt(rtc) {
    if (!rtc) return '';
    const overview = stripHtmlToText(rtc.overview_text);
    const mission = stripHtmlToText(rtc.mission_statement);
    return overview || mission;
}

export function looksLikeHtml(value) {
    if (!value || typeof value !== 'string') return false;
    return /<[a-z][\s\S]*>/i.test(value);
}
