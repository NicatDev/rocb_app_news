import axios from 'axios';

const translateClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://app.rocbeurope.org/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000,
});

export const getTranslateStatus = async () => {
    const response = await translateClient.get('translate/');
    return response.data;
};

export const translateHtmlApi = async (html, targetLanguage, sourceLanguage = 'en') => {
    try {
        const response = await translateClient.post('translate/', {
            html,
            source_language: sourceLanguage,
            target_language: targetLanguage,
        });
        return response.data.html;
    } catch (error) {
        const detail = error.response?.data?.detail;
        if (detail) {
            const wrapped = new Error(detail);
            wrapped.response = error.response;
            throw wrapped;
        }
        throw error;
    }
};
