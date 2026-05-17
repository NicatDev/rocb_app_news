import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import RichTextReadMore from '../../../../components/common/RichTextReadMore';
import SpecializationDisplay from '../../../../components/common/SpecializationDisplay';
import styles from './style.module.scss';

const { Title, Text, Paragraph } = Typography;

const OverviewTab = ({ rtc }) => {
    const { t } = useTranslation();

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
                                <RichTextReadMore
                                    content={rtc.mission_statement}
                                    className={styles.sectionText}
                                />
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
                                <RichTextReadMore
                                    content={rtc.overview_text}
                                    className={styles.sectionText}
                                />
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
                                <RichTextReadMore
                                    content={rtc.director_bio}
                                    emptyFallback={t('no_bio_available')}
                                    className={styles.sectionText}
                                />
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
                                <SpecializationDisplay
                                    content={rtc.specialization_areas}
                                    className={styles.sectionText}
                                />
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Right Column: Contact, Location Map */}
                <Col xs={24} lg={8}>
                    <div className={styles.modernSidebar}>
                        <div className={styles.rtcBrandSection}>
                            <div className={styles.rtcLogoWrapper}>
                                {rtc.logo ? (
                                    <img src={rtc.logo} alt={`${rtc.name} logo`} className={styles.rtcBrandLogo} />
                                ) : (
                                    <div className={styles.rtcLogoPlaceholder}>
                                        <GlobalOutlined />
                                    </div>
                                )}
                            </div>
                            <Title level={3} className={styles.rtcBrandName}>{rtc.name}</Title>
                        </div>

                        <div className={styles.modernInfoList}>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('host_country') || 'Host Country'}</Text>
                                <Text className={styles.infoValue}>{rtc.host_country || '-'}</Text>
                            </div>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('established') || 'Established'}</Text>
                                <Text className={styles.infoValue}>{rtc.establishment_year || '-'}</Text>
                            </div>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('director') || 'Director'}</Text>
                                <Text className={styles.infoValue}>{rtc.director_name || '-'}</Text>
                            </div>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('contact_person') || 'Contact Person'}</Text>
                                <Text className={styles.infoValue}>{rtc.contact_person_name || '-'}</Text>
                            </div>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('email') || 'Email'}</Text>
                                <Text className={styles.infoValue}>
                                    {rtc.contact_person_email ? <a href={`mailto:${rtc.contact_person_email}`}>{rtc.contact_person_email}</a> : '-'}
                                </Text>
                            </div>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('phone') || 'Phone'}</Text>
                                <Text className={styles.infoValue}>{rtc.phone_number || '-'}</Text>
                            </div>
                            <div className={styles.modernInfoItem}>
                                <Text className={styles.infoLabel}>{t('website') || 'Website'}</Text>
                                <Text className={styles.infoValue}>
                                    {rtc.website ? (
                                        <a href={rtc.website} target="_blank" rel="noopener noreferrer">
                                            {new URL(rtc.website).hostname.replace('www.', '')}
                                        </a>
                                    ) : '-'}
                                </Text>
                            </div>
                        </div>
                    </div>

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
