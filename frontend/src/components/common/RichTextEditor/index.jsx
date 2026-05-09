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
    RemoveFormat,
    SourceEditing,
    GeneralHtmlSupport,
    Indent,
    IndentBlock,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import styles from './style.module.scss';

const editorConfig = {
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
        RemoveFormat,
        SourceEditing,
        GeneralHtmlSupport,
        Indent,
        IndentBlock,
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
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'blockQuote',
            '|',
            'removeFormat',
            '|',
            'sourceEditing',
        ],
    },
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        ],
    },
    htmlSupport: {
        allow: [
            {
                name: /^.*$/,
                styles: true,
                attributes: true,
                classes: true,
            },
        ],
    },
};

/**
 * Ant Design Form.Item: value + onChange.
 * `instanceKey` dəyişəndə redaktor yenidən yaradılır (modal açılışı / redaktə).
 */
export default function RichTextEditor({ value, onChange, disabled, instanceKey = 'editor' }) {
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
