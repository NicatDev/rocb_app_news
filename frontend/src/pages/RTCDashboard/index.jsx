import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Spin, Avatar, Space, message } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, ArrowRightOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getRTCProfiles } from '../../api/dashboard';
import { plainTextToTagList, rtcCardExcerpt, stripHtmlToText } from '../../utils/richText';
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

    const handleCardClick = (slug, name) => {
        navigate(`/rtc-dashboard/${slug}`, { state: { rtcName: name } });
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.pageHeader}>
                <Title level={2} className={styles.title}>
                    {t('rtc_network') || 'ROCB Europe RTC Network'}
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
                    {rtcs.map((rtc) => {
                        const rtcName = stripHtmlToText(rtc.name);
                        const rtcCountry = stripHtmlToText(rtc.host_country);
                        const excerpt = rtcCardExcerpt(rtc);
                        const specializationTags = plainTextToTagList(rtc.specialization_areas);
                        const visibleTags = specializationTags.slice(0, 3);
                        const extraTagCount = specializationTags.length - visibleTags.length;

                        return (
                        <Col xs={24} sm={12} md={8} lg={6} key={rtc.id}>
                            <Card
                                hoverable
                                className={styles.rtcCard}
                                onClick={() => handleCardClick(rtc.slug || rtc.id, rtcName || rtc.name)}
                            >
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <Avatar
                                            size={48}
                                            icon={<GlobalOutlined />}
                                            className={styles.rtcAvatar}
                                            src={rtc.logo}
                                        >
                                            {(rtcName || rtc.name || '?').charAt(0)}
                                        </Avatar>
                                        <div className={styles.headerInfo}>
                                            <Text className={styles.rtcName} ellipsis={{ tooltip: rtcName || rtc.name }}>
                                                {rtcName || rtc.name}
                                            </Text>
                                            {rtcCountry ? (
                                                <Space size={4}>
                                                    <EnvironmentOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                                    <Text className={styles.rtcCountry}>{rtcCountry}</Text>
                                                </Space>
                                            ) : null}
                                        </div>
                                    </div>

                                    {excerpt ? (
                                        <div className={styles.cardDescription}>
                                            <Paragraph ellipsis={{ rows: 3, expandable: false, symbol: '...' }}>
                                                {excerpt}
                                            </Paragraph>
                                        </div>
                                    ) : null}

                                    {visibleTags.length > 0 ? (
                                        <div className={styles.tagsContainer}>
                                            {visibleTags.map((area, index) => (
                                                <Tag className={styles.tag} color="blue" key={`${area}-${index}`}>{area}</Tag>
                                            ))}
                                            {extraTagCount > 0 ? (
                                                <Tag className={styles.tag}>+{extraTagCount}</Tag>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <div className={styles.cardFooter}>
                                        <Button type="primary" ghost size="small" className={styles.viewBtn}>
                                            {t('view_details') || 'View Details'} <ArrowRightOutlined />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
};

export default RTCDashboard;
