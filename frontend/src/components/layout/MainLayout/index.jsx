import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import styles from './style.module.scss';
import AppBreadcrumb from '../../common/AppBreadcrumb';
import { applyStoredOpenAILanguage } from '../../../utils/openaiTranslate';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            applyStoredOpenAILanguage();
        }, 500);
        return () => window.clearTimeout(timer);
    }, [location.pathname]);

    return (
        <Layout className={styles.mainLayout}>
            <Header />
            <Content className={styles.content} data-openai-translate="main">
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
