import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/adminApi';

const AdminDashboard = () => {
  // 대시보드 통계 조회
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 5000, // 5초마다 갱신
  });

  // 최근 웨이팅 조회 (최근 활동용)
  const { data: recentWaitingsData } = useQuery({
    queryKey: ['recentWaitings'],
    queryFn: () => adminApi.getAllWaitings(null),
    refetchInterval: 3000, // 3초마다 갱신
  });

  const stats = statsData?.data?.data;
  const recentWaitings = recentWaitingsData?.data?.data || [];

  // 통계 데이터 계산
  const summaryData = stats ? {
    totalWaiting: { 
      value: stats.totalWaiting || 0, 
      unit: '팀' 
    },
    tablesInUse: { 
      value: stats.totalTables > 0 
        ? `${Math.round((stats.tablesInUse / stats.totalTables) * 100)}%`
        : '0%', 
      subtitle: `(${stats.tablesInUse || 0}/${stats.totalTables || 0})`,
      progress: stats.totalTables > 0 
        ? Math.round((stats.tablesInUse / stats.totalTables) * 100)
        : 0
    },
    calledUsers: { 
      value: stats.calledUsers || 0, 
      unit: '명',
      urgent: (stats.calledUsers || 0) > 0
    },
  } : {
    totalWaiting: { value: 0, unit: '팀' },
    tablesInUse: { value: '0%', subtitle: '(0/0)', progress: 0 },
    calledUsers: { value: 0, unit: '명', urgent: false },
  };

  // 시간 경과 계산
  const getTimeAgo = (dateTime) => {
    if (!dateTime) return '방금 전';
    const now = new Date();
    const time = new Date(dateTime);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${Math.floor(diffHours / 24)}일 전`;
  };

  // 최근 활동 생성 (최근 웨이팅 목록에서)
  const recentActivities = recentWaitings
    .slice(0, 5)
    .map((waiting) => {
      const timeAgo = getTimeAgo(waiting.createdAt);
      let color = 'gray';
      let title = '';
      let detail = '';

      if (waiting.status === 'CALLED') {
        color = 'red';
        title = `호출: ${waiting.userNickname || waiting.userName || '고객'}님`;
        detail = `${waiting.headCount}명`;
      } else if (waiting.status === 'ARRIVED') {
        color = 'blue';
        title = `입장 완료: ${waiting.userNickname || waiting.userName || '고객'}님`;
        detail = `${waiting.headCount}명`;
      } else if (waiting.status === 'WAITING') {
        color = 'gray';
        title = `대기열 등록: ${waiting.userNickname || waiting.userName || '고객'}님`;
        detail = `${waiting.headCount}명 등록`;
      }

      return {
        type: waiting.status.toLowerCase(),
        title,
        detail,
        time: timeAgo,
        color,
      };
    });

  const quickMenuItems = [
    {
      title: '테이블 보기',
      description: '실시간 좌석 현황 및 예약 확인',
      icon: '🍴',
      path: '/admin/tables',
      iconColor: 'text-blue-500',
    },
    {
      title: '대기열 관리',
      description: '웨이팅 목록 및 입장 처리',
      icon: '📋',
      path: '/admin/waitings',
      iconColor: 'text-blue-500',
    },
    {
      title: 'QR 스캔',
      description: '입장권 및 주문 내역 스캔',
      icon: '📱',
      path: '/admin/qr-scanner',
      iconColor: 'text-blue-500',
    },
    {
      title: '채팅 상담',
      description: '고객 문의 실시간 응대',
      icon: '💬',
      path: '/admin/chat',
      iconColor: 'text-blue-500',
    },
  ];

  const getActivityDotColor = (color) => {
    const colors = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      gray: 'bg-slate-400',
    };
    return colors[color] || colors.gray;
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* 대시보드 제목 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
              메인 관제 대시보드
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-500">
              실시간 축제 현황 및 관리 시스템
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">실시간 업데이트 중</span>
          </div>
        </div>

        {/* 상단 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* 총 대기 팀 */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 min-h-[140px] sm:min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:w-7 sm:h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                {summaryData.totalWaiting.change}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 mb-2">총 대기 팀</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-auto">
              {statsLoading ? '...' : summaryData.totalWaiting.value}
              <span className="text-lg sm:text-xl lg:text-2xl ml-1 sm:ml-2">{summaryData.totalWaiting.unit}</span>
            </div>
          </div>

          {/* 사용 중 테이블 */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 min-h-[140px] sm:min-h-[160px] flex flex-col">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:w-7 sm:h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                {summaryData.tablesInUse.change}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 mb-2">사용 중 테이블</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
              {statsLoading ? '...' : summaryData.tablesInUse.value}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 mb-2 sm:mb-3">
              {statsLoading ? '...' : summaryData.tablesInUse.subtitle}
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden mt-auto">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${summaryData.tablesInUse.progress}%` }}
              ></div>
            </div>
          </div>

          {/* 호출 중 인원 */}
          <div className="bg-orange-50 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 border border-orange-100 min-h-[140px] sm:min-h-[160px] flex flex-col sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:w-7 sm:h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="bg-orange-200 text-orange-700 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap">
                Action Required
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 mb-2">호출 중 인원</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mt-auto">
              {statsLoading ? '...' : summaryData.calledUsers.value}
              <span className="text-lg sm:text-xl lg:text-2xl ml-1 sm:ml-2">명</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* 좌측: 퀵 메뉴 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">퀵 메뉴</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {quickMenuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 hover:-translate-y-1 transition-transform duration-200 hover:shadow-md group"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors ${item.iconColor}`}>
                      <span className="text-xl sm:text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 우측: 최근 활동 */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">최근 활동</h2>
              </div>
              <Link
                to="/admin/waitings"
                className="text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap"
              >
                더보기
              </Link>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 space-y-3 sm:space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-xs sm:text-sm text-slate-400 text-center py-4">
                  최근 활동이 없습니다
                </div>
              ) : (
                recentActivities.map((activity, index) => (
                <div key={index} className="relative pl-5 sm:pl-6 pb-3 sm:pb-4 last:pb-0">
                  {/* 타임라인 라인 */}
                  {index < recentActivities.length - 1 && (
                    <div className="absolute left-1.5 sm:left-2 top-5 sm:top-6 bottom-0 w-0.5 bg-slate-200"></div>
                  )}
                  
                  {/* 타임라인 점 */}
                  <div className={`absolute left-0 top-1 sm:top-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${getActivityDotColor(activity.color)}`}></div>
                  
                  {/* 활동 내용 */}
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-1 break-words">
                      {activity.title}
                    </div>
                    {activity.detail && (
                      <div className="text-xs text-slate-500 mb-1 break-words">
                        {activity.detail}
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      {activity.time}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
