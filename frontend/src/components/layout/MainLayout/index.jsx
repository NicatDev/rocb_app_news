import React from 'react';
import { Layout } from 'antd';
import Header from '../Header';
import styles from './style.module.scss';
import { Outlet } from 'react-router-dom';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    return (
        <Layout className={styles.mainLayout}>
            <Header />
            <Content className={styles.content}>
                {children || <Outlet />}
            </Content>
            <Footer style={{ textAlign: 'center', background: 'transparent' }}>
                Rocb Europe ©2026 Created by Rocb Europe
            </Footer>
        </Layout>
    );
};

export default MainLayout;
