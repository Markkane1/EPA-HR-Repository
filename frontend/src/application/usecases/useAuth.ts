import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { User } from '../../domain/entities';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await apiService.getMe();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const { user } = await apiService.login(email, password);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const register = async (userData: any) => {
    await apiService.register(userData);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser?.role) return false;
    // System admin role has all permissions
    if (currentUser.role.isSystemRole && currentUser.role.name === 'Admin') return true;
    return currentUser.role.permissions?.includes(permission) ?? false;
  };

  const isAdmin = currentUser?.role?.isSystemRole === true && currentUser?.role?.name === 'Admin';

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin,
    hasPermission,
    isLoading,
    login,
    logout,
    register,
    refetchUser: fetchMe,
  };
}
