import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { waitingApi } from '../../api/waitingApi';
import Button from '../../components/common/Button';
import useUserStore from '../../store/userStore';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { login } = useUserStore();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 로그인 Mutation
  const loginMutation = useMutation({
    mutationFn: async ({ name, phoneNumber }) => {
      const response = await authApi.login(name, phoneNumber);
      return response.data;
    },
    onSuccess: async (data) => {
      // 로그인 성공 시 사용자 정보 저장
      login(data.data, null);
      
      // 내 웨이팅 정보 조회
      try {
        const waitingResponse = await waitingApi.getMyWaiting();
        if (waitingResponse.data) {
          // 웨이팅이 있으면 현황판으로 이동
          navigate('/student/status');
        }
      } catch (error) {
        // 웨이팅이 없거나 에러가 발생한 경우
        if (error.response?.status === 404 || error.response?.data?.message?.includes('없습니다')) {
          alert('등록된 웨이팅이 없습니다. 웨이팅 신청 페이지로 이동합니다.');
          navigate('/student/apply');
        } else {
          // 기타 에러는 무시하고 신청 페이지로 (또는 에러 표시)
          alert('웨이팅 정보를 불러오지 못했습니다. 신청 페이지로 이동합니다.');
          navigate('/student/apply');
        }
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="flex-1 flex flex-col p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          내 웨이팅 조회하기
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          신청할 때 입력한 정보를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                maxLength={13}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-4 text-base font-bold shadow-md shadow-indigo-200"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? '조회 중...' : '조회하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
