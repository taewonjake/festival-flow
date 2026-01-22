import axiosInstance from './axiosConfig';

export const authApi = {
  // 회원가입/로그인 (이름 + 전화번호)
  login: (name, phoneNumber) => {
    return axiosInstance.post('/users/login', { name, phoneNumber });
  },

  // 로그아웃
  logout: () => {
    return axiosInstance.post('/auth/logout');
  },

  // 현재 사용자 정보 조회
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },
};
