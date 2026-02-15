import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Button, Breadcrumb, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined, CalendarOutlined, GlobalOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getNewsDetail } from '../../api/dashboard';

const { Title, Paragraph, Text } = Typography;

const NewsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const data = await getNewsDetail(id);
                setNews(data);
            } catch (error) {
                console.error("Failed to fetch news detail", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNewsDetail();
        }
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        );
    }

    if (!news) {
        return (
            <div className={styles.errorContainer}>
                <Title level={4}>{t('news_not_found') || 'News not found'}</Title>
                <Button onClick={() => navigate(-1)}>
                    {t('go_back') || 'Go Back'}
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className={styles.backButton}
                >
                    {t('back') || "Back"}
                </Button>

                <Breadcrumb className={styles.breadcrumb}>
                    <Breadcrumb.Item onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>{t('home') || 'Home'}</Breadcrumb.Item>
                    <Breadcrumb.Item>{t('news') || 'News'}</Breadcrumb.Item>
                    <Breadcrumb.Item>{news.title}</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <article className={styles.article}>
                <Title level={1} className={styles.title}>{news.title}</Title>

                <div className={styles.meta}>
                    <Text className={styles.date}>
                        <CalendarOutlined style={{ marginRight: 6 }} />
                        {dayjs(news.created_at).format('MMMM D, YYYY')}
                    </Text>
                    {news.rtc ? (
                        <Text className={styles.source}>
                            <GlobalOutlined style={{ marginRight: 6 }} />
                            RTC {news.rtc} {/* Ideally, fetch RTC name or use expanded serializer */}
                        </Text>
                    ) : (
                        <Text className={styles.source}>
                            <GlobalOutlined style={{ marginRight: 6 }} />
                            ROCB Europe
                        </Text>
                    )}
                </div>

                {news.image && (
                    <div className={styles.featuredImage}>
                        <img src={news.image} alt={news.title} />
                    </div>
                )}

                <div className={styles.content}>
                    {news.content.split('\n').map((paragraph, index) => (
                        <Paragraph key={index} className={styles.paragraph}>
                            {paragraph}
                        </Paragraph>
                    ))}
                </div>
            </article>

            <Divider />

            <div className={styles.footer}>
                <Button onClick={() => navigate(-1)}>
                    {t('back_to_news') || "Back to News List"}
                </Button>
            </div>
        </div>
    );
};

export default NewsDetail;
