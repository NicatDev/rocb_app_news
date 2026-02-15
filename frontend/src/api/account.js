import api from './axios';

export const login = (credentials) => {
    return api.post('auth/login/', credentials);
};

export const registerUser = (userData) => {
    return api.post('auth/register/', userData);
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};
