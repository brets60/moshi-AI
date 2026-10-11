import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { RegistrationFormData } from '../utils/validation';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  preferred_language: string;
  farm_name?: string;
  farm_location?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegistrationFormData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadExistingSession();
  }, []);

  const loadExistingSession = async () => {
    try {
      setIsLoading(true);
      const savedToken = await api.getToken();
      if (savedToken) {
        setToken(savedToken);
        const profile = await api.getProfile();
        if (profile) {
          setUser(profile);
        } else {
          // Default profile if none stored
          const fallback = {
            id: 'user_active',
            full_name: 'Farmer',
            email: 'farmer@agrimate.local',
            preferred_language: 'en',
            farm_name: 'Green Horizon Farm',
            farm_location: 'Central Valley',
          };
          setUser(fallback);
        }
      }
    } catch (e) {
      console.warn('Session load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegistrationFormData) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.setToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await api.forgotPassword(email);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      if (profile) setUser(profile);
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
