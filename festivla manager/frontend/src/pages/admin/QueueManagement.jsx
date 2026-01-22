import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/adminApi';

const QueueManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [sortBy, setSortBy] = useState('waitingNumber'); // 'waitingNumber' | 'createdAt' | 'headCount'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const queryClient = useQueryClient();

  // 웨이팅 목록 조회
  const { data: waitingsData } = useQuery({
    queryKey: ['waitings', statusFilter],
    queryFn: () => adminApi.getAllWaitings(statusFilter),
    refetchInterval: 3000, // 3초마다 갱신
  });

  // 웨이팅 호출
  const callMutation = useMutation({
    mutationFn: (waitingId) => adminApi.callWaiting(waitingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['waitings']);
      queryClient.invalidateQueries(['dashboardStats']);
    },
  });

  // 입장 확인
  const confirmMutation = useMutation({
    mutationFn: (waitingId) => adminApi.confirmEntry(waitingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['waitings']);
      queryClient.invalidateQueries(['dashboardStats']);
    },
  });

  // 웨이팅 취소 (관리자)
  const cancelMutation = useMutation({
    mutationFn: (waitingId) => adminApi.cancelWaiting(waitingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['waitings']);
      queryClient.invalidateQueries(['dashboardStats']);
    },
  });

  const allWaitings = waitingsData?.data?.data || [];

  // 기본적으로 ARRIVED, CANCELED 제외하고 보여주기 (필터가 선택되지 않았을 때)
  const activeWaitings = statusFilter 
    ? allWaitings 
    : allWaitings.filter(w => w.status === 'WAITING' || w.status === 'CALLED');

  // 검색 필터링
  const filteredWaitings = searchQuery
    ? activeWaitings.filter(w => {
        const query = searchQuery.toLowerCase();
        const name = (w.userNickname || w.userName || '').toLowerCase();
        const phone = (w.userPhoneNumber || '').replace(/-/g, '');
        return name.includes(query) || phone.includes(query);
      })
    : activeWaitings;

  // 정렬
  const sortedWaitings = [...filteredWaitings].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'waitingNumber') {
      comparison = a.waitingNumber - b.waitingNumber;
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'headCount') {
      comparison = a.headCount - b.headCount;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // 표시할 웨이팅 (페이징)
  const displayWaitings = sortedWaitings.slice(0, displayLimit);
  const hasMore = sortedWaitings.length > displayLimit;

  // 통계 계산
  const stats = {
    waiting: allWaitings.filter(w => w.status === 'WAITING').length,
    called: allWaitings.filter(w => w.status === 'CALLED').length,
    completed: allWaitings.filter(w => w.status === 'ARRIVED').length,
  };

  // 경과 시간 계산
  const getElapsedTime = (startTime) => {
    if (!startTime) return '0m 0s';
    try {
      const diff = Math.floor((new Date() - new Date(startTime)) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      return `${minutes}m ${seconds}s`;
    } catch (e) {
      return '0m 0s';
    }
  };

  // 남은 시간 계산 (5분 카운트다운)
  const getRemainingTime = (callTime) => {
    if (!callTime) return null;
    try {
      const fiveMinutes = 5 * 60 * 1000;
      const diff = Math.max(0, fiveMinutes - (new Date() - new Date(callTime)));
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    try {
      return new Date(dateTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  // 모달 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowFilterModal(false);
        setShowSortModal(false);
      }
    };
    if (showFilterModal || showSortModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFilterModal, showSortModal]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 제목 및 상태 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
              LIVE MONITORING
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            실시간 대기열 관리 명단
          </h1>
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">
              현재 대기 인원 {stats.waiting}팀 (Updated 1 min ago)
            </span>
          </div>
        </div>

        {/* 상단 통계 바 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 현재 대기 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl font-bold text-slate-900">{stats.waiting}</div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-600 mb-1">현재 대기</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>실시간 업데이트</span>
            </div>
          </div>

          {/* 호출 중 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl font-bold text-slate-900">{stats.called}</div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-600 mb-1">호출 중</div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          {/* 입장 완료 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl font-bold text-slate-900">{stats.completed}</div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-sm text-slate-600 mb-1">입장 완료</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>오늘 입장 완료</span>
            </div>
          </div>
        </div>

        {/* 검색 바 및 필터 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="이름 또는 전화번호로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className={`px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                statusFilter ? 'border-teal-500 bg-teal-50' : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter {statusFilter && `(${statusFilter})`}
            </button>
            {showFilterModal && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                <button
                  onClick={() => {
                    setStatusFilter(null);
                    setShowFilterModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    !statusFilter ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('WAITING');
                    setShowFilterModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    statusFilter === 'WAITING' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  대기 중
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('CALLED');
                    setShowFilterModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    statusFilter === 'CALLED' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  호출 중
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('ARRIVED');
                    setShowFilterModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    statusFilter === 'ARRIVED' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  입장 완료
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortModal(!showSortModal)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
            </button>
            {showSortModal && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 border-b">정렬 기준</div>
                <button
                  onClick={() => {
                    setSortBy('waitingNumber');
                    setShowSortModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    sortBy === 'waitingNumber' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  대기 번호
                </button>
                <button
                  onClick={() => {
                    setSortBy('createdAt');
                    setShowSortModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    sortBy === 'createdAt' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  등록 시간
                </button>
                <button
                  onClick={() => {
                    setSortBy('headCount');
                    setShowSortModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    sortBy === 'headCount' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  인원 수
                </button>
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 border-t border-b">정렬 순서</div>
                <button
                  onClick={() => {
                    setSortOrder('asc');
                    setShowSortModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    sortOrder === 'asc' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  오름차순
                </button>
                <button
                  onClick={() => {
                    setSortOrder('desc');
                    setShowSortModal(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    sortOrder === 'desc' ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                  }`}
                >
                  내림차순
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 gap-4 text-xs text-slate-500 font-medium pb-2 border-b border-slate-200">
          <div className="col-span-1">NO.</div>
          <div className="col-span-4">STUDENT INFO</div>
          <div className="col-span-2">HEADCOUNT</div>
          <div className="col-span-3">WAIT TIME</div>
          <div className="col-span-2">ACTIONS</div>
        </div>

        {/* 대기열 리스트 (카드 형태) */}
        <div className="space-y-4">
          {displayWaitings.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-semibold mb-2">웨이팅이 없습니다</p>
              <p className="text-sm">대기 중인 웨이팅이 없습니다.</p>
            </div>
          ) : (
            displayWaitings.map((waiting) => {
              const isCalled = waiting.status === 'CALLED';
              const remainingTime = isCalled ? getRemainingTime(waiting.callTime) : null;

            return (
              <div
                key={waiting.waitingId}
                className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${
                  isCalled ? 'border-l-4 border-t-2 border-yellow-500 border-r-2 border-b-2' : ''
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* 대기번호 */}
                  <div className="col-span-1">
                    <span className="text-2xl font-bold text-blue-500">
                      #{String(waiting.waitingNumber || 0).padStart(2, '0')}
                    </span>
                  </div>

                  {/* 학생 정보 */}
                  <div className="col-span-4">
                    <div className="font-semibold text-slate-900 text-lg">
                      {waiting.userNickname || waiting.userName || '고객'}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {waiting.userPhoneNumber || '전화번호 없음'}
                    </div>
                  </div>

                  {/* 인원 수 */}
                  <div className="col-span-2">
                    <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm text-slate-900">
                        {waiting.headCount} {waiting.headCount === 1 ? 'Person' : 'People'}
                      </span>
                    </div>
                  </div>

                  {/* 대기 시간 */}
                  <div className="col-span-3">
                    {isCalled ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-yellow-500 text-lg">{remainingTime} left</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Called at {formatTime(waiting.callTime)} PM
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold text-orange-500">{getElapsedTime(waiting.createdAt)}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Since {formatTime(waiting.createdAt)} PM
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="col-span-2 flex items-center gap-2 justify-end">
                    {!isCalled && (
                      <button
                        onClick={() => callMutation.mutate(waiting.waitingId)}
                        disabled={callMutation.isPending}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Call Now
                      </button>
                    )}
                    {isCalled && (
                      <button
                        onClick={() => confirmMutation.mutate(waiting.waitingId)}
                        disabled={confirmMutation.isPending}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Confirm Arrival
                      </button>
                    )}
                    {(waiting.status === 'WAITING' || waiting.status === 'CALLED') && (
                      <button
                        onClick={() => {
                          if (window.confirm('정말 이 웨이팅을 취소하시겠습니까?')) {
                            cancelMutation.mutate(waiting.waitingId);
                          }
                        }}
                        disabled={cancelMutation.isPending}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="취소"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 더 보기 */}
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={() => setDisplayLimit(displayLimit + 10)}
              className="text-slate-500 text-sm hover:text-slate-700 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {sortedWaitings.length - displayLimit}개 더 보기
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default QueueManagement;
