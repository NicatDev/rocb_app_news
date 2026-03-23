import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Select, message, Modal, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import adminService from '../../../api/admin';
import EventModal from './components/EventModal';
import styles from './style.module.scss';
import debounce from 'lodash.debounce';

const { Option } = Select;
const { confirm } = Modal;

const Events = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [serverErrors, setServerErrors] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, [currentPage, pageSize, searchText, statusFilter]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ordering: '-event_date', // Upcoming/Recent first
            };

            if (searchText) {
                params.search = searchText;
            }

            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await adminService.getEvents(params);
            const data = response.data;

            if (data.results) {
                setEvents(data.results);
                setTotal(data.count);
            } else if (Array.isArray(data)) {
                setEvents(data);
                setTotal(data.length);
            } else {
                setEvents([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
            message.error(t('failed_to_fetch_events') || 'Failed to fetch events');
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
        setEditingEvent(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingEvent(record);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        confirm({
            title: t('are_you_sure_delete_event') || 'Are you sure you want to delete this event?',
            content: t('action_cannot_be_undone'),
            okText: t('yes'),
            okType: 'danger',
            cancelText: t('no'),
            onOk: async () => {
                try {
                    await adminService.deleteEvent(id);
                    message.success(t('event_deleted_success') || 'Event deleted successfully');
                    fetchEvents();
                } catch (error) {
                    message.error(t('failed_to_delete_event') || 'Failed to delete event');
                }
            },
        });
    };

    const handleModalOk = async (formData) => {
        setModalLoading(true);
        setServerErrors(null);
        try {
            if (editingEvent) {
                await adminService.updateEvent(editingEvent.id, formData);
                message.success(t('event_updated_success') || 'Event updated successfully');
            } else {
                await adminService.createEvent(formData);
                message.success(t('event_created_success') || 'Event created successfully');
            }
            setModalVisible(false);
            fetchEvents();
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
            title: t('topic') || 'Topic',
            dataIndex: 'topic',
            key: 'topic',
        },
        {
            title: t('date') || 'Date',
            dataIndex: 'event_date',
            key: 'event_date',
            width: 120,
            render: (date) => new Date(date).toLocaleDateString('ru-RU')
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = 'default';

                switch (status) {
                    case 'PUBLIC':
                        color = 'success';
                        break;
                    case 'INTERNAL':
                        color = 'blue';
                        break;
                    case 'PENDING':
                    default:
                        color = 'warning';
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
        <div className={styles.eventsContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('events_management') || 'Events Management'}</h2>
                <div className={styles.actions}>
                    <Input
                        placeholder={t('search_events_placeholder') || 'Search events...'}
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
                        {t('create_event') || 'Create Event'}
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={events}
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
                scroll={{ x: 1000 }}
            />

            <EventModal
                visible={modalVisible}
                onCancel={() => { setModalVisible(false); setServerErrors(null); }}
                onOk={handleModalOk}
                initialValues={editingEvent}
                loading={modalLoading}
                serverErrors={serverErrors}
            />
        </div>
    );
};

export default Events;
