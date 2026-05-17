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
    RemoveFormat,
    SourceEditing,
    GeneralHtmlSupport,
    Indent,
    IndentBlock,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
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
        RemoveFormat,
        SourceEditing,
        GeneralHtmlSupport,
        Indent,
        IndentBlock,
        Image,
        ImageCaption,
        ImageStyle,
        ImageToolbar,
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
            'link',
            'uploadImage',
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
    image: {
        toolbar: [
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            '|',
            'toggleImageCaption',
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
