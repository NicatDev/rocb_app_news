import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Spin, Avatar, Space, message } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, ArrowRightOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getRTCProfiles } from '../../api/dashboard';
import styles from './style.module.scss';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const RTCDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [rtcs, setRtcs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRTCs();
    }, []);

    const fetchRTCs = async () => {
        try {
            const data = await getRTCProfiles();
            setRtcs(data);
        } catch (error) {
            console.error('Error fetching RTCs:', error);
            message.error(t('failed_to_fetch_rtcs') || 'Failed to fetch RTCs');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (id) => {
        navigate(`/rtc-dashboard/${id}`);
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.pageHeader}>
                <Title level={2} className={styles.title}>
                    {t('rtc_network') || 'ROC-B Europe RTC Network'}
                </Title>
                <Text className={styles.subtitle}>
                    {t('rtc_overview') || 'Explore the Regional Training Centers and their activities'}
                </Text>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    {rtcs.map((rtc) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={rtc.id}>
                            <Card
                                hoverable
                                className={styles.rtcCard}
                                onClick={() => handleCardClick(rtc.id)}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <Avatar
                                            size={48}
                                            icon={<GlobalOutlined />}
                                            className={styles.rtcAvatar}
                                            src={rtc.logo}
                                        >
                                            {rtc.name.charAt(0)}
                                        </Avatar>
                                        <div className={styles.headerInfo}>
                                            <Text className={styles.rtcName} ellipsis={{ tooltip: rtc.name }}>
                                                {rtc.name}
                                            </Text>
                                            <Space size={4}>
                                                <EnvironmentOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                                <Text className={styles.rtcCountry}>{rtc.host_country}</Text>
                                            </Space>
                                        </div>
                                    </div>

                                    <div className={styles.cardDescription}>
                                        <Paragraph ellipsis={{ rows: 3, expandable: false, symbol: '...' }}>
                                            {rtc.overview_text || rtc.mission_statement}
                                        </Paragraph>
                                    </div>

                                    <div className={styles.tagsContainer}>
                                        {rtc.specialization_areas && rtc.specialization_areas.split(',').slice(0, 3).map((area, index) => (
                                            <Tag color="blue" key={index}>{area.trim()}</Tag>
                                        ))}
                                        {rtc.specialization_areas && rtc.specialization_areas.split(',').length > 3 && (
                                            <Tag>+{rtc.specialization_areas.split(',').length - 3}</Tag>
                                        )}
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <Button type="primary" ghost size="small" className={styles.viewBtn}>
                                            {t('view_details') || 'View Details'} <ArrowRightOutlined />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default RTCDashboard;
