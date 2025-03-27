import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { usersApi } from '../api/supabase/supabaseApi'; 

const AuthContext = createContext(null);

const initalAuthState = [];

const AuthContextProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation(); // Initialize location
    const navigate = useNavigate(); // Initialize navigate

    // Set Auth Data
    const setAuthData = async (token, role) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
    };

    const authenticate = async (uid, role) => {
        setIsLoading(true);

        try {
            const isAdmin = role.toLowerCase() === 'admin';

            if (isAdmin) {
                await setAuthData(uid, role);
                setIsAuthenticated(true);
                const origin = location.state?.intent?.pathname || "/";
                navigate(origin);
            // } else if (isCleaner) {
            //     await setAuthData(uid, role);
            //     setIsAuthenticated(true);
            } else {
                await setAuthData(uid, role);
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('Exception when authenticating user', err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Remove Auth Data
    const removeAuthData = async () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
    };

    const logout = async () => {
        await removeAuthData();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, authenticate, logout, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the context
export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;