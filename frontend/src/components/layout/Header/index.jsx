import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Space, Typography, Drawer, Grid } from 'antd';
import { UserOutlined, LogoutOutlined, DownOutlined, GlobalOutlined, MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import styles from './style.module.scss';

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const Header = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const changeLanguage = ({ key }) => {
        i18n.changeLanguage(key);
    };

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
            navigate('/');
        } else if (key === 'profile') {
            navigate('/profile');
        } else if (key === 'en' || key === 'ru') {
            changeLanguage({ key });
        }
    };

    const navItems = [
        { key: 'news', label: <Link to="/">{t('news')}</Link> },
        { key: 'feed', label: <Link to="/feed">{t('feed')}</Link> },
        { key: 'rtc-dashboard', label: <Link to="/rtc-dashboard">{t('rtc_dashboard')}</Link> },
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };


    return (
        <AntHeader className={styles.header}>
            <div className={styles.leftSection}>
                <div className={styles.logoArea}>
                    <a href="https://rocbeurope.org">
                        <img src="/logo2.png" alt="Rocb Europe" className={styles.logo} />
                    </a>
                </div>
            </div>

            {/* Desktop Navigation */}
            <div className={styles.navArea}>
                <Menu
                    theme="light"
                    mode="horizontal"
                    defaultSelectedKeys={['news']}
                    selectedKeys={[
                        location.pathname === '/' || location.pathname === '/news' ? 'news' :
                            location.pathname.startsWith('/feed') ? 'feed' :
                                location.pathname.startsWith('/rtc-dashboard') ? 'rtc-dashboard' : ''
                    ]}
                    items={navItems}
                    className={styles.navMenu}
                />
            </div>

            <div className={styles.userArea}>
                <Space size="small" align="center">
                    <Dropdown menu={{
                        items: [
                            { key: 'en', label: 'English', onClick: () => changeLanguage({ key: 'en' }) },
                            { key: 'ru', label: 'Russian', onClick: () => changeLanguage({ key: 'ru' }) },
                        ]
                    }} trigger={['click']}>
                        <Button type="text" icon={<GlobalOutlined />} className={styles.langBtn}>
                            {i18n.language === 'ru' ? 'RU' : 'EN'}
                        </Button>
                    </Dropdown>

                    {user ? (
                        <>
                            {user.is_rtc_owner && (
                                <Button
                                    type="dashed"
                                    className={`${styles.adminBtn} ${styles.desktopOnly}`}
                                    onClick={() => navigate('/admin/dashboard')}
                                    style={{ marginRight: 10, borderColor: '#1890ff', color: '#1890ff' }}
                                    icon={<UserOutlined />}
                                >
                                    {t('manage_rtc') || 'Manage RTC'}
                                </Button>
                            )}
                            <Dropdown menu={{
                                items: [
                                    {
                                        key: 'profile',
                                        label: 'Profile',
                                        icon: <UserOutlined />,
                                        onClick: () => handleMenuClick({ key: 'profile' })
                                    },
                                    {
                                        type: 'divider',
                                    },
                                    {
                                        key: 'logout',
                                        label: t('logout'),
                                        icon: <LogoutOutlined />,
                                        danger: true,
                                        onClick: () => handleMenuClick({ key: 'logout' })
                                    },
                                ]
                            }} trigger={['click']}>
                                <div className={`${styles.userTrigger} ${styles.desktopOnly}`}>
                                    <Avatar icon={<UserOutlined />} src={user?.avatar} size="small" />
                                    <Text className={styles.userName}>{user?.username}</Text>
                                    <DownOutlined className={styles.dropdownIcon} />
                                </div>
                            </Dropdown>
                        </>
                    ) : (
                        <Button type="primary" onClick={() => navigate('/login')} className={styles.desktopOnly}>
                            {t('login')}
                        </Button>
                    )}

                    {/* Burger Menu Button (Mobile Only) */}
                    <Button
                        className={styles.burgerBtn}
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={toggleMobileMenu}
                    />
                </Space>
            </div>

            {/* Mobile Drawer */}
            <Drawer
                title="Rocb Europe"
                placement="right"
                onClose={closeMobileMenu}
                open={mobileMenuOpen}
                className={styles.mobileDrawer}
                width={250}
            >
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['news']}
                    selectedKeys={[
                        location.pathname === '/' || location.pathname === '/news' ? 'news' :
                            location.pathname.startsWith('/feed') ? 'feed' :
                                location.pathname.startsWith('/rtc-dashboard') ? 'rtc-dashboard' : ''
                    ]}
                    items={[
                        ...navItems,
                        { type: 'divider' },
                        ...(user ? [
                            ...(user.is_rtc_owner ? [{
                                key: 'manage-rtc',
                                label: t('manage_rtc') || 'Manage RTC',
                                icon: <UserOutlined />,
                                onClick: () => { navigate('/admin/dashboard'); closeMobileMenu(); }
                            }] : []),
                            {
                                key: 'profile',
                                label: 'Profile',
                                onClick: () => { handleMenuClick({ key: 'profile' }); closeMobileMenu(); }
                            },
                            {
                                key: 'logout',
                                label: t('logout'),
                                danger: true,
                                onClick: () => { handleMenuClick({ key: 'logout' }); closeMobileMenu(); }
                            }
                        ] : [
                            {
                                key: 'login',
                                label: t('login'),
                                onClick: () => { navigate('/login'); closeMobileMenu(); }
                            }
                        ])
                    ]}
                    style={{ borderRight: 0 }}
                />
            </Drawer>
        </AntHeader >
    );
};

export default Header;
