import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Spin, Button, Divider, Carousel, Image } from 'antd';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeftOutlined,
    CalendarOutlined,
    GlobalOutlined,
    LeftOutlined,
    RightOutlined,
    ZoomInOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getPublicNewsDetail } from '../../api/dashboard';
import { looksLikeHtml, prepareRichHtmlForDisplay } from '../../utils/richText';

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
    const location = useLocation();
    const { t } = useTranslation();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const extraCarouselRef = useRef(null);
    const [extraGalleryIndex, setExtraGalleryIndex] = useState(0);

    useEffect(() => {
        setExtraGalleryIndex(0);
    }, [slug]);

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                const data = await getPublicNewsDetail(slug);
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

    useEffect(() => {
        if (!news?.title || location.state?.newsTitle === news.title) {
            return;
        }
        navigate(location.pathname, {
            replace: true,
            state: { ...(location.state || {}), newsTitle: news.title },
        });
    }, [news?.title, location.pathname, location.state?.newsTitle, navigate]);

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
                    onClick={() => navigate('/news')}
                    className={styles.backButton}
                >
                    {t('back') || "Back"}
                </Button>

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
                    {looksLikeHtml(news.content) ? (
                        <div
                            className={`rich-text-content ${styles.richHtml}`}
                            dangerouslySetInnerHTML={{ __html: prepareRichHtmlForDisplay(news.content || '') }}
                        />
                    ) : (
                        (news.content || '').split('\n').map((paragraph, index) => (
                            <Paragraph key={index} className={styles.paragraph}>
                                {paragraph}
                            </Paragraph>
                        ))
                    )}
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
                                    className={`rich-text-content ${styles.sectionBody}`}
                                    dangerouslySetInnerHTML={{ __html: prepareRichHtmlForDisplay(section.content || '') }}
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
                        <div className={styles.extraCarouselWrap}>
                            <Carousel
                                ref={extraCarouselRef}
                                className={styles.extraCarousel}
                                dots
                                draggable
                                infinite={false}
                                afterChange={setExtraGalleryIndex}
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
                            <Button
                                type="default"
                                shape="circle"
                                className={`${styles.extraCarouselNav} ${styles.extraCarouselNavPrev}`}
                                icon={<LeftOutlined />}
                                disabled={extraGalleryIndex <= 0}
                                onClick={() => extraCarouselRef.current?.prev()}
                                aria-label={t('previous_image') || 'Previous image'}
                            />
                            <Button
                                type="default"
                                shape="circle"
                                className={`${styles.extraCarouselNav} ${styles.extraCarouselNavNext}`}
                                icon={<RightOutlined />}
                                disabled={extraGalleryIndex >= news.extra_images.length - 1}
                                onClick={() => extraCarouselRef.current?.next()}
                                aria-label={t('next_image') || 'Next image'}
                            />
                        </div>
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
