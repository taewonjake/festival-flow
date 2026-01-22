import axiosInstance from './axiosConfig';

export const chatApi = {
  // 채팅방 생성
  createChatRoom: () => {
    return axiosInstance.post('/chat/rooms');
  },

  // 내 채팅방 목록 조회
  getMyChatRooms: () => {
    return axiosInstance.get('/chat/rooms/me');
  },

  // 채팅 메시지 조회
  getMessages: (chatRoomId) => {
    return axiosInstance.get(`/chat/rooms/${chatRoomId}/messages`);
  },

  // 메시지 전송
  sendMessage: (chatRoomId, message) => {
    return axiosInstance.post(`/chat/rooms/${chatRoomId}/messages`, { message });
  },
};
