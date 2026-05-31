import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Alert, message, DatePicker } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import RichTextEditor from '../../../../components/common/RichTextEditor';

const { TextArea } = Input;

const NewsModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);
    const [galleryList, setGalleryList] = useState([]);
    const [removedExtraIds, setRemovedExtraIds] = useState([]);
    const [contentEditorKey, setContentEditorKey] = useState('news-content');

    useEffect(() => {
        if (!visible) return;

        setContentEditorKey(`news-content-${initialValues?.id ?? 'new'}-${Date.now()}`);
        setRemovedExtraIds([]);

        if (initialValues) {
            form.setFieldsValue({
                title: initialValues.title,
                summary: initialValues.summary,
                content: initialValues.content,
                status: initialValues.status,
                news_date: initialValues.news_date ? dayjs(initialValues.news_date) : null,
            });
            if (initialValues.image) {
                setFileList([
                    {
                        uid: 'cover',
                        name: 'cover.jpg',
                        status: 'done',
                        url: initialValues.image,
                    },
                ]);
            } else {
                setFileList([]);
            }
            const existingGallery = (initialValues.extra_images || []).map((img) => ({
                uid: `extra-${img.id}`,
                extraImageId: img.id,
                name: `gallery-${img.id}.jpg`,
                status: 'done',
                url: img.image,
            }));
            setGalleryList(existingGallery);
        } else {
            form.resetFields();
            setFileList([]);
            setGalleryList([]);
        }
    }, [visible, initialValues, form]);

    const FORM_FIELDS = ['title', 'summary', 'content', 'image', 'news_date'];
    useEffect(() => {
        if (serverErrors && typeof serverErrors === 'object') {
            const fieldErrors = [];
            const nonFieldMessages = [];

            Object.entries(serverErrors).forEach(([key, value]) => {
                const errMsg = Array.isArray(value) ? value.join(', ') : String(value);
                if (FORM_FIELDS.includes(key)) {
                    fieldErrors.push({ name: key, errors: Array.isArray(value) ? value : [String(value)] });
                } else if (key === 'non_field_errors' || key === 'detail') {
                    nonFieldMessages.push(errMsg);
                } else {
                    nonFieldMessages.push(`${key}: ${errMsg}`);
                }
            });

            if (fieldErrors.length > 0) {
                form.setFields(fieldErrors);
            }
            if (nonFieldMessages.length > 0) {
                nonFieldMessages.forEach((msg) => message.error(msg));
            }
        }
    }, [serverErrors, form]);

    const handleGalleryChange = ({ fileList: nextList }) => {
        const prevExistingIds = galleryList
            .filter((f) => f.extraImageId)
            .map((f) => f.extraImageId);
        const nextExistingIds = nextList
            .filter((f) => f.extraImageId)
            .map((f) => f.extraImageId);
        const newlyRemoved = prevExistingIds.filter((id) => !nextExistingIds.includes(id));
        if (newlyRemoved.length > 0) {
            setRemovedExtraIds((prev) => [...new Set([...prev, ...newlyRemoved])]);
        }
        setGalleryList(nextList);
    };

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                const formData = new FormData();
                formData.append('title', values.title);
                formData.append('summary', values.summary ?? '');
                formData.append('content', values.content);
                if (values.news_date) {
                    formData.append('news_date', values.news_date.format('YYYY-MM-DD'));
                } else {
                    formData.append('news_date', '');
                }

                if (fileList.length > 0 && fileList[0].originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }

                const newExtraFiles = galleryList
                    .filter((f) => f.originFileObj)
                    .map((f) => f.originFileObj);

                onOk({
                    formData,
                    newExtraFiles,
                    removedExtraImageIds: [...removedExtraIds],
                });
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const previewFile = async (file) => {
        let src = file.url;
        if (!src && file.originFileObj) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        if (src) window.open(src);
    };

    return (
        <Modal
            title={initialValues ? t('edit_news') : t('create_news')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={800}
            focusable={{ trap: false }}
        >
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                <Form form={form} layout="vertical" name="news_form">
                    {initialValues && (
                        <Alert
                            message={`${t('current_status')}: ${initialValues.status}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form.Item name="title" label={t('title')} rules={[{ required: true, message: t('please_enter_title') }]}>
                        <Input placeholder={t('news_title_placeholder')} />
                    </Form.Item>

                    <Form.Item name="summary" label={t('summary') || 'Summary'}>
                        <TextArea rows={3} placeholder={t('news_summary_placeholder') || ''} />
                    </Form.Item>

                    <Form.Item name="news_date" label={t('date') || 'Date'}>
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item name="content" label={t('content')} rules={[{ required: true, message: t('please_enter_content') }]}>
                        <RichTextEditor instanceKey={contentEditorKey} />
                    </Form.Item>

                    <Form.Item label={t('cover_image') || t('image')}>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList: next }) => setFileList(next)}
                            beforeUpload={() => false}
                            maxCount={1}
                            onPreview={previewFile}
                        >
                            {fileList.length < 1 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>{t('upload')}</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        label={t('extra_images') || 'Gallery images'}
                        extra={t('extra_images_hint') || 'Add multiple images. Click the X on a thumbnail to remove it.'}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={galleryList}
                            onChange={handleGalleryChange}
                            beforeUpload={() => false}
                            multiple
                            accept="image/*"
                            onPreview={previewFile}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>{t('upload')}</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default NewsModal;
