import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { authApi } from '../api/authApi';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, updateUser } = useUserStore();
  const navigate = useNavigate();

  // 현재 사용자 정보 조회
  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      updateUser(response.data);
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      logout();
    }
  };

  // 인증 확인
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated]);

  // 로그인 처리
  const handleLogin = async (kakaoToken) => {
    try {
      const response = await authApi.login(kakaoToken);
      const { user, token } = response.data;
      login(user, token);
      
      // 역할에 따라 리다이렉트
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/main');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      logout();
      navigate('/student/main');
    }
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    fetchCurrentUser,
  };
};
