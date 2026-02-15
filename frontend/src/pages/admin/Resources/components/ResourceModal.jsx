import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, Select, Alert, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Option } = Select;

const RESOURCE_TYPE_CHOICES = [
    { value: 'TOR', label: 'Mandate / Terms of Reference' },
    { value: 'MOU', label: 'Founding Memorandum' },
    { value: 'STRATEGY', label: 'Strategic Plan' },
    { value: 'PLAN', label: 'Annual Training Plan' },
    { value: 'CATALOGUE', label: 'Training Catalogue' },
    { value: 'REPORT', label: 'Annual Report / Newsletter' },
    { value: 'PUB', label: 'Publication / Handbook' },
    { value: 'ELEARN', label: 'E-Learning Link' },
];

const ResourceModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    title: initialValues.title,
                    resource_type: initialValues.resource_type,
                    description: initialValues.description,
                    external_link: initialValues.external_link,
                });
                if (initialValues.file) {
                    setFileList([{
                        uid: '-1',
                        name: initialValues.file.split('/').pop() || 'file.pdf',
                        status: 'done',
                        url: initialValues.file,
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
    const FORM_FIELDS = ['title', 'resource_type', 'description', 'external_link', 'file'];
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
            formData.append('resource_type', values.resource_type);

            if (values.description) {
                formData.append('description', values.description);
            }
            if (values.external_link) {
                formData.append('external_link', values.external_link);
            }

            // Handle File
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('file', fileList[0].originFileObj);
            }

            onOk(formData);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    return (
        <Modal
            title={initialValues ? t('edit_resource') : t('create_resource')}
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
                    name="resource_form"
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
                        name="title"
                        label={t('title')}
                        rules={[{ required: true, message: t('please_enter_title') }]}
                    >
                        <Input placeholder={t('resource_title_placeholder') || 'Enter resource title'} />
                    </Form.Item>

                    <Form.Item
                        name="resource_type"
                        label={t('resource_type') || 'Resource Type'}
                        rules={[{ required: true, message: t('please_select_resource_type') || 'Please select resource type' }]}
                    >
                        <Select placeholder={t('select_resource_type') || 'Select resource type'}>
                            {RESOURCE_TYPE_CHOICES.map(type => (
                                <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t('description')}
                    >
                        <TextArea rows={4} placeholder={t('resource_description_placeholder') || 'Enter resource description'} />
                    </Form.Item>

                    <Form.Item
                        name="external_link"
                        label={t('external_link') || 'External Link'}
                    >
                        <Input placeholder={t('external_link_placeholder') || 'https://example.com'} />
                    </Form.Item>

                    <Form.Item
                        label={t('file') || 'File (PDF)'}
                    >
                        <Upload
                            fileList={fileList}
                            onChange={handleChange}
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                        >
                            <Button icon={<UploadOutlined />}>{t('upload_file') || 'Upload File'}</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default ResourceModal;
