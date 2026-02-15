import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Pagination, Empty, Spin } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './style.module.scss';
import { getRTCGallery } from '../../../../api/dashboard';

const GalleryTab = ({ rtc, isActive }) => {
    const { t } = useTranslation();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);

    const fetchGallery = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                rtc: rtc.id,
                page: page,
                page_size: pagination.pageSize
            };
            const data = await getRTCGallery(params);
            setImages(data.results);
            setPagination(prev => ({
                ...prev,
                current: page,
                total: data.count
            }));
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch gallery", error);
        } finally {
            setLoading(false);
        }
    }, [rtc.id, pagination.pageSize]);

    useEffect(() => {
        if (isActive && !hasFetched) {
            fetchGallery(1);
        }
    }, [isActive, hasFetched, fetchGallery]);

    const handlePageChange = (page) => {
        fetchGallery(page);
    };

    const handlePreview = (image) => {
        setPreviewImage(image);
        setPreviewVisible(true);
    };

    const handleCancelPreview = () => {
        setPreviewVisible(false);
    };

    return (
        <div className={styles.galleryContainer}>
            {loading && !images.length ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : images.length > 0 ? (
                <>
                    <div className={styles.masonryGrid}>
                        {images.map((item) => (
                            <div key={item.id} className={styles.galleryItem} onClick={() => handlePreview(item)}>
                                <img src={item.image} alt={item.caption || "Gallery Image"} loading="lazy" />
                                <div className={styles.overlay}>
                                    <EyeOutlined />
                                </div>
                            </div>
                        ))}
                    </div>

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
                <Empty description={t('no_images_found') || "No images found"} />
            )}

            <Modal
                open={previewVisible}
                footer={null}
                onCancel={handleCancelPreview}
                width={800}
                centered
            >
                {previewImage && (
                    <div>
                        <img
                            src={previewImage.image}
                            alt={previewImage.caption}
                            className={styles.modalImage}
                        />
                        {previewImage.caption && (
                            <div className={styles.modalCaption}>
                                {previewImage.caption}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default GalleryTab;
