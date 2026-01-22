import axiosInstance from './axiosConfig';

export const adminApi = {
  // 대시보드 통계 조회
  getDashboardStats: () => {
    return axiosInstance.get('/admin/dashboard/stats');
  },

  // 전체 웨이팅 목록 조회
  getAllWaitings: (status) => {
    return axiosInstance.get('/admin/waitings', { params: { status } });
  },

  // 웨이팅 호출
  callWaiting: (waitingId) => {
    return axiosInstance.post(`/admin/waitings/${waitingId}/call`);
  },

  // 입장 확인
  confirmEntry: (waitingId) => {
    return axiosInstance.post(`/admin/waitings/${waitingId}/confirm`);
  },

  // 웨이팅 취소 (관리자)
  cancelWaiting: (waitingId) => {
    return axiosInstance.delete(`/admin/waitings/${waitingId}`);
  },

  // 테이블 할당
  assignTable: (waitingId, tableId) => {
    return axiosInstance.post(`/admin/waitings/${waitingId}/assign`, { tableId });
  },

  // 테이블 목록 조회
  getTables: () => {
    return axiosInstance.get('/admin/tables');
  },

  // 테이블 상태 변경
  updateTableStatus: (tableId, status) => {
    return axiosInstance.put(`/admin/tables/${tableId}/status`, { status });
  },

  // QR 코드 검증
  verifyQrCode: (qrData) => {
    return axiosInstance.post('/admin/qr/verify', { qrData });
  },

  // 채팅방 목록 조회 (관리자)
  getChatRooms: (status) => {
    return axiosInstance.get('/admin/chat/rooms', { params: { status } });
  },

  // 채팅방 메시지 조회 (관리자)
  getChatMessages: (chatRoomId) => {
    return axiosInstance.get(`/admin/chat/rooms/${chatRoomId}/messages`);
  },

  // 메시지 전송 (관리자)
  sendChatMessage: (chatRoomId, message) => {
    return axiosInstance.post(`/admin/chat/rooms/${chatRoomId}/messages`, { message });
  },

  // 채팅방 닫기 (관리자)
  closeChatRoom: (chatRoomId) => {
    return axiosInstance.post(`/admin/chat/rooms/${chatRoomId}/close`);
  },
};
