import React, { useState, useEffect, useCallback } from 'react';
import { List, Input, Empty, Modal, Typography, Tag, Space, Button } from 'antd';
import { SearchOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ProjectCard from './components/ProjectCard';
import styles from './style.module.scss';
import { getRTCProjects } from '../../../../api/dashboard';

const { Search } = Input;
const { Title, Paragraph, Text } = Typography;

import useDebounce from '../../../../hooks/useDebounce';
import { Row, Col } from 'antd';

const ProjectsTab = ({ rtc, isActive }) => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebounce(searchText, 500);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 8,
        total: 0
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchProjects = useCallback(async (page = 1, search = '') => {
        setLoading(true);
        try {
            const params = {
                rtc: rtc.id,
                page: page,
                search: search
            };
            const data = await getRTCProjects(params);
            setProjects(data.results);
            setPagination({
                current: page,
                pageSize: 8,
                total: data.count
            });
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    }, [rtc.id]);

    useEffect(() => {
        if (isActive) {
            fetchProjects(1, debouncedSearchText);
        }
    }, [isActive, debouncedSearchText, fetchProjects]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleTableChange = (page) => {
        fetchProjects(page, searchText);
    };

    const handleReadMore = (project) => {
        setSelectedProject(project);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedProject(null);
    };

    return (
        <div className={styles.projectsContainer}>
            <div className={styles.toolbar}>
                <Row justify="end">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder={t('search_projects') || "Search projects..."}
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

            <List
                grid={{
                    gutter: 24,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                    xxl: 3,
                }}
                dataSource={projects}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: handleTableChange,
                    align: 'center',
                    showSizeChanger: false
                }}
                locale={{ emptyText: <Empty description={t('no_projects_found') || "No projects found"} /> }}
                renderItem={item => (
                    <List.Item>
                        <ProjectCard project={item} onReadMore={handleReadMore} />
                    </List.Item>
                )}
            />

            <Modal
                title={null}
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        {t('close') || "Close"}
                    </Button>
                ]}
                width={700}
                className={styles.projectModal}
            >
                {selectedProject && (
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <Tag icon={<CalendarOutlined />} color="blue" className={styles.modalTag}>
                                {selectedProject.timeframe}
                            </Tag>
                            <Title level={3} className={styles.modalTitle}>
                                {selectedProject.name}
                            </Title>
                        </div>

                        <div className={styles.modalSection}>
                            <Text type="secondary" className={styles.modalLabel}>
                                <TeamOutlined /> {t('partners') || 'PARTNERS'}
                            </Text>
                            <Paragraph className={styles.modalPartners}>
                                {selectedProject.partners}
                            </Paragraph>
                        </div>

                        <div className={styles.modalSection}>
                            <Text type="secondary" className={styles.modalLabel}>
                                {t('overview') || 'OVERVIEW'}
                            </Text>
                            <Paragraph className={styles.modalDescription}>
                                {selectedProject.description}
                            </Paragraph>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProjectsTab;
