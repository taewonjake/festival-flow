import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import useUserStore from '../../store/userStore';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  // 관리자 페이지일 때 body에 클래스 추가
  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/waitings', label: 'Queue', icon: '📋' },
    { path: '/admin/tables', label: 'Tables', icon: '🪑' },
    { path: '/admin/qr-scanner', label: 'QR Scan', icon: '📱' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* 왼쪽: 로고 */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">Festival Admin Center</h1>
            </div>

            {/* 중앙: 빈 공간 (검색 바 제거) */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 lg:mx-8 hidden md:block"></div>

            {/* 오른쪽: 아이콘 및 프로필 */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              {/* 프로필 */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="hidden lg:block min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">관리자</div>
                  <div className="text-xs text-slate-500 truncate">Main Staff</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-0.5 sm:ml-1 lg:ml-2 p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  title="로그아웃"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 상단 네비게이션 바 */}
        <nav className="border-t border-slate-200 bg-white overflow-x-auto">
          <div className="px-3 sm:px-6">
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-max">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm font-medium transition-all duration-200 relative whitespace-nowrap
                    ${location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                      ? 'text-teal-600'
                      : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {(location.pathname === item.path || location.pathname.startsWith(item.path + '/')) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="p-3 sm:p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
