import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // 로그인
      login: (user, token) => {
        // userId가 있으면 id 필드도 추가 (axiosConfig 호환성)
        const userWithId = user?.userId ? { ...user, id: user.userId } : user;
        set({
          user: userWithId,
          token,
          isAuthenticated: true,
        });
        if (token) {
          localStorage.setItem('token', token);
        }
      },

      // 로그아웃
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
      },

      // 사용자 정보 업데이트
      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useUserStore;
