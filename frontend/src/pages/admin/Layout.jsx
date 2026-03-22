import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Avatar, Grid, Drawer } from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    CalendarOutlined,
    FolderOpenOutlined,
    PictureOutlined,
    ReadOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import styles from './style.module.scss';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
    const screens = useBreakpoint();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { user, logout } = useAuth();

    // Determine if we are on a mobile screen (md and below usually, or sm)
    // screens.md is true if width >= 768px. So !screens.md is mobile/tablet portrait
    const isMobile = !screens.md;

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: t('rtc_profile') || 'RTC Profile',
        },
        // ... items are same
        {
            key: '/admin/news',
            icon: <ReadOutlined />,
            label: t('news') || 'News',
        },
        {
            key: '/admin/events',
            icon: <CalendarOutlined />,
            label: t('events') || 'Events',
        },
        {
            key: '/admin/resources',
            icon: <FileTextOutlined />,
            label: t('resources') || 'Resources',
        },
        {
            key: '/admin/projects',
            icon: <FolderOpenOutlined />,
            label: t('projects') || 'Projects',
        },
        {
            key: '/admin/gallery',
            icon: <PictureOutlined />,
            label: t('gallery') || 'Gallery',
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
        if (isMobile) {
            setMobileDrawerVisible(false);
        }
    };

    const userMenuItems = [
        {
            key: '1',
            icon: <LogoutOutlined />,
            label: t('logout'),
            onClick: logout
        }
    ];

    const renderMenu = () => (
        <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
        />
    );

    return (
        <Layout className={styles.adminLayout}>
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    className={styles.sider}
                    theme="light"
                    width={250}
                >
                    <div className={styles.logo}>
                        {collapsed ? 'RTC' : 'RTC Admin'}
                    </div>
                    {renderMenu()}
                </Sider>
            )}

            {isMobile && (
                <Drawer
                    title="Menu"
                    placement="left"
                    onClose={() => setMobileDrawerVisible(false)}
                    open={mobileDrawerVisible}
                    width={250}
                    styles={{ body: { padding: 0 } }}
                >
                    {renderMenu()}
                </Drawer>
            )}

            <Layout className={styles.siteLayout}>
                <Header className={styles.header} style={{ padding: '0 24px' }}>
                    {isMobile ? (
                        <MenuUnfoldOutlined
                            className={styles.trigger}
                            onClick={() => setMobileDrawerVisible(true)}
                        />
                    ) : (
                        React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: styles.trigger,
                            onClick: () => setCollapsed(!collapsed),
                        })
                    )}

                   
                </Header>
                <Content className={styles.content}>
                    <AppBreadcrumb />
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
