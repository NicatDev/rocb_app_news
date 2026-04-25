import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Select, message, Modal, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import adminService from '../../../api/admin';
import NewsModal from './components/NewsModal';
import styles from './style.module.scss';
import debounce from 'lodash.debounce';

const { Option } = Select;
const { confirm } = Modal;

const News = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [news, setNews] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingNews, setEditingNews] = useState(null);
    const [serverErrors, setServerErrors] = useState(null);

    useEffect(() => {
        fetchNews();
    }, [currentPage, pageSize, searchText, statusFilter]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ordering: 'order,-effective_published_at',
            };

            if (searchText) {
                params.search = searchText;
            }

            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await adminService.getNews(params);
            const data = response.data;

            if (data.results) {
                setNews(data.results);
                setTotal(data.count);
            } else if (Array.isArray(data)) {
                setNews(data);
                setTotal(data.length);
            } else {
                setNews([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Failed to fetch news:', error);
            message.error(t('failed_to_fetch_news'));
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    // Debounced search handler
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchText(value);
            setCurrentPage(1); // Reset to first page
        }, 500),
        []
    );

    const handleSearch = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleCreate = () => {
        setEditingNews(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingNews(record);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        confirm({
            title: t('are_you_sure_delete_news'),
            content: t('action_cannot_be_undone'),
            okText: t('yes'),
            okType: 'danger',
            cancelText: t('no'),
            onOk: async () => {
                try {
                    await adminService.deleteNews(id);
                    message.success(t('news_deleted_success'));
                    fetchNews();
                } catch (error) {
                    message.error(t('failed_to_delete_news'));
                }
            },
        });
    };

    const handleModalOk = async ({ formData, newExtraFiles, removedExtraImageIds }) => {
        setModalLoading(true);
        setServerErrors(null);
        try {
            let newsId = editingNews?.id;
            if (editingNews) {
                await adminService.updateNews(editingNews.id, formData);
                message.success(t('news_updated_success'));
            } else {
                const res = await adminService.createNews(formData);
                newsId = res.data?.id;
                message.success(t('news_created_success'));
            }
            if (newsId && removedExtraImageIds?.length) {
                for (const imgId of removedExtraImageIds) {
                    await adminService.deleteNewsExtraImage(newsId, imgId);
                }
            }
            if (newsId && newExtraFiles?.length) {
                const fd = new FormData();
                newExtraFiles.forEach((f) => fd.append('images', f));
                await adminService.appendNewsExtraImages(newsId, fd);
            }
            setModalVisible(false);
            fetchNews();
        } catch (error) {
            console.error('Operation failed:', error);
            if (error.response && error.response.data) {
                setServerErrors(error.response.data);
            } else {
                message.error(t('operation_failed'));
            }
        } finally {
            setModalLoading(false);
        }
    };

    const columns = [
        {
            title: t('title'),
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <a onClick={() => handleEdit(record)} style={{ fontWeight: 500 }}>
                    {text}
                </a>
            )
        },
        {
            title: t('status') || 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => {
                let color = 'default';
                let className = '';

                switch (status) {
                    case 'PUBLIC':
                        color = 'success';
                        className = styles.statusPublic;
                        break;
                    case 'INTERNAL':
                        color = 'blue';
                        className = styles.statusInternal;
                        break;
                    case 'PENDING':
                    default:
                        color = 'warning';
                        className = styles.statusPending;
                        break;
                }

                return (
                    <Tag color={color}>
                        {t(status.toLowerCase()) || status}
                    </Tag>
                );
            }
        },
        {
            title: t('date'),
            dataIndex: 'news_date',
            key: 'news_date',
            width: 150,
            render: (_, record) => {
                if (record.news_date) {
                    return new Date(record.news_date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    });
                }
                return new Date(record.created_at).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            title: t('actions'),
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Tooltip title={t('edit')}>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            style={{ color: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className={styles.newsContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('news_management')}</h2>
                <div className={styles.actions}>
                    <Input
                        placeholder={t('search_news_placeholder')}
                        defaultValue={searchText}
                        onChange={handleSearch}
                        style={{ width: 250 }}
                        allowClear
                        prefix={<SearchOutlined />}
                    />
                    <Select
                        placeholder={t('filter_by_status')}
                        style={{ width: 150 }}
                        allowClear
                        onChange={handleStatusFilter}
                    >
                        <Option value="PUBLIC">{t('public')}</Option>
                        <Option value="INTERNAL">{t('internal')}</Option>
                        <Option value="PENDING">{t('pending')}</Option>
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        {t('create_news')}
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={news}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                }}
                onChange={handleTableChange}
                className={styles.table}
            />

            <NewsModal
                visible={modalVisible}
                onCancel={() => { setModalVisible(false); setServerErrors(null); }}
                onOk={handleModalOk}
                initialValues={editingNews}
                loading={modalLoading}
                serverErrors={serverErrors}
            />
        </div>
    );
};

export default News;
