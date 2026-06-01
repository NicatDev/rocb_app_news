import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Avatar, Upload, Spin, Tag, message, Input, Button, Form } from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, BankOutlined,
    EditOutlined, CheckOutlined, CloseOutlined, CameraOutlined,
    CalendarOutlined, TeamOutlined, FieldStringOutlined, LockOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getProfile, updateProfile, changePassword } from '../../api/profile';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { Password } = Input;

const Profile = () => {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingField, setEditingField] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordForm] = Form.useForm();

    useEffect(() => {
        if (!user) {
            return;
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            message.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (field, value) => {
        setEditingField(field);
        setEditValue(value || '');
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleSave = async (field) => {
        try {
            setSaving(true);
            const data = await updateProfile({ [field]: editValue });
            setProfile(data);
            setEditingField(null);
            setEditValue('');
            message.success(t('profile_updated') || 'Profile updated');
        } catch (error) {
            message.error(t('profile_update_error') || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            setSaving(true);
            const data = await updateProfile(formData);
            setProfile(data);
            message.success(t('avatar_updated') || 'Avatar updated');
        } catch (error) {
            message.error(t('avatar_update_error') || 'Failed to update avatar');
        } finally {
            setSaving(false);
        }
        return false; // Prevent default upload
    };

    const handleTogglePasswordForm = () => {
        if (changePasswordOpen) {
            passwordForm.resetFields();
        }
        setChangePasswordOpen((open) => !open);
    };

    const applyPasswordServerErrors = (data) => {
        if (!data || typeof data !== 'object') {
            message.error(t('password_change_error', { defaultValue: 'Failed to change password' }));
            return;
        }
        if (data.detail) {
            message.error(data.detail);
        }
        const fieldEntries = Object.entries(data).filter(([key]) => key !== 'detail');
        if (fieldEntries.length) {
            passwordForm.setFields(
                fieldEntries.map(([name, errors]) => ({
                    name,
                    errors: Array.isArray(errors) ? errors.map(String) : [String(errors)],
                }))
            );
        } else if (!data.detail) {
            message.error(t('password_change_error', { defaultValue: 'Failed to change password' }));
        }
    };

    const handlePasswordSubmit = async (values) => {
        try {
            setPasswordSaving(true);
            await changePassword(values);
            passwordForm.resetFields();
            setChangePasswordOpen(false);
            message.success(t('password_changed_success', { defaultValue: 'Password updated successfully' }));
        } catch (error) {
            applyPasswordServerErrors(error.response?.data);
        } finally {
            setPasswordSaving(false);
        }
    };

    const editableFields = [
        { key: 'first_name', label: t('first_name') || 'First Name', icon: <UserOutlined /> },
        { key: 'last_name', label: t('last_name') || 'Last Name', icon: <UserOutlined /> },
        { key: 'email', label: t('email') || 'Email', icon: <MailOutlined /> },
        { key: 'phone_number', label: t('phone') || 'Phone', icon: <PhoneOutlined /> },
        { key: 'company', label: t('company') || 'Company', icon: <BankOutlined /> },
        { key: 'field', label: t('industry') || 'Industry / Sector', icon: <FieldStringOutlined /> },
    ];

    if (authLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.profileContainer} style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Title level={3}>{t('login_required') || 'Please log in to view your profile'}</Title>
                <Link to="/login">
                    <Button type="primary">{t('login') || 'Login'}</Button>
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className={styles.profileContainer}>
            {/* Avatar Section */}
            <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                    <Avatar
                        size={120}
                        src={profile.avatar}
                        icon={!profile.avatar && <UserOutlined />}
                        className={styles.avatar}
                    />
                    <Upload
                        showUploadList={false}
                        accept="image/*"
                        beforeUpload={handleAvatarUpload}
                    >
                        <div className={styles.avatarOverlay}>
                            <CameraOutlined className={styles.cameraIcon} />
                        </div>
                    </Upload>
                </div>
                <div className={styles.userNameSection}>
                    <Title level={3} className={styles.displayName}>
                        {profile.first_name || profile.last_name
                            ? `${profile.first_name} ${profile.last_name}`.trim()
                            : profile.username}
                    </Title>
                    <Text className={styles.usernameTag}>@{profile.username}</Text>
                    <Text className={styles.joinDate}>
                        <CalendarOutlined /> {t('joined') || 'Joined'} {dayjs(profile.date_joined).format('MMMM YYYY')}
                    </Text>
                </div>
            </div>

            {/* RTC Memberships */}
            {profile.my_rtcs && profile.my_rtcs.length > 0 && (
                <div className={styles.sectionCard}>
                    <div className={styles.sectionTitle}>
                        <TeamOutlined />
                        <span>{t('my_rtcs_label') || 'My RTCs'}</span>
                    </div>
                    <div className={styles.rtcTags}>
                        {profile.my_rtcs.map(rtc => (
                            <Tag key={rtc.id} color="blue" className={styles.rtcTag}>
                                {rtc.name}
                            </Tag>
                        ))}
                    </div>
                </div>
            )}

            {/* Editable Fields */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                    <UserOutlined />
                    <span>{t('personal_info') || 'Personal Information'}</span>
                </div>
                <div className={styles.fieldsList}>
                    {/* Username (read-only) */}
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldIcon}><UserOutlined /></div>
                        <div className={styles.fieldContent}>
                            <Text className={styles.fieldLabel}>{t('username') || 'Username'}</Text>
                            <Text className={styles.fieldValue}>{profile.username}</Text>
                        </div>
                        <div className={styles.fieldAction} />
                    </div>

                    {editableFields.map(({ key, label, icon }) => (
                        <div key={key} className={styles.fieldRow}>
                            <div className={styles.fieldIcon}>{icon}</div>
                            <div className={styles.fieldContent}>
                                <Text className={styles.fieldLabel}>{label}</Text>
                                {editingField === key ? (
                                    <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onPressEnter={() => handleSave(key)}
                                        autoFocus
                                        size="small"
                                        className={styles.editInput}
                                    />
                                ) : (
                                    <Text className={styles.fieldValue}>
                                        {profile[key] || <span className={styles.emptyValue}>{t('not_set') || 'Not set'}</span>}
                                    </Text>
                                )}
                            </div>
                            <div className={styles.fieldAction}>
                                {editingField === key ? (
                                    <div className={styles.editActions}>
                                        <button
                                            className={styles.saveBtn}
                                            onClick={() => handleSave(key)}
                                            disabled={saving}
                                        >
                                            <CheckOutlined />
                                        </button>
                                        <button
                                            className={styles.cancelBtn}
                                            onClick={handleCancel}
                                        >
                                            <CloseOutlined />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.editBtn}
                                        onClick={() => handleEdit(key, profile[key])}
                                    >
                                        <EditOutlined />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Change password */}
            <div className={styles.sectionCard}>
                <div className={styles.sectionTitle}>
                    <LockOutlined />
                    <span>{t('security', { defaultValue: 'Security' })}</span>
                </div>
                {!changePasswordOpen ? (
                    <Button
                        type="default"
                        icon={<LockOutlined />}
                        className={styles.changePasswordToggle}
                        onClick={handleTogglePasswordForm}
                    >
                        {t('change_password', { defaultValue: 'Change password' })}
                    </Button>
                ) : (
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        className={styles.passwordForm}
                        onFinish={handlePasswordSubmit}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="old_password"
                            label={t('old_password', { defaultValue: 'Current password' })}
                            rules={[
                                {
                                    required: true,
                                    message: t('enter_old_password', { defaultValue: 'Enter your current password' }),
                                },
                            ]}
                        >
                            <Password
                                prefix={<LockOutlined className={styles.passwordIcon} />}
                                placeholder={t('enter_old_password', { defaultValue: 'Enter your current password' })}
                                autoComplete="current-password"
                                size="large"
                                className={styles.passwordInput}
                            />
                        </Form.Item>
                        <Form.Item
                            name="new_password"
                            label={t('new_password', { defaultValue: 'New password' })}
                            rules={[
                                {
                                    required: true,
                                    message: t('enter_new_password', { defaultValue: 'Enter a new password' }),
                                },
                                { min: 8, message: t('enter_new_password', { defaultValue: 'Enter a new password' }) },
                            ]}
                        >
                            <Password
                                prefix={<LockOutlined className={styles.passwordIcon} />}
                                placeholder={t('enter_new_password', { defaultValue: 'Enter a new password' })}
                                autoComplete="new-password"
                                size="large"
                                className={styles.passwordInput}
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirm_password"
                            label={t('confirm_password', { defaultValue: 'Confirm new password' })}
                            dependencies={['new_password']}
                            rules={[
                                {
                                    required: true,
                                    message: t('enter_confirm_password', { defaultValue: 'Confirm your new password' }),
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error(
                                                t('passwords_do_not_match', { defaultValue: 'Passwords do not match' })
                                            )
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Password
                                prefix={<LockOutlined className={styles.passwordIcon} />}
                                placeholder={t('enter_confirm_password', { defaultValue: 'Confirm your new password' })}
                                autoComplete="new-password"
                                size="large"
                                className={styles.passwordInput}
                            />
                        </Form.Item>
                        <div className={styles.passwordActions}>
                            <Button
                                type="default"
                                onClick={handleTogglePasswordForm}
                                disabled={passwordSaving}
                            >
                                {t('cancel_change_password', { defaultValue: 'Cancel' })}
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={passwordSaving}
                                className={styles.passwordSubmitBtn}
                            >
                                {t('save_password', { defaultValue: 'Update password' })}
                            </Button>
                        </div>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default Profile;
