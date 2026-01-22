import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/adminApi';

const AdminChatCenter = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  // 채팅방 목록 조회
  const { data: chatRoomsData } = useQuery({
    queryKey: ['adminChatRooms', filter],
    queryFn: () => adminApi.getChatRooms(filter === 'all' ? null : filter.toUpperCase()),
    refetchInterval: 3000, // 3초마다 갱신
  });

  // 선택된 채팅방의 메시지 조회
  const { data: messagesData } = useQuery({
    queryKey: ['adminChatMessages', selectedChatId],
    queryFn: () => adminApi.getChatMessages(selectedChatId),
    enabled: !!selectedChatId,
    refetchInterval: 2000, // 2초마다 갱신
  });

  const chatRooms = chatRoomsData?.data?.data || [];
  const currentMessages = messagesData?.data?.data || [];

  // 첫 번째 채팅방 자동 선택
  useEffect(() => {
    if (chatRooms.length > 0 && !selectedChatId) {
      setSelectedChatId(chatRooms[0].chatRoomId);
    }
  }, [chatRooms, selectedChatId]);

  const selectedChat = chatRooms.find(room => room.chatRoomId === selectedChatId);

  // 메시지 전송 (관리자)
  const sendMutation = useMutation({
    mutationFn: (messageText) => adminApi.sendChatMessage(selectedChatId, messageText),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['adminChatMessages', selectedChatId]);
      queryClient.invalidateQueries(['adminChatRooms']);
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChatId) {
      sendMutation.mutate(message);
    }
  };

  // 시간 포맷팅
  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays === 1) return '어제';
      if (diffDays < 7) return `${diffDays}일 전`;
      return date.toLocaleDateString('ko-KR');
    } catch (e) {
      return '';
    }
  };

  // 필터링된 채팅방 목록
  const filteredChatRooms = chatRooms.filter(room => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nickname = (room.userNickname || '').toLowerCase();
      const lastMessage = (room.lastMessage || '').toLowerCase();
      if (!nickname.includes(query) && !lastMessage.includes(query)) {
        return false;
      }
    }
    if (filter === 'unread') return (room.unreadCount || 0) > 0;
    if (filter === 'resolved') return room.status === 'CLOSED';
    if (filter === 'waiting') return room.status === 'OPEN';
    return true;
  });

  const unreadCount = chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-200px)] flex gap-4">
        {/* 좌측: 채팅 목록 사이드바 */}
        <div className="w-80 bg-white rounded-2xl shadow-sm flex flex-col">
          {/* 사이드바 헤더 */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div>
                <div className="font-bold text-slate-900">Festival Admin CS Center</div>
                <div className="text-xs text-slate-500">Summer 2024 • Live Support</div>
              </div>
            </div>

            {/* 검색창 */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search name, ID, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 placeholder:text-slate-400 text-sm"
              />
            </div>

            {/* 필터 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors relative ${
                  filter === 'unread' ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Unread {unreadCount > 0 && <span className="ml-1">({unreadCount})</span>}
              </button>
              <button
                onClick={() => setFilter('waiting')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === 'waiting' ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Waiting
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === 'resolved' ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* 채팅 목록 */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* WAITING FOR REPLY 섹션 */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">
                WAITING FOR REPLY
              </div>
              {filteredChatRooms
                .filter(room => room.status === 'OPEN')
                .map((room) => (
                  <div
                    key={room.chatRoomId}
                    onClick={() => setSelectedChatId(room.chatRoomId)}
                    className={`p-3 rounded-xl mb-2 cursor-pointer transition-colors ${
                      selectedChatId === room.chatRoomId
                        ? 'bg-teal-50 border border-teal-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedChatId === room.chatRoomId ? 'bg-teal-100' : 'bg-slate-200'
                      }`}>
                        <span className="text-sm font-semibold text-slate-700">
                          {(room.userNickname || 'U').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold text-sm ${
                            selectedChatId === room.chatRoomId ? 'text-teal-900' : 'text-slate-900'
                          }`}>
                            {room.userNickname || '고객'}
                          </span>
                          <span className={`text-xs ${
                            selectedChatId === room.chatRoomId ? 'text-teal-600' : 'text-slate-400'
                          }`}>
                            {formatTime(room.lastMessageTime)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${
                          selectedChatId === room.chatRoomId ? 'text-teal-700' : 'text-slate-500'
                        }`}>
                          {room.lastMessage || '메시지 없음'}
                        </p>
                      </div>
                      {(room.unreadCount || 0) > 0 && (
                        <div className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* RESOLVED 섹션 */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">
                RESOLVED
              </div>
              {filteredChatRooms
                .filter(room => room.status === 'CLOSED')
                .map((room) => (
                  <div
                    key={room.chatRoomId}
                    onClick={() => setSelectedChatId(room.chatRoomId)}
                    className={`p-3 rounded-xl mb-2 cursor-pointer transition-colors ${
                      selectedChatId === room.chatRoomId
                        ? 'bg-teal-50 border border-teal-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-400">
                          {(room.userNickname || 'U').charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-slate-900">
                            {room.userNickname || '고객'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(room.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs truncate text-slate-500">
                          {room.lastMessage || '메시지 없음'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* 우측: 메인 채팅 영역 */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col">
          {selectedChat ? (
            <>
              {/* 채팅 헤더 */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-lg font-semibold text-slate-700">
                        {(selectedChat.userNickname || 'U').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-slate-900">
                          {selectedChat.userNickname || '고객'}
                        </h2>
                        <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                          {selectedChat.status === 'OPEN' ? '대기 중' : '종료됨'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        마지막 활동: {formatTime(selectedChat.lastMessageTime)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Online</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">Admin Sarah</div>
                      <div className="text-xs text-slate-500">Support Lead</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-teal-700">A</span>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('정말 이 채팅방을 종료하시겠습니까?')) {
                          adminApi.closeChatRoom(selectedChatId).then(() => {
                            queryClient.invalidateQueries(['adminChatRooms']);
                            setSelectedChatId(null);
                          });
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      종료
                    </button>
                  </div>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {/* 날짜 구분선 */}
                <div className="flex justify-center my-6">
                  <div className="bg-slate-100 text-slate-600 text-xs font-medium px-4 py-1 rounded-full">
                    TODAY
                  </div>
                </div>

                {/* 메시지 목록 */}
                {currentMessages.map((msg) => {
                  if (msg.type === 'SYSTEM') {
                    return (
                      <div key={msg.messageId} className="flex justify-center">
                        <div className="bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          <span className="text-sm text-slate-600">{msg.message}</span>
                        </div>
                      </div>
                    );
                  }

                  const isAdmin = msg.senderRole === 'ADMIN';

                  return (
                    <div
                      key={msg.messageId}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} items-start gap-3`}
                    >
                      {/* 학생 프로필 */}
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-slate-600">
                            {(selectedChat?.userNickname || 'U').charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* 말풍선 */}
                      <div className={`max-w-[70%] ${isAdmin ? 'order-2' : ''}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isAdmin
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-br-sm'
                              : 'bg-white text-slate-900 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className={`text-xs mt-1 ${isAdmin ? 'text-right text-slate-500' : 'text-left text-slate-400'}`}>
                          {formatTime(msg.createdAt)} {isAdmin && msg.isRead && <span>• Read</span>}
                        </div>
                      </div>

                      {/* 관리자 프로필 */}
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-teal-700">A</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 빠른 액션 버튼 */}
              <div className="px-4 pt-2 pb-2 flex gap-2 border-t border-slate-200">
                <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Guide
                </button>
                <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Send Menu
                </button>
                <button className="px-3 py-2 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-xs text-red-600">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  Emergency
                </button>
                <button className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  FAQ Link
                </button>
              </div>

              {/* 입력창 */}
              <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply... (Shift + Enter for new line)"
                    rows={3}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder:text-slate-400 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || sendMutation.isPending}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white flex items-center justify-center hover:from-teal-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              채팅을 선택해주세요
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChatCenter;
