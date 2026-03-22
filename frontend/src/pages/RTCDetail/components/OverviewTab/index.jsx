import React, { useState } from 'react';
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
            {/* RTC Hero Banner */}
            {/* <div className={styles.rtcHeroBanner}>
                <div className={styles.rtcHeroLogo}>
                    {rtc.logo ? (
                        <img
                            src={rtc.logo}
                            alt={`${rtc.name} logo`}
                            className={styles.heroLogoImg}
                        />
                    ) : (
                        <div className={styles.heroLogoPlaceholder}>
                            <GlobalOutlined />
                        </div>
                    )}
                </div>
                <div className={styles.rtcHeroInfo}>
                    <Title level={2} className={styles.heroName}>{rtc.name}</Title>
                    {rtc.host_country && (
                        <Text type="secondary" className={styles.heroCountry}>
                            <EnvironmentOutlined /> {rtc.host_country}
                        </Text>
                    )}
                </div>
            </div> */}

            <Row gutter={[24, 24]}>
                
                {/* Center Column: Redesigned Sections */}
                <Col xs={24} lg={16}>
                    <div className={styles.sectionsContainer}>
                        {/* Mission & Vision Card */}
                        <div className={styles.sectionCard}>
                            <div className={`${styles.sectionAccent} ${styles.accentMission}`} />
                            <div className={styles.sectionBody}>
                                <div className={styles.sectionHeader}>
                                    <Title level={4} className={styles.sectionTitle}>
                                        {t('mission_vision') || 'Mission & Vision'}
                                    </Title>
                                    <Text type="secondary" className={styles.sectionSubtitle}>
                                        {t('our_purpose') || 'Our purpose and goals'}
                                    </Text>
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
                                    <Title level={4} className={styles.sectionTitle}>
                                        {t('overview_history') || 'Overview & History'}
                                    </Title>
                                    <Text type="secondary" className={styles.sectionSubtitle}>
                                        {t('our_story') || 'Our story and background'}
                                    </Text>
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
                                    <Title level={4} className={styles.sectionTitle}>
                                        {t('director_bio') || 'Director Bio'}
                                    </Title>
                                    <Text type="secondary" className={styles.sectionSubtitle}>
                                        {rtc.director_name}
                                    </Text>
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
                                    <Title level={4} className={styles.sectionTitle}>
                                        {t('specialization') || 'Areas of Specialization'}
                                    </Title>
                                    <Text type="secondary" className={styles.sectionSubtitle}>
                                        {t('expertise_areas') || 'Our core expertise'}
                                    </Text>
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
                <Col xs={24} lg={8}>
                    <Card title={t('rtc_info') || 'RTC Information'} bordered={false} className={styles.sidebarCard}>
                        <Descriptions column={1} layout="vertical" size="small">
                            <Descriptions.Item label={t('host_country') || 'Host Country'}>
                                {rtc.host_country}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('established') || 'Established'}>
                                {rtc.establishment_year}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('director') || 'Director'}>
                                {rtc.director_name}
                            </Descriptions.Item>
                            <Descriptions.Item label={t('website') || 'Website'}>
                                {rtc.website ? (
                                    <a href={rtc.website} target="_blank" rel="noopener noreferrer">
                                        {new URL(rtc.website).hostname}
                                    </a>
                                ) : '-'}
                            </Descriptions.Item>
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
