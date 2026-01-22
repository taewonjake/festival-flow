import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { waitingApi } from '../../api/waitingApi';
import { authApi } from '../../api/authApi';
import Button from '../../components/common/Button';
import useUserStore from '../../store/userStore';

const WaitingForm = () => {
  const navigate = useNavigate();
  const { user, login } = useUserStore();
  const [headCount, setHeadCount] = useState(2);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // 회원가입/로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: async ({ name, phoneNumber }) => {
      const response = await authApi.login(name, phoneNumber);
      return response.data;
    },
    onSuccess: (data) => {
      // 로그인 성공 시 사용자 정보 저장
      login(data.data, null);
      // 웨이팅 등록 진행
      createWaitingMutation.mutate({ userId: data.data.userId, headCount });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
      alert(errorMessage);
    },
  });

  // 웨이팅 등록 Mutation
  const createWaitingMutation = useMutation({
    mutationFn: async ({ userId, headCount }) => {
      const response = await waitingApi.createWaiting(headCount);
      return response;
    },
    onSuccess: (data) => {
      navigate('/student/status');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || '웨이팅 등록에 실패했습니다.';
      alert(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || name.trim() === '') {
      alert('이름을 입력해주세요.');
      return;
    }

    if (!phoneNumber || phoneNumber.length < 13) {
      alert('전화번호를 올바르게 입력해주세요.');
      return;
    }

    // 전화번호 형식 검증 (010-XXXX-XXXX)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      return;
    }

    // 회원가입/로그인 먼저 처리
    loginMutation.mutate({ name, phoneNumber });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    
    if (value.length > 3 && value.length <= 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    
    setPhoneNumber(formatted);
  };

  const PersonIcon = ({ count }) => {
    if (count === 2) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (count === 3) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-md mx-auto p-5">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900">웨이팅 신청</h1>
          </div>
          <p className="text-slate-500 text-sm">
            함께할 인원을 선택하고 대기열에 등록하세요.
          </p>
        </div>

        {/* 흰색 카드 */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4">
          {/* 1. 인원 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              1 인원 선택
            </label>
            <div className="flex gap-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setHeadCount(count)}
                  className={`
                    flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                    transition-all duration-200
                    ${headCount === count
                      ? 'border-2 border-rose-500 bg-rose-50'
                      : 'border border-slate-200 bg-white hover:border-slate-300'
                    }
                  `}
                >
                  <div className={headCount === count ? 'text-rose-500' : 'text-slate-400'}>
                    <PersonIcon count={count} />
                  </div>
                  <span className={`text-sm font-medium ${headCount === count ? 'text-rose-500' : 'text-slate-900'}`}>
                    {count === 4 ? '4인 이상' : `${count}인`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. 이름 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              2 이름 입력
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50">
                <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  maxLength={20}
                  className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. 연락처 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              3 연락처 입력
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50">
                <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {phoneNumber.length === 13 && /^010-\d{4}-\d{4}$/.test(phoneNumber) && (
                  <div className="bg-rose-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>확인</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 정보 메시지 */}
          <div className="bg-rose-100 rounded-2xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-900 leading-relaxed">
              중복 신청은 시스템에서 자동으로 차단됩니다. 한 번 신청하면 수정할 수 없으니 신중하게 확인해주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 고정 신청하기 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-5 bg-white border-t border-slate-100 shadow-lg">
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          disabled={loginMutation.isPending || createWaitingMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-4 text-base font-semibold bg-gradient-to-b from-rose-400 to-rose-500"
        >
          {loginMutation.isPending || createWaitingMutation.isPending ? '처리 중...' : '신청하기'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default WaitingForm;
