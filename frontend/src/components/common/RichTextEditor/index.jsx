import { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    BlockQuote,
    Link,
    Heading,
    Undo,
    Alignment,
    Image,
    ImageUpload,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { RichTextUploadAdapterPlugin } from './uploadAdapter';
import styles from './style.module.scss';

const baseEditorConfig = {
    licenseKey: 'GPL',
    plugins: [
        Essentials,
        Paragraph,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        List,
        BlockQuote,
        Link,
        Heading,
        Undo,
        Alignment,
        Image,
        ImageUpload,
        RichTextUploadAdapterPlugin,
    ],
    toolbar: {
        items: [
            'undo',
            'redo',
            '|',
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'alignment',
            '|',
            'link',
            'uploadImage',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',
        ],
    },
    alignment: {
        options: ['left', 'center', 'right', 'justify'],
    },
    image: {
        toolbar: [],
        insert: {
            type: 'auto',
        },
    },
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        ],
    },
};

/**
 * Ant Design Form.Item: value + onChange.
 * `instanceKey` dəyişəndə redaktor yenidən yaradılır (modal açılışı / redaktə).
 */
export default function RichTextEditor({ value, onChange, disabled, instanceKey = 'editor' }) {
    const editorConfig = useMemo(() => baseEditorConfig, []);

    return (
        <div className={styles.rocbRichEditor}>
            <CKEditor
                id={instanceKey}
                editor={ClassicEditor}
                config={editorConfig}
                data={value || ''}
                disabled={!!disabled}
                onChange={(_evt, editor) => onChange?.(editor.getData())}
            />
        </div>
    );
}
