import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeOutlined } from '@ant-design/icons';
import styles from './style.module.scss';

const AppBreadcrumb = () => {
    const location = useLocation();
    const { t } = useTranslation();

    // Split the pathname and remove empty parts
    const pathSnippets = location.pathname.split('/').filter(i => i);

    // Setup home icon and text
    const homeText = t('home');
    const displayHome = homeText !== 'home' ? homeText : 'Home';

    // Create the "Home" item
    const items = [
        {
            key: 'home',
            title: (
                <Link to="/" className={styles.breadcrumbLink}>
                    <HomeOutlined /> <span className={styles.homeText}>{displayHome}</span>
                </Link>
            ),
        },
    ];

    if (pathSnippets.length === 0 || (pathSnippets.length === 1 && pathSnippets[0] === 'news')) {
        return null;
    }

    const isNewsDetail = pathSnippets[0] === 'news' && pathSnippets.length > 1;

    pathSnippets.forEach((snippet, index) => {
        const isLast = index === pathSnippets.length - 1;
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;

        const fallbackTitle = snippet.charAt(0).toUpperCase() + snippet.slice(1).replace(/-/g, ' ');
        const translationKey = snippet.replace(/-/g, '_');

        let title = fallbackTitle;
        if (t(translationKey) !== translationKey) {
            title = t(translationKey);
        } else if (t(snippet) !== snippet) {
            title = t(snippet);
        }

        if (snippet === 'news' && index === 0) {
            title = t('news') !== 'news' ? t('news') : 'News';
        }

        if (isNewsDetail && index === pathSnippets.length - 1) {
            title = location.state?.newsTitle || fallbackTitle;
        }

        if (index > 0 && pathSnippets[index - 1] === 'rtc-dashboard') {
            title = location.state?.rtcName || title;
        }

        items.push({
            key: url,
            title: isLast ? (
                <span className={styles.breadcrumbCurrent}>{title}</span>
            ) : (
                <Link to={url} className={styles.breadcrumbLink}>{title}</Link>
            ),
        });
    });

    return (
        <div className={styles.breadcrumbWrapper}>
            <Breadcrumb separator="/" items={items} className={styles.breadcrumb} />
        </div>
    );
};

export default AppBreadcrumb;
