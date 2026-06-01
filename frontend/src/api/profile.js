import axiosInstance from './axios';

// Get current user profile
export const getProfile = async () => {
    try {
        const response = await axiosInstance.get('/auth/profile/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update profile field (partial update)
export const updateProfile = async (data) => {
    try {
        const headers = {};
        if (data instanceof FormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await axiosInstance.patch('/auth/profile/', data, { headers });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const changePassword = async (data) => {
    const response = await axiosInstance.post('/auth/change-password/', data);
    return response.data;
};
