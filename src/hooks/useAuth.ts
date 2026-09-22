import { useState, useEffect } from 'react';

export interface UserProfile {
  username: string;
  email: string;
  school?: string;
  class?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Kiểm tra thông tin lưu trữ tạm thời trong localStorage
    const savedUser = localStorage.getItem('web_study_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('web_study_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('web_study_user');
  };

  return { user, login, logout };
}