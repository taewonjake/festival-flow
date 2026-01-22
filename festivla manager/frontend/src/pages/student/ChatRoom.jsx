import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { chatApi } from '../../api/chatApi';
import useUserStore from '../../store/userStore';

const ChatRoom = () => {
  const { chatRoomId } = useParams();
  const { user } = useUserStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // 메시지 조회
  const { data: messagesData } = useQuery({
    queryKey: ['chatMessages', chatRoomId],
    queryFn: () => chatApi.getMessages(chatRoomId),
    enabled: !!chatRoomId,
    refetchInterval: 2000, // 2초마다 갱신
  });

  // 메시지 전송
  const sendMutation = useMutation({
    mutationFn: (message) => chatApi.sendMessage(chatRoomId, message),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['chatMessages', chatRoomId]);
    },
  });

  const messages = messagesData?.data?.data || [];

  // 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (senderRole) => {
    return senderRole === 'STUDENT';
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()}>
            <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Festival Support Team</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <span>⚡</span>
              <span>Typically replies in minutes</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 날짜 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="text-xs text-slate-500">Today, October 24</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {/* 시스템 메시지 */}
        <div className="flex justify-center">
          <div className="bg-rose-500 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Chat session started 14:00 PM</span>
          </div>
        </div>

        {/* 메시지 목록 */}
        {messages.map((msg, index) => {
          const isMine = isMyMessage(msg.senderRole);
          const isSystem = msg.type === 'SYSTEM';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="text-xs text-slate-500">
                  {msg.message}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isMine ? 'items-end' : 'items-start'} gap-2`}
            >
              {/* 상담원 아바타 */}
              {!isMine && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-slate-600 font-semibold">A</span>
                </div>
              )}

              {/* 말풍선 */}
              <div className={`max-w-[70%] ${isMine ? 'order-2' : ''}`}>
                <div
                  className={`rounded-3xl px-4 py-3 relative ${
                    isMine
                      ? 'bg-rose-500 text-white rounded-br-sm chat-bubble-tail-right'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm chat-bubble-tail-left'
                  } shadow-sm`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className={`text-xs text-slate-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        {/* 위치 카드 예시 (상담원 메시지) */}
        <div className="flex justify-start items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-slate-600 font-semibold">A</span>
          </div>
          <div className="max-w-[70%] bg-white border border-slate-200 rounded-2xl rounded-bl-sm overflow-hidden shadow-sm">
            <div className="bg-slate-100 h-32 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-slate-500">30 📍 00</span>
              </div>
            </div>
            <div className="p-3">
              <div className="font-semibold text-slate-900 mb-1">Main Stage Info Booth</div>
              <div className="text-xs text-slate-500">Tap to view map</div>
            </div>
          </div>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* 빠른 답변 칩 */}
      <div className="px-4 pt-2 pb-2 flex gap-2 overflow-x-auto">
        <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 transition-colors">
          Is it free?
        </button>
        <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 transition-colors">
          Report Lost Item
        </button>
        <button className="px-4 py-2 bg-slate-100 text-slate-900 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 transition-colors">
          Map Location
        </button>
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSend} className="bg-white border-t border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-3 bg-slate-50 rounded-3xl border-0 focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={!message.trim() || sendMutation.isPending}
            className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
