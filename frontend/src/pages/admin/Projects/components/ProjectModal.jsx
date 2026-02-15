import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Alert, message } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

const ProjectModal = ({ visible, onCancel, onOk, initialValues, loading, serverErrors }) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    name: initialValues.name,
                    description: initialValues.description,
                    timeframe: initialValues.timeframe,
                    partners: initialValues.partners,
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialValues, form]);

    // Handle server-side validation errors
    const FORM_FIELDS = ['name', 'description', 'timeframe', 'partners'];
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
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('timeframe', values.timeframe);
            formData.append('partners', values.partners);

            onOk(formData);
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    return (
        <Modal
            title={initialValues ? t('edit_project') : t('create_project')}
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
                    name="project_form"
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
                        name="name"
                        label={t('project_name') || 'Project Name'}
                        rules={[{ required: true, message: t('please_enter_project_name') || 'Please enter project name' }]}
                    >
                        <Input placeholder={t('project_name_placeholder') || 'Enter project name'} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={t('description')}
                        rules={[{ required: true, message: t('please_enter_description') || 'Please enter description' }]}
                    >
                        <TextArea rows={4} placeholder={t('project_description_placeholder') || 'Enter project overview'} />
                    </Form.Item>

                    <Form.Item
                        name="timeframe"
                        label={t('timeframe') || 'Timeframe'}
                        rules={[{ required: true, message: t('please_enter_timeframe') || 'Please enter timeframe' }]}
                    >
                        <Input placeholder={t('timeframe_placeholder') || 'e.g., 2024-2026'} />
                    </Form.Item>

                    <Form.Item
                        name="partners"
                        label={t('partners') || 'Partners'}
                        rules={[{ required: true, message: t('please_enter_partners') || 'Please enter partners' }]}
                    >
                        <Input placeholder={t('partners_placeholder') || 'Partners involved'} />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default ProjectModal;
