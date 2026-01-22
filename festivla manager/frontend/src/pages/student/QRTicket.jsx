import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import useUserStore from '../../store/userStore';
import { qrApi } from '../../api/qrApi';
import { waitingApi } from '../../api/waitingApi';

const QRTicket = () => {
  const { user } = useUserStore();
  const [timeRemaining, setTimeRemaining] = useState(30);
  
  // 내 웨이팅 정보 조회
  const { data: waitingData } = useQuery({
    queryKey: ['myWaiting'],
    queryFn: waitingApi.getMyWaiting,
    retry: false,
  });

  const waitingId = waitingData?.data?.data?.waitingId;

  // QR 코드 데이터 조회
  const { data: qrData, refetch: refetchQr } = useQuery({
    queryKey: ['qrCode', waitingId],
    queryFn: () => qrApi.generateQrCode(waitingId),
    enabled: !!waitingId,
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  // 타이머 로직
  useEffect(() => {
    if (qrData?.data?.data?.timeRemaining) {
      setTimeRemaining(qrData.data.data.timeRemaining);
    }
  }, [qrData]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // 시간이 다 되면 QR 코드 갱신
      refetchQr();
    }
  }, [timeRemaining, refetchQr]);

  const currentQrCode = qrData?.data?.data?.qrData;
  const progress = ((30 - timeRemaining) / 30) * 100;

  if (!waitingId) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">활성화된 웨이팅이 없습니다</h2>
          <p className="text-slate-500">웨이팅을 먼저 신청해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-bold text-slate-900">Festival Pass</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-900">Home</span>
          <span className="text-sm text-slate-900">Lineup</span>
          <span className="text-sm text-rose-500 font-semibold">MyTicket</span>
          <span className="text-sm text-slate-900">Map</span>
        </div>
      </div>

      {/* 라이브 배지 및 제목 */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-rose-100 px-3 py-1 rounded-full mb-3">
          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
          <span className="text-xs font-semibold text-rose-500">LIVE SECURE PASS</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">보안 QR 입장권</h1>
        <p className="text-slate-500 text-sm">
          입장 시 스태프에게 아래 QR 코드를 보여주세요. 캡처된 화면은 사용할 수 없습니다.
        </p>
      </div>

      {/* 메인 티켓 카드 */}
      <div className="bg-white rounded-3xl shadow-lg p-6 mb-4 relative overflow-hidden">
        {/* 상단 핑크 그라데이션 라인 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300 via-rose-500 to-rose-300"></div>

        {/* 사용자 정보 */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center overflow-hidden border-2 border-rose-100">
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-rose-400 opacity-60"></div>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-lg">{user?.nickname || '학생'}</div>
              <div className="text-sm text-slate-500">{user?.department || '학과 정보 없음'}</div>
              <div className="text-xs text-slate-500">ID: {user?.id || '학번 없음'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">PASS TYPE</div>
            <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-semibold">VIP</div>
          </div>
        </div>

        {/* 이벤트 정보 */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-2">EVENT</div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">2024 대동제 : EUPHORIA</span>
            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* 구분선 */}
        <div className="relative my-6">
          <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-slate-200"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border-2 border-slate-200"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full border-2 border-slate-200"></div>
        </div>

        {/* QR 코드 영역 - 네온 효과 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* 네온 효과 (Glow) - 외부 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-500 rounded-2xl blur-2xl opacity-70 animate-pulse"></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-xl border-2 border-rose-200 qr-glow">
              <div className="text-xs text-slate-400 text-center mb-3">Dynamic Entry</div>
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center relative mx-auto overflow-hidden">
                {currentQrCode ? (
                  <QRCode
                    value={currentQrCode}
                    size={192}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <div className="text-slate-400 text-sm">QR 코드 생성 중...</div>
                )}
                
                {/* 작은 아이콘 오버레이 (QR 코드가 있을 때만) */}
                {currentQrCode && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 타이머 및 진행 바 */}
        <div className="mb-6">
          <div className="text-sm font-semibold text-slate-900 mb-2">남은 시간</div>
          <div className="relative mb-2">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>30초마다 코드가 자동 갱신됩니다</span>
            </div>
            <div className="text-rose-500 font-bold text-lg">{timeRemaining}초</div>
          </div>
        </div>

        {/* 티켓 코드 (보안상 일부 마스킹 처리 가능) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-900 font-mono">
              CODE: {currentQrCode ? currentQrCode.split(':')[1]?.substring(0, 8) || 'SECURE-CODE' : '...'}
            </span>
          </div>
          <button 
            onClick={() => refetchQr()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="새로고침"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 경고 메시지 */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-bold text-slate-900 mb-1">스크린샷 사용 불가</div>
            <p className="text-sm text-slate-500">
              보안을 위해 QR 코드가 실시간으로 변경됩니다. 캡처된 이미지는 입장 시 입장이 거부될 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 수동 새로고침 버튼 */}
      <button
        onClick={() => refetchQr()}
        className="w-full bg-white border border-slate-200 rounded-2xl py-3 flex items-center justify-center gap-2 text-slate-900 hover:bg-slate-50 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="font-medium">수동으로 새로고침</span>
      </button>
    </div>
  );
};

export default QRTicket;
