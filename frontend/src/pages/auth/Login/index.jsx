import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, LeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from './style.module.scss';

const { Title } = Typography;

const Login = () => {
    const { t, i18n } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        const success = await login(values);
        setLoading(false);
        if (success) {
            navigate('/');
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
            <Card className={styles.authCard}>
                <div className={styles.logoContainer}>
                    <img src="/logo.png" alt="Rocb Europe" className={styles.logo} />
                    <Title level={3}>Rocb Europe</Title>
                </div>
                <Title level={4} style={{ textAlign: 'center', marginBottom: 20 }}>{t('login')}</Title>
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder={t('username')} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder={t('password')} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {t('login')}
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Link to="/register">{t('dont_have_account')}</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
