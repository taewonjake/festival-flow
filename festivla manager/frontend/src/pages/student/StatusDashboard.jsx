import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { waitingApi } from '../../api/waitingApi';
import { chatApi } from '../../api/chatApi';
import Button from '../../components/common/Button';
import useUserStore from '../../store/userStore';
import { useSocket } from '../../hooks/useSocket';

const WS_BASE_URL = (
  import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws'
).replace(/\/+$/, '');

const StatusDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [countdown, setCountdown] = useState({ minutes: 5, seconds: 0 });
  const [localRank, setLocalRank] = useState(null);
  const [localEstimatedMinutes, setLocalEstimatedMinutes] = useState(null);

  const { data: waitingData, isLoading } = useQuery({
    queryKey: ['myWaiting'],
    queryFn: () => waitingApi.getMyWaiting(),
    enabled: !!user?.id,
    refetchInterval: 1000,
    retry: false,
    onError: (error) => {
      if (error.response?.status === 400) {
        navigate('/student/main');
      }
    },
  });

  const { isConnected } = useSocket(`${WS_BASE_URL}/waiting`, {
    userId: user?.id,
    onMessage: (message) => {
      if (message.type === 'CALLED') {
        queryClient.invalidateQueries(['myWaiting']);
      } else if (message.type === 'RANK_UPDATE' || message.type === 'WAITING_UPDATE') {
        if (message.data) {
          setLocalRank(message.data.rank);
          setLocalEstimatedMinutes(message.data.estimatedMinutes);
        }
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => waitingApi.cancelWaiting(waitingData?.data?.data?.waitingId),
    onSuccess: () => {
      navigate('/student/main');
    },
  });

  const sendOnMyWayMutation = useMutation({
    mutationFn: async () => {
      const roomResponse = await chatApi.createChatRoom();
      const chatRoomId = roomResponse.data.data.chatRoomId;
      await chatApi.sendMessage(chatRoomId, '지금 매장으로 출발했습니다!');
    },
    onSuccess: () => {
      alert('관리자에게 출발 알림을 보냈습니다.');
    },
    onError: () => {
      alert('알림 전송에 실패했습니다.');
    },
  });

  const handleChatOpen = async () => {
    try {
      const roomsResponse = await chatApi.getMyChatRooms();
      const rooms = roomsResponse.data.data;

      if (rooms && rooms.length > 0) {
        navigate(`/student/chat/${rooms[0].chatRoomId}`);
      } else {
        const createResponse = await chatApi.createChatRoom();
        navigate(`/student/chat/${createResponse.data.data.chatRoomId}`);
      }
    } catch (error) {
      console.error('채팅방 접속 실패:', error);
      alert('채팅방 접속 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (waitingData?.data?.data?.status === 'CALLED' && waitingData?.data?.data?.callTime) {
      const callTime = new Date(waitingData.data.data.callTime);
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.max(0, 300000 - (now - callTime));

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setCountdown({ minutes, seconds });

        if (diff === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [waitingData?.data?.data?.status, waitingData?.data?.data?.callTime]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">로딩 중...</div>
      </div>
    );
  }

  const waiting = waitingData?.data?.data;
  const status = waiting?.status;
  const rank = localRank !== null ? localRank : (waiting?.rank || 0);
  const estimatedMinutes = localEstimatedMinutes !== null ? localEstimatedMinutes : (waiting?.estimatedMinutes || 15);
  const progress = estimatedMinutes ? Math.min(100, ((15 - estimatedMinutes) / 15) * 100) : 0;

  if (status === 'ARRIVED') {
    return (
      <div className="min-h-screen bg-slate-50 p-5">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center mt-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">입장을 완료했습니다</h1>
          <p className="text-slate-500 mb-8">즐거운 시간 보내세요!</p>
          <Button onClick={() => navigate('/student/main')} variant="primary" size="lg" className="w-full">
            메인으로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'CALLED') {
    return (
      <div className="min-h-screen bg-slate-50 p-5">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">실시간 웨이팅 현황</h1>
          <p className="text-sm text-slate-500 mt-1">현재 부스 상황을 실시간으로 확인하고 있습니다.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 text-center relative overflow-hidden">
          <div className="absolute top-6 right-6 w-3 h-3 bg-rose-500 rounded-full"></div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
            <span className="text-rose-500 font-semibold text-sm">입장 가능 (ENTER NOW)</span>
          </div>

          <h2 className="text-4xl font-bold text-slate-900 mb-4">지금 입장해주세요!</h2>
          <p className="text-slate-500 text-sm mb-8">입장 마감까지 남은 시간</p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <div className="bg-slate-100 rounded-2xl px-6 py-4 min-w-[80px]">
                <div className="text-4xl font-bold text-slate-900">{String(countdown.minutes).padStart(2, '0')}</div>
              </div>
              <span className="text-xs text-slate-500 mt-2">MINUTES</span>
            </div>

            <div className="text-3xl font-bold text-slate-900 pb-8">:</div>

            <div className="flex flex-col items-center">
              <div className="bg-slate-100 rounded-2xl px-6 py-4 min-w-[80px] border-2 border-rose-500 relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full"></div>
                <div className="text-4xl font-bold text-slate-900">{String(countdown.seconds).padStart(2, '0')}</div>
              </div>
              <span className="text-xs text-slate-500 mt-2">SECONDS</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/student/qr')}
            variant="primary"
            size="lg"
            className="w-full flex items-center justify-center gap-2 py-4 text-base font-semibold bg-gradient-to-b from-rose-400 to-rose-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR 입장권 보기
          </Button>

          <div className="mt-6">
            <button onClick={handleChatOpen} className="text-sm text-slate-500 hover:text-slate-700">
              문제가 있나요? (Need Help?)
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">* 입장 시간이 지나면 대기열 맨 뒤로 이동될 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">실시간 웨이팅 현황</h1>
        <p className="text-sm text-slate-500 mt-1">현재 부스 상황을 실시간으로 확인하고 있습니다.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">주점 웨이팅 현황</h2>
          <div className="bg-rose-500 text-white text-xs px-3 py-1 rounded-full font-medium">LIVE</div>
        </div>

        <div className="text-center mb-8 py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-sm text-slate-900">내 앞 대기팀</div>
            {isConnected && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="실시간 연결됨"></div>}
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-7xl font-bold text-rose-500">{rank}</span>
            <span className="text-2xl">팀</span>
          </div>
          <div className="text-lg text-slate-900 mt-2">팀 앞에 대기 중입니다</div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-sm font-medium text-slate-900">입장 임박!</span>
          </div>

          <div className="relative mb-2">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-right text-xs text-slate-500 mt-1">{Math.round(progress)}% 진행</div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">현재 대기 예측</span>
            <div className="flex items-center gap-1 text-slate-900">
              <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>약 {estimatedMinutes}분</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-200 my-6"></div>

        <div className="flex gap-3">
          <Button onClick={() => cancelMutation.mutate()} variant="secondary" className="flex-1" disabled={cancelMutation.isPending}>
            대기 취소
          </Button>
          <Button
            onClick={() => sendOnMyWayMutation.mutate()}
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
            disabled={sendOnMyWayMutation.isPending}
          >
            {sendOnMyWayMutation.isPending ? '전송 중...' : '지금 갈게요'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">호출 후 5분 이내 미입장 시 대기가 취소될 수 있습니다.</p>
      </div>

      <button
        onClick={handleChatOpen}
        className="fixed bottom-6 right-6 w-14 h-14 bg-rose-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-rose-600 transition-colors z-50 animate-bounce-slow"
        aria-label="채팅 문의"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
};

export default StatusDashboard;
