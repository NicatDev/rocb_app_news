import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Spin, Button, Breadcrumb, Divider, Carousel, Image } from 'antd';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOutlined, CalendarOutlined, GlobalOutlined, ZoomInOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getNewsDetail } from '../../api/dashboard';

const { Title, Paragraph, Text } = Typography;

const ExtraGalleryImage = ({ src, alt = '', previewLabel = 'Preview' }) => (
    <div className={styles.extraSlideFrame}>
        <Image
            src={src}
            alt={alt}
            preview={{
                mask: (
                    <span className={styles.previewMask}>
                        <ZoomInOutlined />
                        <span>{previewLabel}</span>
                    </span>
                ),
            }}
            rootClassName={styles.extraImageRoot}
        />
    </div>
);

const NewsDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const data = await getNewsDetail(slug);
                setNews(data);
            } catch (error) {
                console.error("Failed to fetch news detail", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchNewsDetail();
        }
    }, [slug]);

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

    const displayDate = news.news_date || news.created_at;

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
                        {dayjs(displayDate).format('MMMM D, YYYY')}
                    </Text>
                    {news.rtc ? (
                        <Text className={styles.source}>
                            <GlobalOutlined style={{ marginRight: 6 }} />
                            RTC {news.rtc_name || news.rtc}
                        </Text>
                    ) : (
                        <Text className={styles.source}>
                            <GlobalOutlined style={{ marginRight: 6 }} />
                            ROCB Europe
                        </Text>
                    )}
                </div>

                {news.summary && (
                    <Paragraph className={styles.summary}>{news.summary}</Paragraph>
                )}

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

                {news.sections?.length > 0 && (
                    <div className={styles.sections}>
                        {news.sections.map((section) => (
                            <div
                                key={section.id}
                                className={styles.sectionBlock}
                                style={{
                                    marginTop: '1.75rem',
                                    marginLeft: section.depth ? `calc(${section.depth} * 1rem)` : undefined,
                                }}
                            >
                                <Title level={3} className={styles.sectionTitle}>
                                    {section.title}
                                </Title>
                                {section.image ? (
                                    <div className={styles.sectionImage}>
                                        <img src={section.image} alt={section.title || ''} />
                                    </div>
                                ) : null}
                                <div
                                    className={styles.sectionBody}
                                    dangerouslySetInnerHTML={{ __html: section.content || '' }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {news.extra_images?.length === 1 && (
                    <div className={styles.extraGallery}>
                        <ExtraGalleryImage
                            src={news.extra_images[0].image}
                            alt=""
                            previewLabel={t('preview') || 'Preview'}
                        />
                    </div>
                )}
                {news.extra_images?.length > 1 && (
                    <div className={styles.extraGallery}>
                        <Carousel
                            className={styles.extraCarousel}
                            dots
                            draggable
                            infinite={false}
                        >
                            {news.extra_images.map((row) => (
                                <div key={row.id}>
                                    <ExtraGalleryImage
                                        src={row.image}
                                        alt=""
                                        previewLabel={t('preview') || 'Preview'}
                                    />
                                </div>
                            ))}
                        </Carousel>
                    </div>
                )}
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
