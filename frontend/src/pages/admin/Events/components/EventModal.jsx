import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, Select, DatePicker, InputNumber, Alert, message } from 'antd';
import { UploadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const EventModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    topic: initialValues.topic,
                    event_date: initialValues.event_date ? dayjs(initialValues.event_date) : null,
                    summary: initialValues.summary,
                    participant_count: initialValues.participant_count,
                    status: initialValues.status
                });
                
                if (initialValues.event_files && initialValues.event_files.length > 0) {
                    setFileList(initialValues.event_files.map(ef => ({
                        uid: ef.id,
                        name: ef.file.split('/').pop(),
                        status: 'done',
                        url: ef.file,
                    })));
                } else if (initialValues.report_file) {
                    setFileList([{
                        uid: '-1',
                        name: 'report.pdf',
                        status: 'done',
                        url: initialValues.report_file,
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
    const FORM_FIELDS = ['title', 'topic', 'event_date', 'summary', 'participant_count'];
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
            formData.append('topic', values.topic);
            formData.append('event_date', values.event_date.format('YYYY-MM-DD'));

            if (values.summary) {
                formData.append('summary', values.summary);
            }
            if (values.participant_count) {
                formData.append('participant_count', values.participant_count);
            }

            // Track deleted files
            const deletedFiles = [];
            if (initialValues?.event_files) {
                initialValues.event_files.forEach(ef => {
                    if (!fileList.find(f => f.uid === ef.id)) {
                        deletedFiles.push(ef.id);
                    }
                });
            }
            deletedFiles.forEach(id => formData.append('deleted_files', id));

            // Append new files
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('files', file.originFileObj);
                }
            });

            onOk(formData);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleBeforeUpload = (file) => {
        setFileList(prev => {
            // Check for duplicates before appending
            const isDuplicate = prev.some(item => item.name === file.name && item.size === file.size);
            if (isDuplicate) return prev;
            return [...prev, {
                uid: file.uid || file.name,
                name: file.name,
                status: 'done',
                originFileObj: file,
            }];
        });
        return false; // Prevent auto upload
    };

    const handleRemove = (file) => {
        setFileList(prev => prev.filter(item => item.uid !== file.uid));
    };

    return (
        <Modal
            title={initialValues ? t('edit_event') : t('create_event')}
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
                    name="event_form"
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
                        <Input placeholder={t('event_title_placeholder') || 'Enter event title'} />
                    </Form.Item>

                    <Form.Item
                        name="topic"
                        label={t('topic')}
                        rules={[{ required: true, message: t('please_enter_topic') || 'Please enter topic' }]}
                    >
                        <Input placeholder={t('event_topic_placeholder') || 'Enter event topic'} />
                    </Form.Item>

                    <Form.Item
                        name="event_date"
                        label={t('event_date') || 'Event Date'}
                        rules={[{ required: true, message: t('please_select_date') || 'Please select date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="summary"
                        label={t('summary')}
                    >
                        <TextArea rows={4} placeholder={t('event_summary_placeholder') || 'Enter event summary'} />
                    </Form.Item>

                    <Form.Item
                        name="participant_count"
                        label={t('participant_count') || 'Participant Count'}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} placeholder={t('participant_count_placeholder') || 'Enter number of participants'} />
                    </Form.Item>

                    <Form.Item
                        label={t('event_files') || 'Event Files'}
                    >
                        <Upload
                            fileList={fileList}
                            beforeUpload={handleBeforeUpload}
                            onRemove={handleRemove}
                            multiple={true} // Allow multiple selection if user wants
                            maxCount={20}
                        >
                            <Button icon={<UploadOutlined />}>
                                {fileList.length > 0 ? (t('add_another_file') || 'Add another file') : (t('add_file') || 'Add File')}
                            </Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default EventModal;
