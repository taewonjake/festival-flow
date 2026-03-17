import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import useUserStore from '../../store/userStore';
import { qrApi } from '../../api/qrApi';
import { waitingApi } from '../../api/waitingApi';

const QRTicket = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [timeRemaining, setTimeRemaining] = useState(30);

  const { data: waitingData } = useQuery({
    queryKey: ['myWaiting'],
    queryFn: waitingApi.getMyWaiting,
    refetchInterval: 1000,
    retry: false,
  });

  const waiting = waitingData?.data?.data;
  const waitingId = waiting?.waitingId;

  const { data: qrData, refetch: refetchQr } = useQuery({
    queryKey: ['qrCode', waitingId],
    queryFn: () => qrApi.generateQrCode(waitingId),
    enabled: !!waitingId,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (waiting?.status === 'ARRIVED') {
      navigate('/student/status', { replace: true });
    }
  }, [waiting?.status, navigate]);

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
    }

    refetchQr();
  }, [timeRemaining, refetchQr]);

  if (!waitingId) {
    return (
      <div className="min-h-screen bg-slate-50 p-5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">활성 웨이팅이 없습니다</h2>
          <p className="text-slate-500">웨이팅을 먼저 신청해주세요.</p>
        </div>
      </div>
    );
  }

  const currentQrCode = qrData?.data?.data?.qrData;
  const progress = ((30 - timeRemaining) / 30) * 100;

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">보안 QR 입장권</h1>
        <p className="text-slate-500 text-sm">입장 시 스태프에게 QR 코드를 보여주세요.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-bold text-slate-900 text-lg">{user?.nickname || '학생'}</div>
            <div className="text-sm text-slate-500">ID: {user?.id || '-'}</div>
          </div>
          <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-semibold">LIVE PASS</div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-rose-200">
            <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center mx-auto">
              {currentQrCode ? (
                <QRCode
                  value={currentQrCode}
                  size={192}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  viewBox="0 0 256 256"
                />
              ) : (
                <div className="text-slate-400 text-sm">QR 코드 생성 중...</div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-semibold text-slate-900 mb-2">남은 시간</div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-slate-500">30초마다 코드가 자동 갱신됩니다</span>
            <span className="text-rose-500 font-bold">{timeRemaining}초</span>
          </div>
        </div>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-4 text-sm text-slate-600">
        보안을 위해 QR 코드는 실시간으로 변경됩니다.
      </div>

      <button
        onClick={() => refetchQr()}
        className="w-full bg-white border border-slate-200 rounded-2xl py-3 text-slate-900 hover:bg-slate-50 transition-colors"
      >
        수동 새로고침
      </button>
    </div>
  );
};

export default QRTicket;
