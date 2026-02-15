import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Select, message } from 'antd';
import { UploadOutlined, PictureOutlined, PaperClipOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { createPost, getMyRTCs } from '../../../api/feed';

const { TextArea } = Input;
const { Option } = Select;

const CreatePostModal = ({ visible, onCancel, onSuccess }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [myRTCs, setMyRTCs] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchMyRTCs();
            form.resetFields();
            setImageList([]);
            setFileList([]);
        }
    }, [visible]);

    const fetchMyRTCs = async () => {
        try {
            const data = await getMyRTCs();
            setMyRTCs(data);
        } catch (error) {
            console.error('Failed to fetch RTCs', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = new FormData();
            formData.append('title', values.title);
            if (values.description) formData.append('description', values.description);
            formData.append('content', values.content);
            formData.append('rtc', values.rtc);
            formData.append('status', 'PENDING');

            if (imageList.length > 0 && imageList[0].originFileObj) {
                formData.append('image', imageList[0].originFileObj);
            }
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('attachment', fileList[0].originFileObj);
            }

            await createPost(formData);
            message.success(t('post_created') || 'Post created successfully!');
            onSuccess();
            onCancel();
        } catch (error) {
            if (error.response?.data) {
                const errors = error.response.data;
                const fieldErrors = Object.entries(errors).map(([field, msgs]) => ({
                    name: field,
                    errors: Array.isArray(msgs) ? msgs : [msgs]
                }));
                form.setFields(fieldErrors);
            } else {
                message.error(t('post_create_error') || 'Failed to create post');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={t('create_post') || 'Create Post'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText={t('publish') || 'Publish'}
            cancelText={t('cancel') || 'Cancel'}
            width={600}
            destroyOnClose
            styles={{ body: { maxHeight: '65vh', overflowY: 'auto', paddingRight: 8 } }}
        >
            <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                <Form.Item
                    name="rtc"
                    label={t('select_rtc') || 'Post as RTC'}
                    rules={[{ required: true, message: t('rtc_required') || 'Please select an RTC' }]}
                >
                    <Select
                        placeholder={t('select_rtc_placeholder') || 'Select your RTC...'}
                        size="large"
                        showSearch
                        optionFilterProp="children"
                    >
                        {myRTCs.map(rtc => (
                            <Option key={rtc.id} value={rtc.id}>{rtc.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="title"
                    label={t('title') || 'Title'}
                    rules={[{ required: true, message: t('title_required') || 'Please enter a title' }]}
                >
                    <Input size="large" placeholder={t('post_title_placeholder') || 'Enter post title...'} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={t('description') || 'Short Description'}
                >
                    <Input placeholder={t('description_placeholder') || 'Brief summary (optional)'} />
                </Form.Item>

                <Form.Item
                    name="content"
                    label={t('content') || 'Content'}
                    rules={[{ required: true, message: t('content_required') || 'Please enter content' }]}
                >
                    <TextArea
                        rows={5}
                        placeholder={t('post_content_placeholder') || 'Write your post content...'}
                    />
                </Form.Item>

                <Form.Item label={t('image') || 'Image'}>
                    <Upload
                        accept="image/*"
                        maxCount={1}
                        fileList={imageList}
                        onChange={({ fileList }) => setImageList(fileList)}
                        beforeUpload={() => false}
                        listType="picture-card"
                    >
                        {imageList.length < 1 && (
                            <div>
                                <PictureOutlined style={{ fontSize: 24 }} />
                                <div style={{ marginTop: 8 }}>{t('upload_image') || 'Upload'}</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

                <Form.Item label={t('attachment') || 'Attachment'}>
                    <Upload
                        maxCount={1}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        beforeUpload={() => false}
                    >
                        {fileList.length < 1 && (
                            <button type="button" style={{
                                border: '1px dashed #d9d9d9',
                                background: 'transparent',
                                padding: '6px 16px',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <PaperClipOutlined /> {t('attach_file') || 'Attach File'}
                            </button>
                        )}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreatePostModal;
