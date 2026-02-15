import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, registerUser as apiRegister, logout as apiLogout } from '../api/account';
import { getProfile } from '../api/profile';
import { jwtDecode } from "jwt-decode";
import { message } from 'antd';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (decoded) => {
        try {
            const profile = await getProfile();
            setUser({ ...decoded, ...profile });
        } catch (error) {
            // If profile fetch fails, use JWT data only
            setUser(decoded);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    apiLogout();
                    setUser(null);
                    setLoading(false);
                } else {
                    setUser(decoded);
                    fetchUserProfile(decoded).finally(() => setLoading(false));
                    return;
                }
            } catch (error) {
                console.error("Invalid token", error);
                apiLogout();
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await apiLogin(credentials);
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            const decoded = jwtDecode(access);
            setUser(decoded);
            fetchUserProfile(decoded);
            message.success('Login successful');
            return true;
        } catch (error) {
            console.error("Login failed", error);
            const errorMsg = error.response?.data?.detail || 'Login failed';
            message.error(errorMsg);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await apiRegister(userData);
            message.success('Registration successful. Please login.');
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        message.info('Logged out');
    };

    const refreshProfile = async () => {
        if (user) {
            try {
                const profile = await getProfile();
                setUser(prev => ({ ...prev, ...profile }));
            } catch (e) { /* ignore */ }
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

