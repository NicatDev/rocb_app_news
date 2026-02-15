import React from 'react';
import { Row, Col, Card, Typography, Descriptions, Tag, Space, Avatar } from 'antd';
import { EnvironmentOutlined, GlobalOutlined, PhoneOutlined, MailOutlined, TeamOutlined, TrophyOutlined, HistoryOutlined, UserOutlined, RocketOutlined, BulbOutlined, ReadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './style.module.scss';
const { Title, Paragraph, Text } = Typography;

const OverviewTab = ({ rtc }) => {
    const { t } = useTranslation();

    // Color palette for specialization tags
    const tagColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    return (
        <div className={styles.overviewContainer}>
            <Row gutter={[24, 24]}>
                {/* Left Column: Key Information */}
                <Col xs={24} lg={6}>
                    <div className={styles.keyInfoContainer}>
                        <div className={styles.keyInfoItem}>
                            <div className={styles.iconWrapper}><GlobalOutlined /></div>
                            <div className={styles.infoContent}>
                                <Text type="secondary" className={styles.label}>{t('host_country') || 'Host Country'}</Text>
                                <Title level={5} className={styles.value}>{rtc.host_country}</Title>
                            </div>
                        </div>

                        <div className={styles.keyInfoItem}>
                            <div className={styles.iconWrapper}><HistoryOutlined /></div>
                            <div className={styles.infoContent}>
                                <Text type="secondary" className={styles.label}>{t('established') || 'Established'}</Text>
                                <Title level={5} className={styles.value}>{rtc.establishment_year}</Title>
                            </div>
                        </div>

                        <div className={styles.keyInfoItem}>
                            <div className={styles.iconWrapper}><UserOutlined /></div>
                            <div className={styles.infoContent}>
                                <Text type="secondary" className={styles.label}>{t('director') || 'Director'}</Text>
                                <Title level={5} className={styles.value}>{rtc.director_name}</Title>
                            </div>
                        </div>

                        <div className={styles.keyInfoItem}>
                            <div className={styles.iconWrapper}><GlobalOutlined /></div>
                            <div className={styles.infoContent}>
                                <Text type="secondary" className={styles.label}>{t('website') || 'Website'}</Text>
                                <div className={styles.value}>
                                    {rtc.website ? (
                                        <a href={rtc.website} target="_blank" rel="noopener noreferrer">
                                            {new URL(rtc.website).hostname}
                                        </a>
                                    ) : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Center Column: Redesigned Sections */}
                <Col xs={24} lg={12}>
                    <div className={styles.sectionsContainer}>
                        {/* Mission & Vision Card */}
                        <div className={styles.sectionCard}>
                            <div className={`${styles.sectionAccent} ${styles.accentMission}`} />
                            <div className={styles.sectionBody}>
                                <div className={styles.sectionHeader}>
                                    <div className={`${styles.sectionIcon} ${styles.iconMission}`}>
                                        <RocketOutlined />
                                    </div>
                                    <div>
                                        <Title level={4} className={styles.sectionTitle}>
                                            {t('mission_vision') || 'Mission & Vision'}
                                        </Title>
                                        <Text type="secondary" className={styles.sectionSubtitle}>
                                            {t('our_purpose') || 'Our purpose and goals'}
                                        </Text>
                                    </div>
                                </div>
                                <Paragraph className={styles.sectionText}>
                                    {rtc.mission_statement}
                                </Paragraph>
                            </div>
                        </div>

                        {/* Overview & History Card */}
                        <div className={styles.sectionCard}>
                            <div className={`${styles.sectionAccent} ${styles.accentHistory}`} />
                            <div className={styles.sectionBody}>
                                <div className={styles.sectionHeader}>
                                    <div className={`${styles.sectionIcon} ${styles.iconHistory}`}>
                                        <ReadOutlined />
                                    </div>
                                    <div>
                                        <Title level={4} className={styles.sectionTitle}>
                                            {t('overview_history') || 'Overview & History'}
                                        </Title>
                                        <Text type="secondary" className={styles.sectionSubtitle}>
                                            {t('our_story') || 'Our story and background'}
                                        </Text>
                                    </div>
                                </div>
                                <Paragraph className={styles.sectionText}>
                                    {rtc.overview_text}
                                </Paragraph>
                            </div>
                        </div>

                        {/* Director Bio Card */}
                        <div className={styles.sectionCard}>
                            <div className={`${styles.sectionAccent} ${styles.accentDirector}`} />
                            <div className={styles.sectionBody}>
                                <div className={styles.sectionHeader}>
                                    <div className={`${styles.sectionIcon} ${styles.iconDirector}`}>
                                        <UserOutlined />
                                    </div>
                                    <div>
                                        <Title level={4} className={styles.sectionTitle}>
                                            {t('director_bio') || 'Director Bio'}
                                        </Title>
                                        <Text type="secondary" className={styles.sectionSubtitle}>
                                            {rtc.director_name}
                                        </Text>
                                    </div>
                                </div>
                                <Paragraph className={styles.sectionText}>
                                    {rtc.director_bio || t('no_bio_available')}
                                </Paragraph>
                            </div>
                        </div>

                        {/* Areas of Specialization Card */}
                        <div className={styles.sectionCard}>
                            <div className={`${styles.sectionAccent} ${styles.accentSpecialization}`} />
                            <div className={styles.sectionBody}>
                                <div className={styles.sectionHeader}>
                                    <div className={`${styles.sectionIcon} ${styles.iconSpecialization}`}>
                                        <BulbOutlined />
                                    </div>
                                    <div>
                                        <Title level={4} className={styles.sectionTitle}>
                                            {t('specialization') || 'Areas of Specialization'}
                                        </Title>
                                        <Text type="secondary" className={styles.sectionSubtitle}>
                                            {t('expertise_areas') || 'Our core expertise'}
                                        </Text>
                                    </div>
                                </div>
                                <div className={styles.specializationGrid}>
                                    {rtc.specialization_areas && rtc.specialization_areas.split(',').map((area, index) => (
                                        <div
                                            key={index}
                                            className={styles.specializationChip}
                                            style={{
                                                '--chip-color': tagColors[index % tagColors.length],
                                            }}
                                        >
                                            <span className={styles.chipDot} />
                                            <span className={styles.chipText}>{area.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Right Column: Contact, Location Map */}
                <Col xs={24} lg={6}>
                    <Card title={t('contact_info') || 'Contact Information'} bordered={false} className={styles.sidebarCard}>
                        <Descriptions column={1} layout="vertical" size="small">
                            <Descriptions.Item label={t('contact_person') || 'Contact Person'}>
                                {rtc.contact_person_name}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('email') || 'Email'}>
                                <Space><MailOutlined /> <a href={`mailto:${rtc.contact_person_email}`}>{rtc.contact_person_email}</a></Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={t('phone') || 'Phone'}>
                                <Space><PhoneOutlined /> {rtc.phone_number}</Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title={t('location') || 'Location'} bordered={false} className={styles.sidebarCard}>
                        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                            <EnvironmentOutlined /> {rtc.address}
                        </Paragraph>

                        {rtc.coordinates && (
                            <div className={styles.mapContainer}>
                                <iframe
                                    width="100%"
                                    height="200"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight="0"
                                    marginWidth="0"
                                    src={`https://maps.google.com/maps?q=${rtc.coordinates}&z=15&output=embed`}
                                    title="RTC Location Map"
                                >
                                </iframe>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default OverviewTab;
