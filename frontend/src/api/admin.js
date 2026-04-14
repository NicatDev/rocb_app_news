import axiosInstance from './axios';

// Helper to handle headers for FormData
const getHeaders = (data) => {
    if (data instanceof FormData) {
        return { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    return {};
};

const adminService = {
    // RTC Profile
    getMyRTC: () => axiosInstance.get('/admin/my-rtc/'),
    updateMyRTC: (id, data) => axiosInstance.patch(`/admin/my-rtc/${id}/`, data, getHeaders(data)),

    // News
    getNews: (params) => axiosInstance.get('/admin/news/', { params }),
    getNewsDetail: (id) => axiosInstance.get(`/admin/news/${id}/`),
    createNews: (data) => axiosInstance.post('/admin/news/', data, getHeaders(data)),
    updateNews: (id, data) => axiosInstance.patch(`/admin/news/${id}/`, data, getHeaders(data)), // Using patch for partial updates
    deleteNews: (id) => axiosInstance.delete(`/admin/news/${id}/`),
    appendNewsExtraImages: (id, data) =>
        axiosInstance.post(`/admin/news/${id}/append-extra-images/`, data, getHeaders(data)),
    deleteNewsExtraImage: (newsId, imageId) =>
        axiosInstance.delete(`/admin/news/${newsId}/extra-images/${imageId}/`),

    // Events
    getEvents: (params) => axiosInstance.get('/admin/events/', { params }),
    getEventDetail: (id) => axiosInstance.get(`/admin/events/${id}/`),
    createEvent: (data) => axiosInstance.post('/admin/events/', data, getHeaders(data)),
    updateEvent: (id, data) => axiosInstance.patch(`/admin/events/${id}/`, data, getHeaders(data)),
    deleteEvent: (id) => axiosInstance.delete(`/admin/events/${id}/`),

    // Resources
    getResources: (params) => axiosInstance.get('/admin/resources/', { params }),
    createResource: (data) => axiosInstance.post('/admin/resources/', data, getHeaders(data)),
    updateResource: (id, data) => axiosInstance.patch(`/admin/resources/${id}/`, data, getHeaders(data)),
    deleteResource: (id) => axiosInstance.delete(`/admin/resources/${id}/`),

    // Projects
    getProjects: (params) => axiosInstance.get('/admin/projects/', { params }),
    createProject: (data) => axiosInstance.post('/admin/projects/', data, getHeaders(data)),
    updateProject: (id, data) => axiosInstance.patch(`/admin/projects/${id}/`, data, getHeaders(data)),
    deleteProject: (id) => axiosInstance.delete(`/admin/projects/${id}/`),

    // Gallery
    getGallery: (params) => axiosInstance.get('/admin/gallery/', { params }),
    createGalleryImage: (data) => axiosInstance.post('/admin/gallery/', data, getHeaders(data)),
    updateGalleryImage: (id, data) => axiosInstance.patch(`/admin/gallery/${id}/`, data, getHeaders(data)),
    deleteGalleryImage: (id) => axiosInstance.delete(`/admin/gallery/${id}/`),
};

export default adminService;
