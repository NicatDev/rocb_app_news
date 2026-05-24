import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, BankOutlined, PhoneOutlined, SolutionOutlined, LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './style.module.scss';

const { Title } = Typography;

const Register = () => {
    const { t, i18n } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const success = await register(values);
            if (success) {
                navigate('/login');
            }
        } catch (error) {
            // Error handled in context or here
        } finally {
            setLoading(false);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.backToMain}>
                <Button
                    type="text"
                    href="https://rtc.rocbeurope.org/"
                    icon={<LeftOutlined />}
                    className={styles.backButton}
                >
                    {t('back_to_main_site')}
                </Button>
            </div>
            <div className={styles.langSwitch}>
                <Button type="text" onClick={() => changeLanguage('en')}>EN</Button>
                <Button type="text" onClick={() => changeLanguage('ru')}>RU</Button>
            </div>
            <Card className={styles.authCard} style={{ width: 600 }}>
                <div className={styles.logoContainer}>
                    <img src="/logo2.png" alt="Rocb Europe" className={styles.logo} />
                </div>
                <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>{t('register')}</Title>
                <Form
                    name="register_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="username" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} placeholder={t('username')} />
                        </Form.Item>
                        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                            <Input prefix={<MailOutlined />} placeholder={t('email')} />
                        </Form.Item>
                        <Form.Item name="first_name" rules={[{ required: true }]}>
                            <Input placeholder={t('first_name')} />
                        </Form.Item>
                        <Form.Item name="last_name" rules={[{ required: true }]}>
                            <Input placeholder={t('last_name')} />
                        </Form.Item>
                        <Form.Item name="company" rules={[{ required: true }]}>
                            <Input prefix={<BankOutlined />} placeholder={t('company')} />
                        </Form.Item>
                        <Form.Item name="phone_number">
                            <Input prefix={<PhoneOutlined />} placeholder={t('phone_number')} />
                        </Form.Item>
                        <Form.Item name="field" style={{ gridColumn: 'span 2' }}>
                            <Input prefix={<SolutionOutlined />} placeholder={t('field_placeholder')} />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true }]} style={{ gridColumn: 'span 2' }}>
                            <Input.Password prefix={<LockOutlined />} placeholder={t('password')} />
                        </Form.Item>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {t('register')}
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/login">{t('already_have_account')}</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
