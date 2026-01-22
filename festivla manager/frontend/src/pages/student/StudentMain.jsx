import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const StudentMain = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/student/apply');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-rose-50 via-white to-yellow-50">
      {/* 중앙 흰색 카드 */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center">
        
        {/* 프로필 이미지 (원형) */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center overflow-hidden shadow-md border-2 border-rose-100">
            {/* 프로필 이미지 플레이스홀더 - 축제 티켓 아이콘 */}
            <div className="w-full h-full bg-gradient-to-br from-amber-400 to-rose-400 opacity-60"></div>
          </div>
          {/* 티켓 아이콘 오버레이 */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-200">
            <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        </div>

        {/* Festival 태그 */}
        <div className="mb-4 px-3 py-1 bg-rose-500 rounded-full">
          <span className="text-white text-xs font-medium">✨ FESTIVAL 2024</span>
        </div>

        {/* 메인 제목 */}
        <h1 className="text-2xl font-bold text-slate-900 mb-3 text-center">
          대기 등록을 시작하세요
        </h1>

        {/* 설명 텍스트 */}
        <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
          긴줄 서기는 이제 그만.<br />
          스마트하게 축제를 즐겨보세요.
        </p>

        {/* 동의하고 시작하기 버튼 */}
        <Button
          onClick={handleStartClick}
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 py-4 text-base font-semibold"
        >
          동의하고 시작하기
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>

        <button
          onClick={() => navigate('/student/login')}
          className="w-full mt-3 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
        >
          내 웨이팅 조회하기
        </button>

        {/* 푸터 링크 */}
        <div className="mt-8 pt-6 border-t border-slate-100 w-full">
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
            <button className="hover:text-slate-700 transition-colors">이용약관</button>
            <span className="text-slate-300">|</span>
            <button className="hover:text-slate-700 transition-colors">개인정보처리방침</button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4">
            FESTIVAL WAITLIST SYSTEM © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentMain;
