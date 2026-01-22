# Festival Flow Frontend

Festival Flow 대학 축제 주점 웨이팅 및 관리 플랫폼 프론트엔드

## 기술 스택

- **Framework**: React 18 + Vite
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (전역 상태), TanStack Query (서버 상태)
- **Routing**: React Router Dom v6
- **HTTP Client**: Axios

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 3. 빌드
```bash
npm run build
```

## 프로젝트 구조

```
/src
  /api          # Axios 인스턴스 및 API 함수들
  /assets       # 이미지, 폰트 등 정적 파일
  /components   
    /common     # 공통 UI 컴포넌트 (Button, Input, Modal)
    /layout     # 레이아웃 컴포넌트 (MobileLayout, AdminLayout)
  /hooks        # 커스텀 훅 (useAuth, useSocket)
  /pages
    /student    # 학생용 페이지
    /admin      # 관리자용 페이지
  /store        # Zustand 스토어 (userStore)
  /utils        # 유틸 함수 (format 등)
```

## 주요 설정

### Axios 설정
- Base URL: `http://localhost:8080/api`
- 요청/응답 인터셉터 설정 완료
- 토큰 자동 주입 및 401 에러 처리

### 라우팅
- `/student/*` - 학생용 라우트
- `/admin/*` - 관리자용 라우트

### Tailwind CSS
- 모바일 뷰 최대 너비: 430px
- 중앙 정렬 설정

## 백엔드 연동

백엔드 서버가 `http://localhost:8080`에서 실행되어야 합니다.
