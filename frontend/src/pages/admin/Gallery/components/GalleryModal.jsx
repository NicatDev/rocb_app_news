import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Alert, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const GalleryModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    caption: initialValues.caption,
                });
                if (initialValues.image) {
                    setFileList([{
                        uid: '-1',
                        name: 'image.png',
                        status: 'done',
                        url: initialValues.image,
                    }]);
                } else {
                    setFileList([]);
                }
            } else {
                form.resetFields();
                setFileList([]);
            }
        }
    }, [visible, initialValues, form]);

    // Handle server-side validation errors
    const FORM_FIELDS = ['caption', 'image'];
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
                nonFieldMessages.forEach(msg => message.error(msg));
            }
        }
    }, [serverErrors, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            const formData = new FormData();

            if (values.caption) {
                formData.append('caption', values.caption);
            }

            // Handle Image
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            }

            onOk(formData);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    return (
        <Modal
            title={initialValues ? t('edit_gallery_image') : t('add_gallery_image')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            width={600}
        >
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                <Form
                    form={form}
                    layout="vertical"
                    name="gallery_form"
                >
                    {initialValues && (
                        <Alert
                            message={`${t('current_status')}: ${t(initialValues.status?.toLowerCase()) || initialValues.status}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form.Item
                        label={t('image')}
                        rules={!initialValues ? [{ required: true, message: t('please_upload_image') || 'Please upload an image' }] : []}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleChange}
                            beforeUpload={() => false}
                            maxCount={1}
                            accept="image/*"
                            onPreview={async (file) => {
                                let src = file.url;
                                if (!src) {
                                    src = await new Promise((resolve) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file.originFileObj);
                                        reader.onload = () => resolve(reader.result);
                                    });
                                }
                                const imgEl = new Image();
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

                    <Form.Item
                        name="caption"
                        label={t('caption') || 'Caption'}
                    >
                        <Input placeholder={t('caption_placeholder') || 'Enter image caption'} />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default GalleryModal;
