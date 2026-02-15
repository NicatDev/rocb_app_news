import axiosInstance from './axios';

// Feed Posts
export const getFeedPosts = async (params) => {
    try {
        const response = await axiosInstance.get('/feed/posts/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getFeedPost = async (id) => {
    try {
        const response = await axiosInstance.get(`/feed/posts/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Upvote toggle
export const toggleUpvote = async (postId) => {
    try {
        const response = await axiosInstance.post(`/feed/posts/${postId}/upvote/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Comments
export const getPostComments = async (postId) => {
    try {
        const response = await axiosInstance.get(`/feed/posts/${postId}/comments/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createComment = async (postId, data) => {
    try {
        const response = await axiosInstance.post(`/feed/posts/${postId}/comments/`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create post
export const createPost = async (data) => {
    try {
        const headers = {};
        if (data instanceof FormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await axiosInstance.post('/feed/posts/', data, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get user's RTCs (where owner or member)
export const getMyRTCs = async () => {
    try {
        const response = await axiosInstance.get('/feed/posts/my_rtcs/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

