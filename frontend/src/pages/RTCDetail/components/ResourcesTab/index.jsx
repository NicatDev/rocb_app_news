import React, { useState, useEffect, useCallback } from 'react';
import { List, Card, Button, Input, Tag, Typography, Space, Empty, Modal } from 'antd';
import { FilePdfOutlined, LinkOutlined, SearchOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './style.module.scss';
import { getRTCResources } from '../../../../api/dashboard';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

import useDebounce from '../../../../hooks/useDebounce';

const ResourcesTab = ({ rtc, isActive }) => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    const fetchResources = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const params = {
                rtc: rtc.id,
                page: page,
                search: search
            };
            const data = await getRTCResources(params);
            setResources(data.results);
            setPagination({
                current: page,
                pageSize: 8,
                total: data.count
            });
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    }, [rtc.id]);

    useEffect(() => {
        if (isActive) {
            fetchResources(1, debouncedSearchText);
        }
    }, [isActive, debouncedSearchText, fetchResources]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleTableChange = (page) => {
        fetchResources(page, searchText);
    };

    const handleReadMore = (resource) => {
        setSelectedResource(resource);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedResource(null);
    };

    const getIconForResource = (resource) => {
        if (resource.file) {
            return <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />;
        } else if (resource.external_link) {
            return <LinkOutlined style={{ fontSize: '24px', color: '#52c41a' }} />;
        }
        return <FileTextOutlined style={{ fontSize: '24px', color: '#8c8c8c' }} />;
    };

    const getTypeLabel = (type) => {
        // Can add more robust mapping/translation here
        return type.replace('_', ' ');
    };

    const renderDescription = (resource) => {
        const text = resource.description || '';
        const maxLength = 100; // Character limit
        if (text.length <= maxLength) {
            return <Paragraph className={styles.resourceDesc}>{text}</Paragraph>;
        }
        return (
            <Paragraph className={styles.resourceDesc}>
                {text.substring(0, maxLength)}...
                <a onClick={() => handleReadMore(resource)} style={{ marginLeft: 4 }}>
                    {t('read_more') || 'Read More'}
                </a>
            </Paragraph>
        );
    };

    return (
        <div className={styles.resourcesContainer}>
            <div className={styles.toolbar}>
                <Search
                    placeholder={t('search_resources') || "Search resources..."}
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchBar}
                />
            </div>

            <List
                grid={{
                    gutter: 24,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 4,
                    xxl: 4,
                }}
                dataSource={resources}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handleTableChange,
                    align: 'center',
                    showSizeChanger: false
                }}
                locale={{ emptyText: <Empty description={t('no_resources_found') || "No resources found"} /> }}
                renderItem={item => (
                    <List.Item>
                        <Card className={styles.resourceCard} hoverable>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>
                                    {getIconForResource(item)}
                                </div>
                                <Tag color="blue">{getTypeLabel(item.resource_type)}</Tag>
                            </div>

                            <Title level={5} className={styles.resourceTitle} ellipsis={{ rows: 2, tooltip: item.title }}>
                                {item.title}
                            </Title>

                            {renderDescription(item)}

                            <div className={styles.cardFooter}>
                                {item.file ? (
                                    <Button type="primary" ghost icon={<EyeOutlined />} href={item.file} target="_blank" block>
                                        {t('view_file') || "View File"}
                                    </Button>
                                ) : item.external_link ? (
                                    <Button type="default" icon={<LinkOutlined />} href={item.external_link} target="_blank" block>
                                        {t('open_link') || "Open Link"}
                                    </Button>
                                ) : (
                                    <Button disabled block>{t('no_file') || "Unavailable"}</Button>
                                )}
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

            <Modal
                title={selectedResource?.title}
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        {t('close') || "Close"}
                    </Button>,
                    selectedResource?.file ? (
                        <Button key="view" type="primary" icon={<EyeOutlined />} href={selectedResource.file} target="_blank">
                            {t('view_file') || "View File"}
                        </Button>
                    ) : selectedResource?.external_link ? (
                        <Button key="link" type="primary" icon={<LinkOutlined />} href={selectedResource.external_link} target="_blank">
                            {t('open_link') || "Open Link"}
                        </Button>
                    ) : null
                ]}
            >
                {selectedResource && (
                    <div>
                        <Tag color="blue" style={{ marginBottom: 16 }}>{getTypeLabel(selectedResource.resource_type)}</Tag>
                        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                            {selectedResource.description}
                        </Paragraph>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ResourcesTab;
