import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Input, Typography, Pagination, Empty, Spin, Button, Tag } from 'antd';
import { SearchOutlined, CalendarOutlined, ArrowRightOutlined, PictureOutlined, GlobalOutlined, BankOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getPublicNews } from '../../api/dashboard';
import useDebounce from '../../hooks/useDebounce';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const slugifyText = (value = '') =>
    value
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

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
                ordering: 'order,-effective_published_at',
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

    const navigateToDetail = (item) => {
        const pathKey = item.slug || slugifyText(item.title) || item.id;
        navigate(`/news/${pathKey}`);
    };

    const excerptText = (item) => {
        const s = (item.summary || '').trim();
        if (s) return s;
        const raw = item.content || '';
        return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const displayDate = (item) => item.news_date || item.created_at;

    return (
        <div className={styles.newsPageContainer}>
            <div className={styles.pageHeader}>
                <Title level={2}>{t('latest_news') || 'Latest News'}</Title>
                <Text className={styles.subtitle}>
                    {t('news_page_subtitle') || 'Stay updated with the latest news and announcements'}
                </Text>
            </div>

            <div className={styles.toolbar}>
                <div style={{ flex: 1 }}></div>

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
                                <Card hoverable className={styles.newsCard}>
                                    <Title level={4} className={styles.title} ellipsis={{ rows: 2 }}>
                                        <a onClick={() => navigateToDetail(item)}>{item.title}</a>
                                    </Title>

                                    <div className={styles.imageContainer} onClick={() => navigateToDetail(item)}>
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

                                    <Text className={styles.date}>
                                        <CalendarOutlined style={{ marginRight: 6 }} />
                                        {dayjs(displayDate(item)).format('MMMM D, YYYY')}
                                    </Text>

                                    <Paragraph className={styles.excerpt}>
                                        {excerptText(item)}
                                    </Paragraph>

                                    <Button
                                        type="link"
                                        className={styles.readMoreBtn}
                                        onClick={() => navigateToDetail(item)}
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
