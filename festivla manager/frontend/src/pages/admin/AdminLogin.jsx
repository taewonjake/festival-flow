import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../api/axiosConfig';
import useUserStore from '../../store/userStore';

const AdminLogin = () => {
  // 관리자 로그인 페이지일 때 body에 클래스 추가
  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [formData, setFormData] = useState({
    email: 'admin',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axiosInstance.post('/v1/admin/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // 로그인 성공 시 사용자 정보 저장
      if (data.data) {
        // UserLoginResponse: { userId, nickname, role }
        login(data.data, null);
        navigate('/admin/dashboard');
      }
    },
    onError: (error) => {
      alert(error.response?.data?.message || '로그인에 실패했습니다.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-5 relative overflow-hidden">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 opacity-10 blur-3xl"></div>
      
      {/* 중앙 로그인 카드 */}
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* 보안 아이콘 */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          관리자 로그인
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          축제 관리 시스템 보안 접속
        </p>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 아이디 입력 */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              아이디
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="admin"
                required
              />
            </div>
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="•••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-slate-400 hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-400 hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-gradient-to-r from-teal-600 to-teal-400 text-white font-semibold py-3 px-6 rounded-lg hover:from-teal-500 hover:to-teal-300 transition-all duration-200 shadow-lg hover:shadow-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loginMutation.isPending ? (
              '로그인 중...'
            ) : (
              <>
                로그인
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* 비밀번호 찾기 링크 */}
          <div className="text-center">
            <button
              type="button"
              className="text-slate-400 text-sm hover:text-slate-300 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </form>
      </div>

      {/* 하단 보안 메시지 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-slate-500 text-xs">
        <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>SECURE 256-BIT SSL ENCRYPTED</span>
      </div>
    </div>
  );
};

export default AdminLogin;
