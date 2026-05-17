import { looksLikeHtml } from '../../../utils/richText';
import RichTextReadMore from '../RichTextReadMore';
import styles from './style.module.scss';

const TAG_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

/**
 * Plain comma-separated list as chips, or rich HTML with read more.
 */
export default function SpecializationDisplay({ content, className = '' }) {
    const raw = (content || '').trim();

    if (!raw) {
        return null;
    }

    if (looksLikeHtml(raw)) {
        return <RichTextReadMore content={raw} className={className} maxChars={280} />;
    }

    const areas = raw.split(',').map((a) => a.trim()).filter(Boolean);
    if (!areas.length) {
        return null;
    }

    return (
        <div className={`${styles.grid} ${className}`}>
            {areas.map((area, index) => (
                <div
                    key={`${area}-${index}`}
                    className={styles.chip}
                    style={{ '--chip-color': TAG_COLORS[index % TAG_COLORS.length] }}
                >
                    <span className={styles.chipDot} />
                    <span className={styles.chipText}>{area}</span>
                </div>
            ))}
        </div>
    );
}
