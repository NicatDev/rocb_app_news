import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Input, Typography, Pagination, Empty, Spin, Button, Row, Col } from 'antd';
import { SearchOutlined, CalendarOutlined, ArrowRightOutlined, PictureOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getRTCNews } from '../../../../api/dashboard';
import useDebounce from '../../../../hooks/useDebounce';

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

const NewsTab = ({ rtc, isActive }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0
    });

    const fetchNews = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const params = {
                rtc: rtc.id,
                page: page,
                page_size: pagination.pageSize,
                search: search,
                ordering: 'order,-effective_published_at',
            };
            const data = await getRTCNews(params);
            setNews(data.results);
            setPagination(prev => ({
                ...prev,
                current: page,
                total: data.count
            }));
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
        }
    }, [rtc.id, pagination.pageSize]);

    useEffect(() => {
        if (isActive) {
            fetchNews(1, debouncedSearchText);
        }
    }, [isActive, debouncedSearchText, fetchNews]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handlePageChange = (page) => {
        fetchNews(page, debouncedSearchText);
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
        <div className={styles.newsContainer}>
            <div className={styles.toolbar}>
                <Row justify="end">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder={t('search_news') || "Search news..."}
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            className={styles.searchBar}
                        />
                    </Col>
                </Row>
            </div>

            {loading && !news.length ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
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

export default NewsTab;
