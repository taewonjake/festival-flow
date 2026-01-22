import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import QrScannerLib from 'react-qr-scanner';

const QrScanner = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [tableFilter, setTableFilter] = useState('available'); // 'available' or 'inUse'
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  // 테이블 목록 조회
  const { data: tablesData, refetch: refetchTables } = useQuery({
    queryKey: ['tables'],
    queryFn: adminApi.getTables,
  });

  const tables = tablesData?.data?.data || [];

  const filteredTables = tables.filter(table => {
    if (tableFilter === 'available') return table.status === 'EMPTY';
    if (tableFilter === 'inUse') return table.status === 'OCCUPIED';
    return true;
  });

  // QR 검증
  const verifyMutation = useMutation({
    mutationFn: (qrData) => adminApi.verifyQrCode(qrData),
    onSuccess: (response) => {
      const data = response.data.data;
      if (data.isValid) {
        setScannedData({
          ticketId: data.waitingId,
          user: { nickname: data.userNickname, studentId: data.userId },
          headCount: data.headCount,
          type: 'VIP Access', // 실제로는 서버에서 받아와야 함
        });
        setIsModalOpen(true);
        setIsScanning(false);
      } else {
        alert(data.message || '유효하지 않은 QR 코드입니다.');
        // 스캔 재개 (잠시 딜레이 후)
        setTimeout(() => setIsScanning(true), 2000);
      }
    },
    onError: () => {
      alert('QR 코드 검증 중 오류가 발생했습니다.');
      setTimeout(() => setIsScanning(true), 2000);
    }
  });

  // 좌석 배정
  const assignMutation = useMutation({
    mutationFn: ({ waitingId, tableId }) => adminApi.assignTable(waitingId, tableId),
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedTableId(null);
      setScannedData(null);
      setIsScanning(true); // 스캔 다시 시작
      refetchTables(); // 테이블 목록 갱신
      alert('테이블 배정이 완료되었습니다.');
    },
    onError: () => {
      alert('테이블 배정에 실패했습니다.');
    }
  });

  const handleScan = (data) => {
    if (data && isScanning) {
      setIsScanning(false); // 중복 스캔 방지
      // data가 객체일 수도 있고 문자열일 수도 있음 (라이브러리 버전에 따라 다름)
      const qrText = data.text || data;
      verifyMutation.mutate(qrText);
    }
  };

  const handleError = (err) => {
    console.error(err);
    // 에러 발생 시에도 계속 스캔 시도
  };

  const handleConfirmAssignment = () => {
    if (selectedTableId && scannedData) {
      assignMutation.mutate({
        waitingId: scannedData.ticketId,
        tableId: selectedTableId,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTableId(null);
    setScannedData(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-white hover:text-slate-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">QR 스캔 및 좌석 배정</h1>
              <p className="text-xs text-slate-300">입장 관리자 모드</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-white">{isScanning ? 'Camera Active' : 'Processing...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 스캔 대기 화면 */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {/* 카메라 뷰 */}
        <div className="absolute inset-0 flex items-center justify-center">
            {isScanning && (
                <QrScannerLib
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    constraints={{
                        video: { facingMode: 'environment' } // 후면 카메라 사용
                    }}
                />
            )}
        </div>

        {/* 카메라 뷰파인더 (오버레이) */}
        <div className="relative pointer-events-none">
          {/* 외부 프레임 */}
          <div className="w-80 h-80 border-2 border-white/50 rounded-lg relative">
            {/* 스캔 애니메이션 - 위아래 레이저 선 */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute left-0 right-0 h-0.5 bg-green-500 shadow-lg shadow-green-500/50 animate-scan-line"></div>
            </div>

            {/* 모서리 가이드 */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
          </div>

          {/* 안내 텍스트 */}
          <div className="mt-8 text-center bg-black/50 p-2 rounded-lg backdrop-blur-sm">
            <p className="text-white text-lg mb-2">QR 코드를 뷰파인더 안에 위치시켜주세요</p>
            <p className="text-slate-400 text-sm">자동으로 인식됩니다</p>
          </div>
        </div>
      </div>

      {/* 좌석 배정 모달 */}
      {isModalOpen && scannedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* 모달 상단 - 유효한 입장권 */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-3xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">유효한 입장권입니다</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Waiting #{scannedData.ticketId}
                    </span>
                    <span className="text-white/90 text-sm">
                      {scannedData.type} • {scannedData.headCount} Persons
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
                <div className="font-semibold">{scannedData.user.nickname}</div>
                <div className="text-white/80">ID: {scannedData.user.studentId}</div>
              </div>
            </div>

            {/* 모달 본문 - 테이블 선택 */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">배정할 테이블 선택</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tableFilter"
                      checked={tableFilter === 'available'}
                      onChange={() => setTableFilter('available')}
                      className="w-4 h-4 text-rose-500"
                    />
                    <span className="text-sm text-slate-700">가능</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tableFilter"
                      checked={tableFilter === 'inUse'}
                      onChange={() => setTableFilter('inUse')}
                      className="w-4 h-4 text-rose-500"
                    />
                    <span className="text-sm text-slate-700">사용중</span>
                  </label>
                </div>
              </div>

              {/* 테이블 그리드 */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {filteredTables.map((table) => {
                  const isOccupied = table.status === 'OCCUPIED';
                  const isSelected = selectedTableId === table.tableId;

                  return (
                    <button
                      key={table.tableId}
                      onClick={() => !isOccupied && setSelectedTableId(prev => (prev === table.tableId ? null : table.tableId))}
                      disabled={isOccupied}
                      className={`
                        relative p-4 rounded-xl transition-all w-full
                        ${isOccupied
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 line-through'
                          : isSelected
                          ? 'bg-rose-50 border-2 border-rose-500 text-slate-900 ring-2 ring-rose-500 ring-offset-2'
                          : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1">T-{table.tableNumber}</div>
                        <div className="text-xs">
                          {table.capacity}인석
                        </div>
                        {isOccupied && (
                          <div className="text-xs mt-1">사용중</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 모달 하단 - 액션 버튼 */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAssignment}
                disabled={!selectedTableId || assignMutation.isPending}
                className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                배정 확인
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스캔 라인 애니메이션 CSS */}
      <style>{`
        @keyframes scan-line {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default QrScanner;
