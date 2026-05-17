import { useMemo, useState } from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { looksLikeHtml, sanitizeForDisplay, stripHtmlToText } from '../../../utils/richText';
import styles from './style.module.scss';

const DEFAULT_MAX_CHARS = 320;

/**
 * Detail view: rich HTML with optional Read more / Show less.
 */
export default function RichTextReadMore({
    content,
    emptyFallback = null,
    maxChars = DEFAULT_MAX_CHARS,
    className = '',
}) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);

    const raw = (content || '').trim();
    const isHtml = looksLikeHtml(raw);
    const plainLen = useMemo(() => stripHtmlToText(raw).length, [raw]);
    const isLong = plainLen > maxChars;

    if (!raw) {
        return emptyFallback ? <div className={className}>{emptyFallback}</div> : null;
    }

    if (!isHtml) {
        if (!isLong || expanded) {
            return (
                <div className={`${styles.wrapper} ${className}`}>
                    {raw.split('\n').map((line, i) => (
                        <p key={i} className={styles.plainPara}>
                            {line || '\u00a0'}
                        </p>
                    ))}
                    {isLong && (
                        <Button type="link" className={styles.toggleBtn} onClick={() => setExpanded(false)}>
                            {t('show_less') || 'Show less'}
                        </Button>
                    )}
                </div>
            );
        }
        const preview = `${raw.slice(0, maxChars).trim()}…`;
        return (
            <div className={`${styles.wrapper} ${className}`}>
                <p className={styles.plainPara}>{preview}</p>
                <Button type="link" className={styles.toggleBtn} onClick={() => setExpanded(true)}>
                    {t('read_more') || 'Read more'}
                </Button>
            </div>
        );
    }

    const html = sanitizeForDisplay(raw);

    return (
        <div className={`${styles.wrapper} ${className}`}>
            <div
                className={`${styles.richBody} ${styles.richTextDetail} ${!expanded && isLong ? styles.collapsed : ''}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
            {isLong && (
                <Button
                    type="link"
                    className={styles.toggleBtn}
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? (t('show_less') || 'Show less') : (t('read_more') || 'Read more')}
                </Button>
            )}
        </div>
    );
}
