import useDebounce from '../../../../hooks/useDebounce';

import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Input, Tag, DatePicker, Typography, Empty, Row, Col, Modal, Segmented } from 'antd';
import { SearchOutlined, CalendarOutlined, PushpinOutlined, InfoCircleOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import styles from './style.module.scss';
import { getRTCEvents } from '../../../../api/dashboard';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const EventsTab = ({ rtc, isActive }) => {
    const { t } = useTranslation();
    const [timeFilter, setTimeFilter] = useState('upcoming');
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);
    const [filterDate, setFilterDate] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchEvents = useCallback(async (page = 1, search = '', date = null, tf = 'upcoming') => {
        setLoading(true);
        try {
            const params = {
                rtc: rtc.id,
                page: page,
                search: search,
                time_filter: tf,
                event_date: date ? date.format('YYYY-MM-DD') : undefined
            };
            const data = await getRTCEvents(params);
            setEvents(data.results);
            setPagination({
                current: page,
                pageSize: 8,
                total: data.count
            });
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    }, [rtc.id]);

    // Initial fetch and fetch on debounce/date/timeFilter change
    useEffect(() => {
        if (isActive) {
            fetchEvents(1, debouncedSearchText, filterDate, timeFilter);
        }
    }, [isActive, debouncedSearchText, filterDate, timeFilter, fetchEvents]);

    const handleSearch = (value) => {
        setSearchText(value);
    };


    const handleDateChange = (date) => {
        setFilterDate(date);
    };

    const handleTableChange = (page) => {
        fetchEvents(page, searchText, filterDate, timeFilter);
    };

    const showEventDetails = (event) => {
        setSelectedEvent(event);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedEvent(null);
    };


    return (
        <div className={styles.eventsContainer}>
            <div className={styles.toolbar}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={6}>
                        <Segmented
                            value={timeFilter}
                            onChange={setTimeFilter}
                            block
                            className={styles.timeToggle}
                            options={[
                                {
                                    label: t('upcoming_events') || 'Upcoming',
                                    value: 'upcoming',
                                },
                                {
                                    label: t('past_events') || 'Past',
                                    value: 'past',
                                },
                            ]}
                        />
                    </Col>
                    <Col flex="auto" />
                    <Col xs={24} sm={12} md={6}>
                        <DatePicker
                            onChange={handleDateChange}
                            style={{ width: '100%' }}
                            size="large"
                            placeholder={t('select_date') || "Select Date"}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Search
                            placeholder={t('search_events') || "Search events..."}
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </Col>
                </Row>
            </div>

            <List
                grid={{
                    gutter: 24,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 4,
                }}
                dataSource={events}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handleTableChange,
                    align: 'center',
                    showSizeChanger: false
                }}
                locale={{ emptyText: <Empty description={t('no_events_found') || "No events found"} /> }}
                renderItem={item => {
                    const isPast = dayjs(item.event_date).isBefore(dayjs(), 'day');
                    return (
                        <List.Item>
                            <Card
                                className={`${styles.eventCard} ${isPast ? styles.pastEvent : ''}`}
                                hoverable
                            >
                                <div className={`${styles.dateBadge} ${isPast ? styles.pastBadge : ''}`}>
                                    <span className={styles.day}>{dayjs(item.event_date).format('DD')}</span>
                                    <span className={styles.month}>{dayjs(item.event_date).format('MMM')}</span>
                                    <span className={styles.year}>{dayjs(item.event_date).format('YYYY')}</span>
                                </div>

                                <div className={styles.content}>
                                    <div className={styles.header}>
                                        {item?.topic && <Tag color="default">{item.topic}</Tag>}
                                    </div>

                                    <Title level={5} className={styles.eventTitle} ellipsis={{ rows: 2 }}>
                                        {item.title}
                                    </Title>

                                    <div className={styles.details}>
                                        {item.location && (
                                            <Text type="secondary" className={styles.detailItem}>
                                                <PushpinOutlined /> {item.location}
                                            </Text>
                                        )}
                                        <Text type="secondary" className={styles.detailItem}>
                                            <CalendarOutlined /> {dayjs(item.event_date).format('YYYY-MM-DD')}
                                        </Text>
                                    </div>

                                    <Button
                                        type="primary"
                                        ghost
                                        block
                                        style={{ marginTop: 16 }}
                                        onClick={() => showEventDetails(item)}
                                    >
                                        {t('view_details') || "View Details"}
                                    </Button>
                                </div>
                            </Card>
                        </List.Item>
                    );
                }}
            />

            <Modal
                title={selectedEvent?.title}
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        {t('close') || "Close"}
                    </Button>
                ]}
            >
                {selectedEvent && (
                    <div className={styles.modalContent}>
                        <div style={{ marginBottom: 24 }}>
                            <Tag color="cyan" style={{ fontSize: '14px', padding: '4px 10px' }}>
                                {selectedEvent.topic?.toUpperCase()}
                            </Tag>
                        </div>

                        <div className={styles.modalRow}>
                            <CalendarOutlined className={styles.modalIcon} />
                            <div>
                                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {t('date') || "DATE"}
                                </Text>
                                <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                                    {dayjs(selectedEvent.event_date).format('DD MMMM YYYY')}
                                </Paragraph>
                            </div>
                        </div>

                        {selectedEvent.participant_count && (
                            <div className={styles.modalRow}>
                                <InfoCircleOutlined className={styles.modalIcon} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('participants') || "PARTICIPANTS"}
                                    </Text>
                                    <Paragraph style={{ margin: 0, fontSize: '16px' }}>
                                        {selectedEvent.participant_count}
                                    </Paragraph>
                                </div>
                            </div>
                        )}

                        {selectedEvent.summary && (
                            <div className={styles.modalRow} style={{ alignItems: 'flex-start' }}>
                                <InfoCircleOutlined className={styles.modalIcon} style={{ marginTop: 4 }} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('summary') || "SUMMARY"}
                                    </Text>
                                    <Paragraph style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>
                                        {selectedEvent.summary}
                                    </Paragraph>
                                </div>
                            </div>
                        )}

                        {selectedEvent.report_file && (
                            <div className={styles.modalRow}>
                                <FileTextOutlined className={styles.modalIcon} />
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {t('report') || "REPORT"}
                                    </Text>
                                    <div style={{ marginTop: 4 }}>
                                        <Button
                                            type="primary"
                                            ghost
                                            icon={<DownloadOutlined />}
                                            href={selectedEvent.report_file}
                                            target="_blank"
                                        >
                                            {t('download_report') || "Download Report"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EventsTab;
