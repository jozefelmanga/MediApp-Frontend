import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi, setTokens, getTokens, clearTokens, User, LoginCredentials, RegisterPatientData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

  const fetchUser = useCallback(async () => {
    try {
      const userData = await usersApi.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { accessToken } = getTokens();
      if (accessToken) {
        await fetchUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [fetchUser]);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setTokens(response.accessToken, response.refreshToken);
    await fetchUser();
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
