import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './PostPendingApprovalModal.module.scss';

const { Title, Paragraph, Text } = Typography;

const PostPendingApprovalModal = ({ visible, onClose }) => {
    const { t } = useTranslation();

    return (
        <Modal
            open={visible}
            centered
            closable={false}
            maskClosable={false}
            keyboard={false}
            footer={null}
            width={460}
            className={styles.approvalModal}
            destroyOnClose
        >
            <div className={styles.body}>
                <div className={styles.iconRing} aria-hidden>
                    <ClockCircleOutlined className={styles.icon} />
                </div>
                <Title level={4} className={styles.title}>
                    {t('post_pending_modal_title', { defaultValue: 'Post submitted for review' })}
                </Title>
                <Paragraph className={styles.message}>
                    {t('post_pending_modal_message', {
                        defaultValue:
                            'Thank you for sharing. Your post has been received and is waiting for administrator approval before it appears in the feed.',
                    })}
                </Paragraph>
                <Text className={styles.note}>
                    {t('post_pending_modal_note', {
                        defaultValue: 'You will see it here once it has been approved.',
                    })}
                </Text>
                <Button
                    type="primary"
                    size="large"
                    block
                    className={styles.okBtn}
                    onClick={onClose}
                >
                    {t('post_pending_modal_ok', { defaultValue: 'OK' })}
                </Button>
            </div>
        </Modal>
    );
};

export default PostPendingApprovalModal;
