import api from '../../../api/axios';

class RichTextUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file.then(
            (file) =>
                new Promise((resolve, reject) => {
                    const body = new FormData();
                    body.append('upload', file);
                    api.post('rich-text/upload/', body, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    })
                        .then(({ data }) => {
                            const url = data?.urls?.default || data?.url;
                            if (!url) {
                                reject(new Error('Upload response missing image URL.'));
                                return;
                            }
                            resolve({ default: url });
                        })
                        .catch((err) => {
                            const msg =
                                err?.response?.data?.error?.message ||
                                err?.message ||
                                'Image upload failed.';
                            reject(new Error(msg));
                        });
                }),
        );
    }

    abort() {
        // Request cannot be cancelled with axios by default; no-op.
    }
}

export function RichTextUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
        new RichTextUploadAdapter(loader);
}
