import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Input, Typography, Pagination, Empty, Spin, Button, Row, Col, Tag } from 'antd';
import { SearchOutlined, CalendarOutlined, ArrowRightOutlined, PictureOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getPublicNews } from '../../api/dashboard';
import useDebounce from '../../hooks/useDebounce';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const News = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newsType, setNewsType] = useState('all'); // 'all', 'global', 'rtc'
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });

    const fetchNews = useCallback(async (page = 1, search = '', type = 'all') => {
        setLoading(true);
        try {
            const params = {
                page: page,
                page_size: pagination.pageSize,
                ordering: '-created_at',
            };

            if (search) {
                params.search = search;
            }

            if (type !== 'all') {
                params.news_type = type;
            }

            const data = await getPublicNews(params);
            if (data.results) {
                setNews(data.results);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    total: data.count
                }));
            } else if (Array.isArray(data)) {
                setNews(data);
                setPagination(prev => ({ ...prev, current: page, total: data.length }));
            }
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize]);

    useEffect(() => {
        fetchNews(1, debouncedSearchText, newsType);
    }, [debouncedSearchText, newsType, fetchNews]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handlePageChange = (page) => {
        fetchNews(page, debouncedSearchText, newsType);
    };

    const handleFilterChange = (type) => {
        setNewsType(type);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const navigateToDetail = (id) => {
        navigate(`/news/${id}`);
    };

    return (
        <div className={styles.newsPageContainer}>
            <div className={styles.pageHeader}>
                <Title level={2}>{t('latest_news') || 'Latest News'}</Title>
                <Text className={styles.subtitle}>
                    {t('news_page_subtitle') || 'Stay updated with the latest news and announcements'}
                </Text>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                    <Button
                        className={`${styles.filterBtn} ${newsType === 'all' ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        {t('all_news') || 'All News'}
                    </Button>
                    <Button
                        className={`${styles.filterBtn} ${newsType === 'global' ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange('global')}
                        icon={<GlobalOutlined />}
                    >
                        {t('global_news') || 'Global News'}
                    </Button>
                    <Button
                        className={`${styles.filterBtn} ${newsType === 'rtc' ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange('rtc')}
                        icon={<BankOutlined />}
                    >
                        {t('rtc_news') || 'RTC News'}
                    </Button>
                </div>

                <Search
                    placeholder={t('search_news') || "Search news..."}
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchBar}
                />
            </div>

            {loading && !news.length ? (
                <div style={{ textAlign: 'center', padding: '80px' }}>
                    <Spin size="large" />
                </div>
            ) : news.length > 0 ? (
                <>
                    <List
                        grid={{
                            gutter: 24,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 3,
                            xl: 3,
                            xxl: 3,
                        }}
                        dataSource={news}
                        className={styles.newsList}
                        renderItem={item => (
                            <List.Item>
                                <Card
                                    hoverable
                                    className={styles.newsCard}
                                    cover={
                                        <div className={styles.imageContainer} onClick={() => navigateToDetail(item.id)}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} />
                                            ) : (
                                                <div className={styles.placeholderImage}>
                                                    <PictureOutlined />
                                                </div>
                                            )}
                                            <div className={styles.sourceBadge}>
                                                <Tag color={item.is_global ? '#6366f1' : '#0ea5e9'}>
                                                    {item.is_global
                                                        ? (t('global') || 'Global')
                                                        : (item.rtc_name || t('rtc') || 'RTC')
                                                    }
                                                </Tag>
                                            </div>
                                        </div>
                                    }
                                >
                                    <Text className={styles.date}>
                                        <CalendarOutlined style={{ marginRight: 6 }} />
                                        {dayjs(item.created_at).format('MMMM D, YYYY')}
                                    </Text>

                                    <Title level={4} className={styles.title} ellipsis={{ rows: 2 }}>
                                        <a onClick={() => navigateToDetail(item.id)}>{item.title}</a>
                                    </Title>

                                    <Paragraph className={styles.excerpt}>
                                        {item.content}
                                    </Paragraph>

                                    <Button
                                        type="link"
                                        className={styles.readMoreBtn}
                                        onClick={() => navigateToDetail(item.id)}
                                    >
                                        {t('read_more') || "Read More"} <ArrowRightOutlined />
                                    </Button>
                                </Card>
                            </List.Item>
                        )}
                    />

                    <div className={styles.paginationContainer}>
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                        />
                    </div>
                </>
            ) : (
                <Empty description={t('no_news_found') || "No news found"} />
            )}
        </div>
    );
};

export default News;
