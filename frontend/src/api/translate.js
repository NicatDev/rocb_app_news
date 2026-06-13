import axios from 'axios';

const translateClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://app.rocbeurope.org/api/v1/',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const translateHtmlApi = async (html, targetLanguage, sourceLanguage = 'en') => {
    const response = await translateClient.post('translate/', {
        html,
        source_language: sourceLanguage,
        target_language: targetLanguage,
    });
    return response.data.html;
};
