import React from 'react';
import { Layout } from 'antd';
import Header from '../Header';
import styles from './style.module.scss';
import { Outlet } from 'react-router-dom';
import AppBreadcrumb from '../../common/AppBreadcrumb';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    return (
        <Layout className={styles.mainLayout}>
            <Header />
            <Content className={styles.content}>
                <AppBreadcrumb />
                {children || <Outlet />}
            </Content>
            <Footer style={{ textAlign: 'center', background: 'transparent' }}>
                Rocb Europe ©2026 Created by Rocb Europe
            </Footer>
        </Layout>
    );
};

export default MainLayout;
