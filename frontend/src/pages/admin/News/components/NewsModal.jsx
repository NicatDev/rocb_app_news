import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, Select, Image, Alert, message } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;

const NewsModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    content: initialValues.content,
                    status: initialValues.status
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
    const FORM_FIELDS = ['title', 'content', 'image'];
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
            formData.append('title', values.title);
            formData.append('content', values.content);

            // Handle Image
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            } else if (fileList.length === 0 && initialValues?.image) {
                // If file list empty but we had an image, it means user removed it? 
                // Or we need a way to signal deletion. For now, assuming if no new file, keep old unless explicitly deleted logic is added.
                // If backend expects 'image' to be null to delete, we'd need a clear flag.
                // For simple update: if no new file, don't send 'image' key, backend keeps current.
            }

            // Status is read-only in edit, and not sent in create (defaults to pending)
            // But if we want to change content without changing status, we don't need to send it if it's not editable.

            onOk(formData);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

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
                <Form
                    form={form}
                    layout="vertical"
                    name="news_form"
                >
                    {initialValues && (
                        <Alert
                            message={`${t('current_status')}: ${initialValues.status}`}
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Form.Item
                        name="title"
                        label={t('title')}
                        rules={[{ required: true, message: t('please_enter_title') }]}
                    >
                        <Input placeholder={t('news_title_placeholder')} />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label={t('content')}
                        rules={[{ required: true, message: t('please_enter_content') }]}
                    >
                        <TextArea rows={6} placeholder={t('news_content_placeholder')} />
                    </Form.Item>

                    <Form.Item
                        label={t('image')}
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleChange}
                            beforeUpload={() => false} // Prevent auto upload
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
                                const image = new Image();
                                image.src = src;
                                const imgWindow = window.open(src);
                                imgWindow?.document.write(image.outerHTML);
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

                    {/* 
                       Hidden Status Field or just dont render it. 
                       User said: "status onlyread olsun" (status should be read-only).
                       "createde de status secmek olmasin" (create should not choose status).
                    */}
                </Form>
            </div>
        </Modal>
    );
};

export default NewsModal;
