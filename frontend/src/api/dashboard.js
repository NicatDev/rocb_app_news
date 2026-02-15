import axiosInstance from './axios';

export const getRTCProfiles = async () => {
    try {
        const response = await axiosInstance.get('/dashboard/rtc-profiles/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRTCProfile = async (id) => {
    try {
        const response = await axiosInstance.get(`/dashboard/rtc-profiles/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRTCResources = async (params) => {
    try {
        const response = await axiosInstance.get('/dashboard/rtc-resources/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRTCEvents = async (params) => {
    try {
        const response = await axiosInstance.get('/dashboard/rtc-events/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRTCProjects = async (params) => {
    try {
        const response = await axiosInstance.get('/dashboard/rtc-projects/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const getRTCGallery = async (params) => {
    try {
        const response = await axiosInstance.get('/dashboard/rtc-gallery/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRTCNews = async (params) => {
    try {
        const response = await axiosInstance.get('/dashboard/news/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getNewsDetail = async (id) => {
    try {
        const response = await axiosInstance.get(`/dashboard/news/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Public News API (status=PUBLIC only, global + rtc)
export const getPublicNews = async (params) => {
    try {
        const response = await axiosInstance.get('/public/news/', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getPublicNewsDetail = async (id) => {
    try {
        const response = await axiosInstance.get(`/public/news/${id}/`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

