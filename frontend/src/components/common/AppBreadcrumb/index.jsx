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

    // Add remaining path snippets as links
    pathSnippets.forEach((snippet, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        
        // Try to translate the route name, fallback to capitalized literal
        // Replace hyphens with spaces for better fallbacks
        const fallbackTitle = snippet.charAt(0).toUpperCase() + snippet.slice(1).replace(/-/g, ' ');
        const translationKey = snippet.replace(/-/g, '_'); // sometimes keys use underscores
        
        let title = fallbackTitle;
        if (t(translationKey) !== translationKey) {
            title = t(translationKey);
        } else if (t(snippet) !== snippet) {
            title = t(snippet);
        }

        // Replace ID with RTC Name on RTC detail pages (second snippet after 'rtc-dashboard')
        if (index > 0 && pathSnippets[index - 1] === 'rtc-dashboard') {
            title = location.state?.rtcName || title;
        }

        items.push({
            key: url,
            title: <Link to={url} className={styles.breadcrumbLink}>{title}</Link>,
        });
    });

    return (
        <div className={styles.breadcrumbWrapper}>
            <Breadcrumb separator="/" items={items} className={styles.breadcrumb} />
        </div>
    );
};

export default AppBreadcrumb;
