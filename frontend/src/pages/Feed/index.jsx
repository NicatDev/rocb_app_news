import React, { useState, useEffect, useCallback } from 'react';
import { Input, Typography, Empty, Spin, Button, Avatar, Tag, Image, message } from 'antd';
import {
    SearchOutlined, GlobalOutlined, BankOutlined, ArrowUpOutlined,
    CommentOutlined, PaperClipOutlined, SendOutlined, UserOutlined, PlusOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './style.module.scss';
import { getFeedPosts, toggleUpvote, getPostComments, createComment } from '../../api/feed';
import useDebounce from '../../hooks/useDebounce';
import CreatePostModal from './components/CreatePostModal';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;

const Feed = () => {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState('');
    const debouncedSearch = useDebounce(searchText, 500);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [newsType, setNewsType] = useState('all');
    const [nextPage, setNextPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);

    // Expanded states
    const [expandedPosts, setExpandedPosts] = useState({});
    const [showComments, setShowComments] = useState({});
    const [commentsData, setCommentsData] = useState({});
    const [commentText, setCommentText] = useState({});
    const [commentLoading, setCommentLoading] = useState({});

    const fetchPosts = useCallback(async (page = 1, append = false) => {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = {
                page,
                page_size: 10,
                ordering: '-created_at',
            };
            if (debouncedSearch) params.search = debouncedSearch;
            if (newsType !== 'all') params.news_type = newsType;

            const data = await getFeedPosts(params);
            if (data.results) {
                if (append) {
                    setPosts(prev => [...prev, ...data.results]);
                } else {
                    setPosts(data.results);
                }
                setHasMore(!!data.next);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Failed to fetch feed:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [debouncedSearch, newsType]);

    useEffect(() => {
        fetchPosts(1, false);
    }, [fetchPosts]);

    const handleLoadMore = () => {
        fetchPosts(currentPage + 1, true);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleFilterChange = (type) => {
        setNewsType(type);
        setCurrentPage(1);
    };

    // Toggle expand post
    const toggleExpand = (postId) => {
        setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // Toggle upvote
    const handleUpvote = async (postId) => {
        try {
            const result = await toggleUpvote(postId);
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? {
                        ...p,
                        upvote_count: result.upvote_count,
                        is_upvoted: result.status === 'added'
                    }
                    : p
            ));
        } catch (error) {
            message.error(t('login_required') || 'Please log in to upvote');
        }
    };

    // Toggle comments
    const toggleComments = async (postId) => {
        const isOpen = showComments[postId];
        setShowComments(prev => ({ ...prev, [postId]: !isOpen }));

        if (!isOpen && !commentsData[postId]) {
            try {
                const data = await getPostComments(postId);
                setCommentsData(prev => ({ ...prev, [postId]: data }));
            } catch (error) {
                console.error('Failed to load comments', error);
            }
        }
    };

    // Submit comment
    const handleSubmitComment = async (postId) => {
        const text = commentText[postId]?.trim();
        if (!text) return;

        setCommentLoading(prev => ({ ...prev, [postId]: true }));
        try {
            const newComment = await createComment(postId, { content: text });
            setCommentsData(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newComment]
            }));
            setCommentText(prev => ({ ...prev, [postId]: '' }));
            // Update comment count
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
            ));
        } catch (error) {
            message.error(t('login_required') || 'Please log in to comment');
        } finally {
            setCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const renderPost = (post) => {
        const isExpanded = expandedPosts[post.id];
        const isCommentsOpen = showComments[post.id];
        const comments = commentsData[post.id] || [];
        const hasLongContent = post.content && post.content.length > 200;

        return (
            <div key={post.id} className={styles.postCard}>
                {/* Header */}
                <div className={styles.postHeader}>
                    <div className={styles.authorRow}>
                        <Avatar
                            size={40}
                            src={post.author_info?.avatar}
                            icon={!post.author_info?.avatar && <UserOutlined />}
                            style={{ backgroundColor: !post.author_info?.avatar ? (post.is_global ? '#6366f1' : '#0ea5e9') : undefined }}
                        />
                        <div className={styles.authorInfo}>
                            <span className={styles.authorName}>
                                {post.author_info
                                    ? `${post.author_info.first_name} ${post.author_info.last_name}`.trim() || post.author_info.username
                                    : t('anonymous')
                                }
                            </span>
                            <span className={styles.postDate}>{dayjs(post.created_at).fromNow()}</span>
                        </div>
                    </div>
                    <Tag color={post.is_global ? '#6366f1' : '#0ea5e9'}>
                        {post.is_global
                            ? (t('global') || 'Global')
                            : (post.rtc_name || 'RTC')
                        }
                    </Tag>
                </div>

                {/* Body */}
                <div className={styles.postBody}>
                    <Title level={4} className={styles.postTitle}>{post.title}</Title>
                    {post.description && (
                        <div className={styles.postDescription}>{post.description}</div>
                    )}
                    <div className={`${styles.postContent} ${!isExpanded && hasLongContent ? styles.contentCollapsed : ''}`}>
                        {post.content}
                    </div>
                    {hasLongContent && (
                        <Button type="link" className={styles.readMoreBtn} onClick={() => toggleExpand(post.id)}>
                            {isExpanded ? (t('show_less') || 'Show Less') : (t('read_more') || 'Read More')}
                        </Button>
                    )}
                </div>

                {/* Image */}
                {post.image && (
                    <div className={styles.imageWrapper}>
                        <Image
                            src={post.image}
                            alt={post.title}
                            className={styles.postImage}
                            preview={{ mask: '🔍' }}
                        />
                    </div>
                )}

                {/* Attachment */}
                {post.attachment && (
                    <div className={styles.attachmentWrapper}>
                        <a
                            href={post.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.attachmentLink}
                        >
                            <PaperClipOutlined /> {t('download_attachment') || 'Download Attachment'}
                        </a>
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actionsBar}>
                    <button
                        className={`${styles.actionBtn} ${post.is_upvoted ? styles.actionBtnActive : ''}`}
                        onClick={() => handleUpvote(post.id)}
                    >
                        <ArrowUpOutlined />
                        {post.upvote_count || 0}
                    </button>
                    <button
                        className={`${styles.actionBtn} ${isCommentsOpen ? styles.actionBtnActive : ''}`}
                        onClick={() => toggleComments(post.id)}
                    >
                        <CommentOutlined />
                        {post.comment_count || 0} {t('comments_label') || ''}
                    </button>
                </div>

                {/* Comments Section */}
                {isCommentsOpen && (
                    <div className={styles.commentsSection}>
                        {/* Comment Input */}
                        <div className={styles.commentInputRow}>
                            <Input
                                className={styles.commentInput}
                                placeholder={t('write_comment') || 'Write a comment...'}
                                value={commentText[post.id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onPressEnter={() => handleSubmitComment(post.id)}
                            />
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<SendOutlined />}
                                className={styles.commentSendBtn}
                                loading={commentLoading[post.id]}
                                onClick={() => handleSubmitComment(post.id)}
                            />
                        </div>

                        {/* Latest comment preview or all comments */}
                        {comments.length > 0 ? (
                            <>
                                {/* Show first comment */}
                                <div className={styles.commentItem}>
                                    <Avatar size={32} icon={<UserOutlined />} />
                                    <div className={styles.commentBubble}>
                                        <span className={styles.commentAuthor}>
                                            {comments[0].author_info
                                                ? `${comments[0].author_info.first_name} ${comments[0].author_info.last_name}`.trim() || comments[0].author_info.username
                                                : t('anonymous')
                                            }
                                        </span>
                                        <span className={styles.commentDate}>
                                            {dayjs(comments[0].created_at).fromNow()}
                                        </span>
                                        <div className={styles.commentText}>{comments[0].content}</div>
                                    </div>
                                </div>

                                {/* Show remaining comments if expanded */}
                                {expandedPosts[`comments_${post.id}`] && comments.slice(1).map(c => (
                                    <div key={c.id} className={styles.commentItem}>
                                        <Avatar size={32} icon={<UserOutlined />} />
                                        <div className={styles.commentBubble}>
                                            <span className={styles.commentAuthor}>
                                                {c.author_info
                                                    ? `${c.author_info.first_name} ${c.author_info.last_name}`.trim() || c.author_info.username
                                                    : t('anonymous')
                                                }
                                            </span>
                                            <span className={styles.commentDate}>
                                                {dayjs(c.created_at).fromNow()}
                                            </span>
                                            <div className={styles.commentText}>{c.content}</div>
                                        </div>
                                    </div>
                                ))}

                                {/* View all comments button */}
                                {comments.length > 1 && !expandedPosts[`comments_${post.id}`] && (
                                    <Button
                                        type="link"
                                        className={styles.viewAllComments}
                                        onClick={() => setExpandedPosts(prev => ({
                                            ...prev,
                                            [`comments_${post.id}`]: true
                                        }))}
                                    >
                                        {t('view_all_comments') || 'View all'} {comments.length} {t('comments_label') || 'comments'}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                {t('no_comments_yet') || 'No comments yet. Be the first to comment!'}
                            </Text>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={styles.feedContainer}>
            <div className={styles.pageHeader}>
                <Title level={2}>{t('activity_feed') || 'Activity Feed'}</Title>
                <Text className={styles.subtitle}>
                    {t('feed_subtitle') || 'Latest updates from the community'}
                </Text>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className={styles.createBtn}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        <span className={styles?.createPost}>{t('create_post') || 'Create Post'}</span>
                    </Button>
                    <Button
                        className={`${styles.filterBtn} ${newsType === 'all' ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >
                        {t('all') || 'All'}
                    </Button>
                    <Button
                        className={`${styles.filterBtn} ${newsType === 'global' ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange('global')}
                        icon={<GlobalOutlined />}
                    >
                        <span className={styles?.mbl}>  {t('global') || 'Global'}</span>
                    </Button>
                    <Button
                        className={`${styles.filterBtn} ${newsType === 'rtc' ? styles.filterBtnActive : ''}`}
                        onClick={() => handleFilterChange('rtc')}
                        icon={<BankOutlined />}
                    >
                        <span className={styles?.mbl}> {t('rtc') || 'RTC'}</span>
                    </Button>
                </div>

                <Search
                    placeholder={t('search_feed') || 'Search posts...'}
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchBar}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <Spin size="large" />
                </div>
            ) : posts.length > 0 ? (
                <>
                    {posts.map(post => renderPost(post))}

                    {hasMore && (
                        <div className={styles.loadMoreContainer}>
                            <Button
                                className={styles.loadMoreBtn}
                                onClick={handleLoadMore}
                                loading={loadingMore}
                            >
                                {t('load_more') || 'Load More'}
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <Empty description={t('no_posts_found') || 'No posts found'} />
            )}

            <CreatePostModal
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSuccess={() => fetchPosts(1, false)}
            />
        </div>
    );
};

export default Feed;
