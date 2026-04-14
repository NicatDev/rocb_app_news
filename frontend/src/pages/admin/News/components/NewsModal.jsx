import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, Image as AntImage, Alert, message } from 'antd';
import { UploadOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

const NewsModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);
    const [extraFileList, setExtraFileList] = useState([]);
    const [hiddenExtraIds, setHiddenExtraIds] = useState([]);

    useEffect(() => {
        if (visible) {
            setHiddenExtraIds([]);
            setExtraFileList([]);
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    summary: initialValues.summary,
                    content: initialValues.content,
                    status: initialValues.status,
                });
                if (initialValues.image) {
                    setFileList([
                        {
                            uid: '-1',
                            name: 'image.png',
                            status: 'done',
                            url: initialValues.image,
                        },
                    ]);
                } else {
                    setFileList([]);
                }
            } else {
                form.resetFields();
                setFileList([]);
            }
        }
    }, [visible, initialValues, form]);

    const FORM_FIELDS = ['title', 'summary', 'content', 'image'];
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

    const visibleExtraImages =
        initialValues?.extra_images?.filter((img) => img?.id && !hiddenExtraIds.includes(img.id)) || [];

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                const formData = new FormData();
                formData.append('title', values.title);
                formData.append('summary', values.summary ?? '');
                formData.append('content', values.content);

                if (fileList.length > 0 && fileList[0].originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }

                const newExtraFiles = extraFileList.filter((f) => f.originFileObj).map((f) => f.originFileObj);

                onOk({
                    formData,
                    newExtraFiles,
                    removedExtraImageIds: [...hiddenExtraIds],
                });
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleMainImageChange = ({ fileList: newFileList }) => setFileList(newFileList);
    const handleExtraChange = ({ fileList: newFileList }) => setExtraFileList(newFileList);

    return (
        <Modal
            title={initialValues ? t('edit_news') : t('create_news')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={800}
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

                    <Form.Item name="content" label={t('content')} rules={[{ required: true, message: t('please_enter_content') }]}>
                        <TextArea rows={6} placeholder={t('news_content_placeholder')} />
                    </Form.Item>

                    <Form.Item label={t('image')}>
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleMainImageChange}
                            beforeUpload={() => false}
                            maxCount={1}
                            onPreview={async (file) => {
                                let src = file.url;
                                if (!src) {
                                    src = await new Promise((resolve) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file.originFileObj);
                                        reader.onload = () => resolve(reader.result);
                                    });
                                }
                                const imgEl = new window.Image();
                                imgEl.src = src;
                                const imgWindow = window.open(src);
                                imgWindow?.document.write(imgEl.outerHTML);
                            }}
                        >
                            {fileList.length < 1 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>{t('upload')}</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    {visibleExtraImages.length > 0 && (
                        <Form.Item label={t('existing_extra_images') || 'Existing gallery images'}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                {visibleExtraImages.map((img) => (
                                    <div key={img.id} style={{ position: 'relative', width: 96, height: 96 }}>
                                        <AntImage src={img.image} alt="" width={96} height={96} style={{ objectFit: 'cover', borderRadius: 8 }} />
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<CloseCircleOutlined />}
                                            style={{ position: 'absolute', top: -8, right: -8 }}
                                            onClick={() => setHiddenExtraIds((prev) => [...prev, img.id])}
                                            aria-label={t('remove') || 'Remove'}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Form.Item>
                    )}

                    <Form.Item label={t('extra_images') || 'Additional images'}>
                        <Upload
                            listType="picture-card"
                            fileList={extraFileList}
                            onChange={handleExtraChange}
                            beforeUpload={() => false}
                            multiple
                            onPreview={async (file) => {
                                let src = file.url;
                                if (!src && file.originFileObj) {
                                    src = await new Promise((resolve) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file.originFileObj);
                                        reader.onload = () => resolve(reader.result);
                                    });
                                }
                                if (src) window.open(src);
                            }}
                        >
                            <div>
                                <UploadOutlined />
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
