import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Select, message, Modal, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import adminService from '../../../api/admin';
import ResourceModal from './components/ResourceModal';
import styles from './style.module.scss';
import debounce from 'lodash.debounce';

const { Option } = Select;
const { confirm } = Modal;

const RESOURCE_TYPE_LABELS = {
    TOR: 'Mandate / Terms of Reference',
    MOU: 'Founding Memorandum',
    STRATEGY: 'Strategic Plan',
    PLAN: 'Annual Training Plan',
    CATALOGUE: 'Training Catalogue',
    REPORT: 'Annual Report / Newsletter',
    PUB: 'Publication / Handbook',
    ELEARN: 'E-Learning Link',
};

const Resources = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [resources, setResources] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [serverErrors, setServerErrors] = useState(null);

    useEffect(() => {
        fetchResources();
    }, [currentPage, pageSize, searchText, statusFilter, typeFilter]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                ordering: '-created_at',
            };

            if (searchText) {
                params.search = searchText;
            }

            if (statusFilter) {
                params.status = statusFilter;
            }

            if (typeFilter) {
                params.resource_type = typeFilter;
            }

            const response = await adminService.getResources(params);
            const data = response.data;

            if (data.results) {
                setResources(data.results);
                setTotal(data.count);
            } else if (Array.isArray(data)) {
                setResources(data);
                setTotal(data.length);
            } else {
                setResources([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            message.error(t('failed_to_fetch_resources'));
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchText(value);
            setCurrentPage(1);
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

    const handleTypeFilter = (value) => {
        setTypeFilter(value);
        setCurrentPage(1);
    };

    const handleCreate = () => {
        setEditingResource(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingResource(record);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        confirm({
            title: t('are_you_sure_delete_resource'),
            content: t('action_cannot_be_undone'),
            okText: t('yes'),
            okType: 'danger',
            cancelText: t('no'),
            onOk: async () => {
                try {
                    await adminService.deleteResource(id);
                    message.success(t('resource_deleted_success'));
                    fetchResources();
                } catch (error) {
                    message.error(t('failed_to_delete_resource'));
                }
            },
        });
    };

    const handleModalOk = async (formData) => {
        setModalLoading(true);
        setServerErrors(null);
        try {
            if (editingResource) {
                await adminService.updateResource(editingResource.id, formData);
                message.success(t('resource_updated_success'));
            } else {
                await adminService.createResource(formData);
                message.success(t('resource_created_success'));
            }
            setModalVisible(false);
            fetchResources();
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
            title: t('resource_type') || 'Type',
            dataIndex: 'resource_type',
            key: 'resource_type',
            width: 200,
            render: (type) => (
                <Tag color="purple">{RESOURCE_TYPE_LABELS[type] || type}</Tag>
            )
        },
        {
            title: t('status') || 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 150,
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
            title: t('created_at'),
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => new Date(date).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
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
        <div className={styles.resourcesContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('resources_management')}</h2>
                <div className={styles.actions}>
                    <Input
                        placeholder={t('search_resources_placeholder') || 'Search by title...'}
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
                    <Select
                        placeholder={t('filter_by_type') || 'Filter by type'}
                        style={{ width: 200 }}
                        allowClear
                        onChange={handleTypeFilter}
                    >
                        {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                            <Option key={value} value={value}>{label}</Option>
                        ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        {t('create_resource')}
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={resources}
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

            <ResourceModal
                visible={modalVisible}
                onCancel={() => { setModalVisible(false); setServerErrors(null); }}
                onOk={handleModalOk}
                initialValues={editingResource}
                loading={modalLoading}
                serverErrors={serverErrors}
            />
        </div>
    );
};

export default Resources;
