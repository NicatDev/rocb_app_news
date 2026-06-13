import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import styles from './style.module.scss';
import AppBreadcrumb from '../../common/AppBreadcrumb';
// OpenAI page translation (disabled — see OPENAI_TRANSLATION_NOTES.md):
// import { applyStoredOpenAILanguage } from '../../../utils/openaiTranslate';

const { Content, Footer } = Layout;

const MainLayout = ({ children }) => {
    // useEffect(() => { applyStoredOpenAILanguage(); }, [location.pathname]);

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
