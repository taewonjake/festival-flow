import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 사용자 ID가 있다면 헤더에 추가
    const userStr = localStorage.getItem('user-storage');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const userId = userData?.state?.user?.id || userData?.state?.user?.userId;
        if (userId) {
          config.headers['X-User-Id'] = userId;
        }
      } catch (e) {
        // 파싱 실패 시 무시
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized 처리
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/student/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
