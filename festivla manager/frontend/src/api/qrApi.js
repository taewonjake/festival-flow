import axiosInstance from './axiosConfig';

export const qrApi = {
  // QR 코드 생성
  generateQrCode: (waitingId) => {
    return axiosInstance.get(`/qr/generate/${waitingId}`);
  },
};
