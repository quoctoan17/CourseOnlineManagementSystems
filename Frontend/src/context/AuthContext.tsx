import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '@/services/api';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  created_at?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (fullName: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword?: string) => Promise<void>;
  getMe: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isInstructor: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await authService.login(email, password);

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);

        // Store in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, confirmPassword?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await authService.register(fullName, email, password, confirmPassword);

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);

        // Store in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng ký thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
    } catch (err: any) {
      const errorMessage = err.message || 'Thay đổi mật khẩu thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getMe = async () => {
    try {
      const response: any = await authService.getMe();
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (err: any) {
      console.error('Failed to get user profile:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = (): boolean => {
    return token !== null && user !== null;
  };

  const isAdmin = (): boolean => {
    return isAuthenticated() && user?.role === 'admin';
  };

  const isInstructor = (): boolean => {
    return isAuthenticated() && (user?.role === 'instructor' || user?.role === 'admin');
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    register,
    changePassword,
    getMe,
    isAuthenticated,
    isAdmin,
    isInstructor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
