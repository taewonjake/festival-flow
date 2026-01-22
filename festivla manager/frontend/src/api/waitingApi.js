import axiosInstance from './axiosConfig';

export const waitingApi = {
  // 웨이팅 등록
  createWaiting: (headCount) => {
    return axiosInstance.post('/waitings', { headCount });
  },

  // 내 웨이팅 조회
  getMyWaiting: () => {
    return axiosInstance.get('/waitings/me');
  },

  // 웨이팅 취소
  cancelWaiting: (waitingId) => {
    return axiosInstance.delete(`/waitings/${waitingId}`);
  },

  // 웨이팅 상태 조회
  getWaitingStatus: (waitingId) => {
    return axiosInstance.get(`/waitings/${waitingId}`);
  },
};
