import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi, setTokens, getTokens, clearTokens, User, LoginCredentials, RegisterPatientData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterPatientData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // NOTE: temporarily skip fetching `/users/me` to allow the app to proceed
  // immediately after signin. Authentication state is derived from token
  // presence while the user profile may be fetched/created later.
  const fetchUser = useCallback(async () => {
    try {
      const userData = await usersApi.getProfile();
      console.debug('fetchUser -> received user:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user (ignored for now):', error);
      // do not clear tokens here — let the app proceed with token-based auth
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      // Do not call fetchUser during init — rely on tokens for auth gating
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    console.debug('login response:', response);
    if (!response || !response.accessToken) {
      throw new Error('Login response did not include an access token');
    }
    // Save tokens and do NOT fetch the user profile now — allow app to proceed.
    setTokens(response.accessToken, response.refreshToken);
    setUser(null);
  };

  const register = async (data: RegisterPatientData) => {
    await usersApi.registerPatient(data);
    // Auto-login after registration
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const tokens = getTokens();
  const isAuthenticated = !!user || !!tokens.accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        fetchUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
