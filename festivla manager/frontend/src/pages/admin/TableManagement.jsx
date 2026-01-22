import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/common/Modal';
import { adminApi } from '../../api/adminApi';

const TableManagement = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // 테이블 목록 조회
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => adminApi.getTables(),
    refetchInterval: 5000, // 5초마다 갱신
  });

  // 테이블 상태 변경
  const updateStatusMutation = useMutation({
    mutationFn: ({ tableId, status }) => adminApi.updateTableStatus(tableId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      setIsModalOpen(false);
      setSelectedTable(null);
    },
  });

  const tables = tablesData?.data?.data || [];

  // 테이블 할당 Mutation
  const assignTableMutation = useMutation({
    mutationFn: ({ waitingId, tableId }) => adminApi.assignTable(waitingId, tableId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      queryClient.invalidateQueries(['waitings']);
      queryClient.invalidateQueries(['dashboardStats']);
      setIsModalOpen(false);
      setSelectedTable(null);
      alert('테이블이 할당되었습니다.');
    },
    onError: (error) => {
      alert(error.response?.data?.message || '테이블 할당에 실패했습니다.');
    },
  });

  // 필터링
  const filterCounts = {
    all: tables.length,
    empty: tables.filter(t => t.status === 'EMPTY').length,
    occupied: tables.filter(t => t.status === 'OCCUPIED').length,
    cleaning: tables.filter(t => t.status === 'CLEANING').length,
  };

  const filteredTables = selectedFilter === 'all'
    ? tables
    : tables.filter(table => {
        if (selectedFilter === 'empty') return table.status === 'EMPTY';
        if (selectedFilter === 'occupied') return table.status === 'OCCUPIED';
        if (selectedFilter === 'cleaning') return table.status === 'CLEANING';
        return true;
      });

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  // 웨이팅 목록 조회 (테이블 할당용 및 OCCUPIED 상태 표시용)
  const { data: waitingsForAssign } = useQuery({
    queryKey: ['waitingsForAssign'],
    queryFn: () => adminApi.getAllWaitings(null), // 전체 조회
  });

  const availableWaitings = waitingsForAssign?.data?.data || [];
  const allWaitings = availableWaitings; // OCCUPIED 상태 표시용

  const handleStatusChange = (newStatus) => {
    if (selectedTable) {
      updateStatusMutation.mutate({
        tableId: selectedTable.tableId,
        status: newStatus,
      });
    }
  };

  const getTableCardStyle = (status) => {
    const baseStyle = 'bg-white rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg';
    const borderStyles = {
      EMPTY: 'border-2 border-dashed border-slate-300',
      OCCUPIED: 'border-l-4 border-t-2 border-green-500 border-r-2 border-b-2 border-green-500',
      CLEANING: 'border-l-4 border-t-2 border-yellow-500 border-r-2 border-b-2 border-yellow-500',
    };
    return `${baseStyle} ${borderStyles[status] || baseStyle}`;
  };

  const handleAssignClick = (e, table) => {
    e.stopPropagation(); // 테이블 클릭 이벤트 방지
    if (availableWaitings.length === 0) {
      alert('할당 가능한 웨이팅이 없습니다. 먼저 웨이팅을 호출해주세요.');
      return;
    }
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleAssignWaiting = (waitingId) => {
    if (selectedTable) {
      assignTableMutation.mutate({
        waitingId,
        tableId: selectedTable.tableId,
      });
    }
  };

  const renderTableCard = (table) => {
    // 현재 웨이팅 정보 조회 (OCCUPIED 상태일 때)
    const currentWaiting = table.currentWaitingId 
      ? allWaitings.find(w => w.waitingId === table.currentWaitingId)
      : null;

    return (
      <div
        key={table.tableId}
        onClick={() => handleTableClick(table)}
        className={getTableCardStyle(table.status)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-900">T-{String(table.tableNumber).padStart(2, '0')}</span>
        </div>

        {table.status === 'EMPTY' && (
          <div className="flex flex-col items-center justify-center py-4">
            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="text-xs text-slate-500 mb-3">{table.capacity}인석</div>
            <button
              onClick={(e) => handleAssignClick(e, table)}
              className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <div className="text-center">
                <svg className="w-6 h-6 text-slate-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-slate-500 font-medium">Assign</span>
              </div>
            </button>
          </div>
        )}

        {table.status === 'OCCUPIED' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold text-slate-900">
                {currentWaiting ? currentWaiting.headCount : '?'}명
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-1">사용 중</div>
            {currentWaiting && (
              <div className="text-xs text-slate-400">
                {currentWaiting.userNickname || currentWaiting.userName || '고객'}
              </div>
            )}
          </div>
        )}

        {table.status === 'CLEANING' && (
          <div className="flex flex-col items-center justify-center py-4">
            <svg className="w-8 h-8 text-yellow-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="text-xs text-slate-500 mb-1">Status</div>
            <div className="text-lg font-bold text-yellow-500">Cleaning...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 제목 및 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">실시간 테이블 현황</h1>
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              LIVE
            </span>
          </div>
        </div>
        <div className="text-slate-500">
          현재 시간: {getCurrentTime()} | 총 테이블: {filterCounts.all}
        </div>

        {/* 필터 및 새로고침 */}
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('empty')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === 'empty'
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                빈자리 {filterCounts.empty}
              </span>
            </button>
            <button
              onClick={() => setSelectedFilter('occupied')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === 'occupied'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                사용중 {filterCounts.occupied}
              </span>
            </button>
            <button
              onClick={() => setSelectedFilter('cleaning')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === 'cleaning'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-yellow-50 text-yellow-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                정리중 {filterCounts.cleaning}
              </span>
            </button>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              전체
            </button>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries(['tables'])}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* 테이블 그리드 */}
        {filteredTables.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-lg font-semibold mb-2">테이블이 없습니다</p>
            <p className="text-sm">필터 조건에 맞는 테이블이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTables.map(renderTableCard)}
          </div>
        )}
      </div>

      {/* 상태 변경/할당 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTable(null);
        }}
        title={selectedTable?.status === 'EMPTY' && availableWaitings.length > 0
          ? `테이블 T-${selectedTable ? String(selectedTable.tableNumber).padStart(2, '0') : ''} 할당`
          : `테이블 T-${selectedTable ? String(selectedTable.tableNumber).padStart(2, '0') : ''} 상태 변경`}
      >
        {selectedTable && (
          <div className="space-y-4">
            {selectedTable.status === 'EMPTY' && availableWaitings.length > 0 ? (
              // 테이블 할당 모드
              <div>
                <div className="text-sm text-slate-600 mb-4">
                  할당할 웨이팅을 선택하세요
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableWaitings.map((waiting) => (
                    <button
                      key={waiting.waitingId}
                      onClick={() => handleAssignWaiting(waiting.waitingId)}
                      disabled={assignTableMutation.isPending}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="font-semibold text-slate-900">
                        #{waiting.waitingNumber} - {waiting.userNickname || waiting.userName || '고객'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {waiting.headCount}명
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // 상태 변경 모드
              <div>
                <div className="text-sm text-slate-600 mb-4">
                  현재 상태: <span className="font-semibold">{selectedTable.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusChange('EMPTY')}
                    className="px-4 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="font-semibold text-slate-900">빈자리</div>
                    <div className="text-xs text-slate-500">EMPTY</div>
                  </button>
                  <button
                    onClick={() => handleStatusChange('OCCUPIED')}
                    className="px-4 py-3 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="font-semibold text-green-700">사용중</div>
                    <div className="text-xs text-green-600">OCCUPIED</div>
                  </button>
                  <button
                    onClick={() => handleStatusChange('CLEANING')}
                    className="px-4 py-3 border-2 border-yellow-500 rounded-lg hover:bg-yellow-50 transition-colors text-left"
                  >
                    <div className="font-semibold text-yellow-700">정리중</div>
                    <div className="text-xs text-yellow-600">CLEANING</div>
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="font-semibold text-slate-600">취소</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default TableManagement;
