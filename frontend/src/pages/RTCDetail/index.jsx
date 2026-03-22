import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Spin, message, Typography, Button } from 'antd';
import { ArrowLeftOutlined, AppstoreOutlined, FileTextOutlined, CalendarOutlined, ProjectOutlined, PictureOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getRTCProfile } from '../../api/dashboard';
import styles from './style.module.scss';

// Components
import OverviewTab from './components/OverviewTab';
import ResourcesTab from './components/ResourcesTab';
import EventsTab from './components/EventsTab';
import ProjectsTab from './components/ProjectsTab';
import GalleryTab from './components/GalleryTab';
import NewsTab from './components/NewsTab';

const { Title } = Typography;
const { TabPane } = Tabs;

const RTCDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [rtc, setRtc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchRTC = async () => {
            try {
                const data = await getRTCProfile(id);
                setRtc(data);
            } catch (error) {
                console.error('Error fetching RTC details:', error);
                message.error(t('failed_to_load_rtc') || 'Failed to load RTC details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRTC();
        }
    }, [id, t]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!rtc) {
        return (
            <div className={styles.errorContainer}>
                <Title level={4}>{t('rtc_not_found') || 'RTC not found'}</Title>
                <Button onClick={() => navigate('/rtc-dashboard')}>
                    {t('back_to_dashboard') || 'Back to Dashboard'}
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.detailContainer}>
            {/* ... header ... */}
            <div className={styles.header}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/rtc-dashboard')}
                    className={styles.backButton}
                >
                    {t('back_to_dashboard') || 'Back to Dashboard'}
                </Button>
              
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className={`${styles.tabs} ${styles.modernTabs}`}
            >
                <TabPane
                    tab={<span><AppstoreOutlined /> {t('overview') || 'Overview'}</span>}
                    key="overview"
                >
                    <OverviewTab rtc={rtc} />
                </TabPane>
                <TabPane
                    tab={<span><FileTextOutlined /> {t('news') || 'News'}</span>}
                    key="news"
                >
                    <NewsTab rtc={rtc} isActive={activeTab === 'news'} />
                </TabPane>
                <TabPane
                    tab={<span><CalendarOutlined /> {t('events') || 'Events'}</span>}
                    key="events"
                >
                    <EventsTab rtc={rtc} isActive={activeTab === 'events'} />
                </TabPane>
                <TabPane
                    tab={<span><ProjectOutlined /> {t('projects') || 'Projects'}</span>}
                    key="projects"
                >
                    <ProjectsTab rtc={rtc} isActive={activeTab === 'projects'} />
                </TabPane>
                <TabPane
                    tab={<span><PictureOutlined /> {t('gallery') || 'Gallery'}</span>}
                    key="gallery"
                >
                    <GalleryTab rtc={rtc} isActive={activeTab === 'gallery'} />
                </TabPane>
                <TabPane
                    tab={<span><FileTextOutlined /> {t('resources') || 'Resources'}</span>}
                    key="resources"
                >
                    <ResourcesTab rtc={rtc} isActive={activeTab === 'resources'} />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default RTCDetail;
