import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography, message, Skeleton, Upload, Tooltip, Modal, Input } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../../api/axios';
import styles from './style.module.scss';

const { Title } = Typography;
const { TextArea } = Input;

// Inline Editable Field Component
const EditableField = ({ name, label, value, onSave, type = 'text', rows = 1 }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(name, currentValue);
            setIsEditing(false);
            message.success(t('field_updated') || 'Field updated successfully');
        } catch (error) {
            console.error('Failed to update field', error);
            message.error(t('failed_to_update_field') || 'Failed to update field');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentValue(value);
        setIsEditing(false);
    };

    const renderInput = () => {
        if (type === 'textarea') {
            return <TextArea rows={rows} value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />;
        } else if (type === 'number') {
            return <Input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />;
        }
        return <Input value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />;
    };

    return (
        <div className={styles.editableField}>
            <div className={styles.label}>{label}</div>

            {!isEditing ? (
                <div className={styles.valueDisplay}>
                    <div className={styles.value}>
                        {value ? value : <span className={styles.emptyValue}>{t('empty') || 'Empty'}</span>}
                    </div>
                    <Tooltip title={t('edit')}>
                        <EditOutlined className={styles.editIcon} onClick={() => setIsEditing(true)} />
                    </Tooltip>
                </div>
            ) : (
                <div className={styles.editForm}>
                    <div className={styles.inputWrapper}>
                        {renderInput()}
                    </div>
                    <div className={styles.actionButtons}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={loading}
                            size="small"
                        />
                        <Button
                            icon={<CloseOutlined />}
                            onClick={handleCancel}
                            disabled={loading}
                            size="small"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Logo Manager Component
const LogoManager = ({ logoUrl, onUpdate, onDelete }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleUpload = async (file) => {
        setLoading(true);
        try {
            await onUpdate(file);
            message.success(t('logo_updated') || 'Logo updated successfully');
        } catch (error) {
            console.error('Failed to update logo', error);
            message.error(t('failed_to_update_logo') || 'Failed to update logo');
        } finally {
            setLoading(false);
        }
        return false; // Prevent default upload behavior
    };

    const handleDelete = () => {
        Modal.confirm({
            title: t('are_you_sure_delete_logo') || 'Are you sure you want to delete the logo?',
            okText: t('delete'),
            cancelText: t('cancel'),
            okType: 'danger',
            onOk: async () => {
                setLoading(true);
                try {
                    await onDelete();
                    message.success(t('logo_deleted') || 'Logo deleted successfully');
                } catch (error) {
                    console.error('Failed to delete logo', error);
                    message.error(t('failed_to_delete_logo') || 'Failed to delete logo');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    return (
        <Card title={t('branding') || 'Branding'} className={styles.card}>
            <div className={styles.logoContainer}>
                {logoUrl ? (
                    <div className={styles.currentLogo}>
                        <img src={logoUrl} alt="RTC Logo" />
                        <Button
                            type="danger"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            size="small"
                            className={styles.deleteBtn}
                            onClick={handleDelete}
                            loading={loading}
                        />
                    </div>
                ) : (
                    <div className={styles.noLogo}>{t('no_logo') || 'No logo uploaded'}</div>
                )}

                <div className={styles.uploadArea}>
                    <Upload
                        showUploadList={false}
                        beforeUpload={handleUpload}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />} loading={loading}>
                            {logoUrl ? t('change_logo') || 'Change Logo' : t('upload_logo') || 'Upload Logo'}
                        </Button>
                    </Upload>
                </div>
            </div>
        </Card>
    );
};

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [rtcData, setRtcData] = useState(null);

    useEffect(() => {
        fetchRTCData();
    }, []);

    const fetchRTCData = async () => {
        try {
            const response = await axiosInstance.get('/admin/my-rtc/');
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);

            if (data.length > 0) {
                setRtcData(data[0]);
            } else {
                message.warning(t('no_rtc_found') || 'No RTC found for this user.');
            }
        } catch (error) {
            console.error('Failed to fetch RTC data', error);
            message.error(t('failed_to_load_rtc') || 'Failed to load RTC data');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldSave = async (fieldName, value) => {
        if (!rtcData) return;

        // Optimistic update
        const oldValue = rtcData[fieldName];
        setRtcData({ ...rtcData, [fieldName]: value });

        try {
            await axiosInstance.patch(`/admin/my-rtc/${rtcData.id}/`, { [fieldName]: value });
            // Ideally refetch to ensure sync, but optimistic update feels faster
        } catch (error) {
            // Revert on failure
            setRtcData({ ...rtcData, [fieldName]: oldValue });
            throw error;
        }
    };

    const handleLogoUpdate = async (file) => {
        if (!rtcData) return;

        const formData = new FormData();
        formData.append('logo', file);

        const response = await axiosInstance.patch(`/admin/my-rtc/${rtcData.id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        setRtcData(response.data);
    };

    const handleLogoDelete = async () => {
        if (!rtcData) return;

        // Send empty string or null to clear image? 
        // Standard way depends on backend. Usually sending null works if configured, or a specific endpoint.
        // Assuming DRF handles null for ImageField if allowed.
        // Alternatively, could use a separate delete endpoint if implemented.
        // Sending 'logo': null

        const response = await axiosInstance.patch(`/admin/my-rtc/${rtcData.id}/`, { logo: null });
        setRtcData(response.data);
    };

    if (loading) return <Skeleton active />;
    if (!rtcData) return <div>{t('no_rtc_assigned') || 'No RTC Profile assigned to your account.'}</div>;

    return (
        <div className={styles.dashboardContainer}>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <Card title={t('basic_information') || 'Basic Information'} className={styles.card}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <EditableField name="name" label={t('rtc_name')} value={rtcData.name} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="host_country" label={t('host_country')} value={rtcData.host_country} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24}>
                                <EditableField name="address" label={t('address')} value={rtcData.address} onSave={handleFieldSave} type="textarea" />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="website" label={t('website')} value={rtcData.website} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="phone_number" label={t('phone_number')} value={rtcData.phone_number} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="establishment_year" label={t('establishment_year')} value={rtcData.establishment_year} onSave={handleFieldSave} type="number" />
                            </Col>
                        </Row>
                    </Card>

                    <Card title={t('Director & Contact') || 'Director & Contact'} className={styles.card}>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <EditableField name="director_name" label={t('director_name')} value={rtcData.director_name} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="director_email" label={t('director_email')} value={rtcData.director_email} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24}>
                                <EditableField name="director_bio" label={t('director_bio')} value={rtcData.director_bio} onSave={handleFieldSave} type="textarea" rows={4} />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="contact_person_name" label={t('contact_person_name')} value={rtcData.contact_person_name} onSave={handleFieldSave} />
                            </Col>
                            <Col xs={24} md={12}>
                                <EditableField name="contact_person_email" label={t('contact_person_email')} value={rtcData.contact_person_email} onSave={handleFieldSave} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <LogoManager
                        logoUrl={rtcData.logo}
                        onUpdate={handleLogoUpdate}
                        onDelete={handleLogoDelete}
                    />

                    <Card title={t('location') || 'Location'} className={styles.card}>
                        {/* Map Picker Placeholder - could be made editable if it returns a string/coords */}
                        <div>Map Component Placeholder</div>
                    </Card>

                    <Card title={t('details') || 'Details'} className={styles.card}>
                        <EditableField name="mission_statement" label={t('mission_statement')} value={rtcData.mission_statement} onSave={handleFieldSave} type="textarea" rows={3} />
                        <EditableField name="overview_text" label={t('overview_text')} value={rtcData.overview_text} onSave={handleFieldSave} type="textarea" rows={3} />
                        <EditableField name="specialization_areas" label={t('specialization_areas')} value={rtcData.specialization_areas} onSave={handleFieldSave} type="textarea" rows={2} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
