import { CKEditor } from 'ckeditor4-react';
import styles from './style.module.scss';

/** CDN build avoids huge Windows node_modules trees from CKEditor 5. */
const CKEDITOR_SCRIPT = 'https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js';

/**
 * Ant Design Form.Item compatible: receives value + onChange from Form.
 * `instanceKey` should change when the modal opens or the edited record changes so initData reloads.
 */
export default function RichTextEditor({ value, onChange, disabled, instanceKey = 'editor' }) {
    return (
        <div className={styles.rocbRichEditor}>
            <CKEditor
                key={instanceKey}
                scriptUrl={CKEDITOR_SCRIPT}
                type="classic"
                initData={value || ''}
                readOnly={!!disabled}
                config={{
                    toolbar: [
                        ['Bold', 'Italic', 'Underline', 'Strike'],
                        ['NumberedList', 'BulletedList', 'Outdent', 'Indent', '-', 'Blockquote'],
                        ['Link', 'Unlink'],
                        ['Format'],
                        ['RemoveFormat', 'Source'],
                    ],
                    format_tags: 'p;h2;h3;pre',
                    removePlugins: 'elementspath',
                    resize_enabled: true,
                }}
                onChange={(evt) => onChange?.(evt.editor.getData())}
            />
        </div>
    );
}
