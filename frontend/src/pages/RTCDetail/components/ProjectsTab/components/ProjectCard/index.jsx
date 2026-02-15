import React from 'react';
import { Card, Typography, Tag, Button, Space } from 'antd';
import { CalendarOutlined, TeamOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './style.module.scss';

const { Title, Paragraph, Text } = Typography;

const ProjectCard = ({ project, onReadMore }) => {
    const { t } = useTranslation();

    return (
        <Card className={styles.projectCard} hoverable>
            <div className={styles.cardHeader}>
                <div className={styles.timeframe}>
                    <CalendarOutlined /> {project.timeframe}
                </div>
            </div>

            <Title level={4} className={styles.projectTitle} ellipsis={{ rows: 2, tooltip: project.name }}>
                {project.name}
            </Title>

            <div className={styles.partnersSection}>
                <Text type="secondary" className={styles.label}>
                    <TeamOutlined /> {t('partners') || 'Partners'}
                </Text>
                <div className={styles.partnersList}>
                    {project.partners}
                </div>
            </div>

            <div className={styles.descriptionSection}>
                <Paragraph
                    className={styles.description}
                    ellipsis={{ rows: 3, expandable: false }}
                >
                    {project.description}
                </Paragraph>
                <Button
                    type="link"
                    className={styles.readMoreBtn}
                    onClick={() => onReadMore(project)}
                >
                    {t('read_more') || 'Read More'} <ArrowRightOutlined />
                </Button>
            </div>
        </Card>
    );
};

export default ProjectCard;
