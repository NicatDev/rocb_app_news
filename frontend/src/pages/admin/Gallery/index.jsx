import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Select, message, Modal, Tooltip, Tag, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import adminService from '../../../api/admin';
import GalleryModal from './components/GalleryModal';
import styles from './style.module.scss';
import debounce from 'lodash.debounce';

const { Option } = Select;
const { confirm } = Modal;

const Gallery = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [serverErrors, setServerErrors] = useState(null);

    useEffect(() => {
        fetchGallery();
    }, [currentPage, pageSize, searchText, statusFilter]);

    const fetchGallery = async () => {
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

            const response = await adminService.getGallery(params);
            const data = response.data;

            if (data.results) {
                setGallery(data.results);
                setTotal(data.count);
            } else if (Array.isArray(data)) {
                setGallery(data);
                setTotal(data.length);
            } else {
                setGallery([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
            message.error(t('failed_to_fetch_gallery'));
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

    const handleCreate = () => {
        setEditingImage(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingImage(record);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        confirm({
            title: t('are_you_sure_delete_gallery_image'),
            content: t('action_cannot_be_undone'),
            okText: t('yes'),
            okType: 'danger',
            cancelText: t('no'),
            onOk: async () => {
                try {
                    await adminService.deleteGalleryImage(id);
                    message.success(t('gallery_image_deleted_success'));
                    fetchGallery();
                } catch (error) {
                    message.error(t('failed_to_delete_gallery_image'));
                }
            },
        });
    };

    const handleModalOk = async (formData) => {
        setModalLoading(true);
        setServerErrors(null);
        try {
            if (editingImage) {
                await adminService.updateGalleryImage(editingImage.id, formData);
                message.success(t('gallery_image_updated_success'));
            } else {
                await adminService.createGalleryImage(formData);
                message.success(t('gallery_image_created_success'));
            }
            setModalVisible(false);
            fetchGallery();
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
            title: t('image'),
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (imageUrl) => (
                imageUrl ? (
                    <Image
                        src={imageUrl}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        preview={{ mask: '🔍' }}
                    />
                ) : '—'
            )
        },
        {
            title: t('caption') || 'Caption',
            dataIndex: 'caption',
            key: 'caption',
            render: (text, record) => (
                <a onClick={() => handleEdit(record)} style={{ fontWeight: 500 }}>
                    {text || '—'}
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
        <div className={styles.galleryContainer}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t('gallery_management')}</h2>
                <div className={styles.actions}>
                    <Input
                        placeholder={t('search_gallery_placeholder') || 'Search by caption...'}
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
                        {t('add_gallery_image')}
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={gallery}
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

            <GalleryModal
                visible={modalVisible}
                onCancel={() => { setModalVisible(false); setServerErrors(null); }}
                onOk={handleModalOk}
                initialValues={editingImage}
                loading={modalLoading}
                serverErrors={serverErrors}
            />
        </div>
    );
};

export default Gallery;
