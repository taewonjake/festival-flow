# 🎪 Festival Flow — 대학 축제 주점 웨이팅 & 테이블 관리 솔루션

대학 축제의 긴 대기줄과 복잡한 테이블 관리를 해결하기 위한 **QR 코드 기반 실시간 웨이팅 및 통합 관리 플랫폼**입니다.

---

## 1. 소개 및 개요

*   **프로젝트 기간:** 2026.01.20 ~ (진행 중)
*   **프로젝트 설명:**
    *   **학생(User):** 모바일로 간편하게 주점 대기를 등록하고, 실시간으로 내 순서를 확인하며, 입장 순서가 되면 **동적 QR 코드**를 발급받아 입장합니다.
    *   **관리자(Admin):** 대시보드를 통해 실시간 대기열과 테이블 현황을 한눈에 파악하고, QR 스캔을 통해 손님을 인증 및 테이블에 배정합니다.

## 2. 기술 및 개발 환경

*   **Frontend:** React (Vite), Tailwind CSS
*   **Backend:** Java, Spring Boot, Spring Data JPA
*   **Database:** H2 (Dev) / MySQL (Prod), Redis
*   **Communication:** WebSocket (STOMP), HTTP REST API
*   **Deployment:** Docker

### 사용한 라이브러리 (선정 이유)

*   **🎨 Tailwind CSS:** 빠른 UI 프로토타이핑과 모바일 반응형 디자인 구현 용이.
*   **🐻 Zustand:** Redux보다 보일러플레이트가 적고 직관적인 전역 상태 관리(유저 세션, 인증 정보).
*   **🔄 TanStack Query (React Query):** 서버 상태(대기열, 테이블 정보)와 클라이언트 상태를 분리하고, 자동 갱신(Refetching) 및 캐싱을 통해 실시간성 보장.
*   **📱 react-qr-code / react-qr-scanner:** QR 생성 및 카메라 연동을 위한 경량화된 라이브러리.
*   **🔐 Google Authenticator (TOTP):** 시간 기반 일회용 패스워드 로직을 백엔드에 구현하여 QR 코드 복제 및 재사용 방지.

## 3. 주요 기능

### 🙋‍♀️ 학생 (User)
*   **간편 대기 등록:** 전화번호와 인원수 입력만으로 웨이팅 등록.
*   **실시간 현황 대시보드:** 내 앞 대기 팀 수, 예상 대기 시간 실시간 확인 (WebSocket + Polling).
*   **스마트 알림:** 입장 순서 임박 시 알림 및 "지금 갈게요" 상태 전송 기능.
*   **Dynamic QR Ticket:** 입장 호출 시에만 생성되는 보안 QR 코드로 입장 인증.
*   **1:1 문의 채팅:** 관리자와 실시간 소통 가능한 채팅 기능.

### 🕵️‍♂️ 관리자 (Admin)
*   **통합 대시보드:** 총 대기 팀, 현재 입장 팀, 예상 대기 시간 등 핵심 지표 시각화.
*   **실시간 웨이팅 관리:** 대기열 필터링(대기중/호출됨/입장완료), 호출 및 취소 처리.
*   **QR 스캔 & 테이블 배정:** 학생의 QR을 스캔하여 유효성 검증(TOTP) 후 빈 테이블에 즉시 배정.
*   **테이블 매니지먼트:** 테이블 배치도 시각화 및 점유 상태(사용중/빈자리) 실시간 제어.

## 4. 트러블 슈팅 & 고민의 흔적 (Problem Solving)

프로젝트를 진행하며 마주쳤던 기술적 난관과 해결 과정입니다.

### 🛡️ 1. QR 코드 보안과 유효성 검증 (Fake Entry 방지)
*   **문제:** 단순히 사용자 ID를 QR로 변환할 경우, 스크린샷을 찍어 공유하거나 입장 후 재사용하는 문제가 발생할 수 있음.
*   **해결:**
    *   Backend에 **TOTP (Time-based One-Time Password)** 알고리즘을 도입.
    *   `waitingId`와 현재 시간을 조합하여 30초마다 갱신되는 고유 Hash 값을 생성.
    *   Scanner가 QR을 읽을 때 서버에서 유효 시간을 검증하여 스크린샷 및 재사용을 원천 차단.

### ⚡ 2. 실시간 데이터 동기화 전략 (WebSocket vs Polling)
*   **고민:** 대기 순서가 줄어드는 것을 사용자가 즉각적으로 느껴야 함. 모든 데이터를 WebSocket으로 보내기엔 오버헤드가 우려됨.
*   **해결:** **Hybrid 접근 방식** 채택.
    *   **이벤트 트리거:** '호출(Called)', '순위 변동(Rank Update)'과 같은 중요 이벤트는 **WebSocket**으로 즉시 푸시.
    *   **데이터 정합성:** React Query의 `refetchInterval`을 활용해 주기적(예: 30초)으로 전체 데이터를 동기화하여 소켓 유실 시에도 데이터 정확성 보장.

### 📱 3. React 18과 레거시 라이브러리 충돌
*   **문제:** QR 스캐너 구현을 위해 `react-qr-scanner` 도입 시 React 18 버전과 Peer Dependency 충돌 발생 (`ERESOLVE unable to resolve dependency tree`).
*   **해결:**
    *   라이브러리 코드를 직접 수정하는 대신, 패키지 매니저 차원에서 `--legacy-peer-deps` 옵션을 사용하여 의존성 트리 검사를 우회 설치.
    *   설치 후 `QrScanner` 컴포넌트가 최신 React 생명주기 안에서 메모리 누수 없이 작동하도록 `useEffect` 정리(cleanup) 함수 강화.

### 🪑 4. 테이블 배정 로직과 상태 관리 UX
*   **문제:** QR 스캔 후 테이블을 배정하는 과정에서, 상태 변수 명명 실수(`selectedTable` vs `selectedTableId`)와 DTO 필드 불일치로 인해 UI가 멈추거나 모든 테이블이 선택되는 버그 발생.
*   **해결:**
    *   상태 관리를 객체(Object)에서 원시값(Primitive ID)으로 단순화하여 비교 로직의 복잡도 제거.
    *   Backend `TableResponse` DTO와 Frontend 컴포넌트의 프로퍼티 명칭을 통일하여 데이터 흐름을 명확히 개선.

## 5. 프로젝트 구조

```
festival-flow/
├── backend/                  # Spring Boot Server
│   ├── src/main/java/com/example/backend
│   │   ├── config/           # WebSocket, Redis, Swagger 설정
│   │   ├── controller/       # REST API 컨트롤러
│   │   ├── entity/           # JPA 엔티티 (User, Waiting, Table)
│   │   ├── service/          # 비즈니스 로직 (QR, Waiting 등)
│   │   └── handler/          # WebSocket 핸들러
│   └── ...
├── frontend/                 # React Client
│   ├── src/
│   │   ├── api/              # Axios API 모듈
│   │   ├── components/       # 재사용 UI 컴포넌트
│   │   ├── hooks/            # 커스텀 훅 (useSocket 등)
│   │   ├── pages/            # 페이지 (Admin/Student 분리)
│   │   ├── store/            # Zustand 전역 상태
│   │   └── ...
│   └── ...
└── docker-compose.yml        # 컨테이너 오케스트레이션
```

## 6. System Flowchart

```mermaid
graph TD
    %% 사용자(학생) 흐름
    subgraph Student[🙋‍♀️ Student App]
        S_Start(접속 및 로그인) --> S_Main{대기 등록 여부}
        S_Main -- 미등록 --> S_Form[웨이팅 등록]
        S_Form --> S_Wait[대기 현황판\n(실시간 순서 확인)]
        S_Main -- 등록됨 --> S_Wait
        
        S_Wait -- 순서 임박 --> S_Alert[입장 알림 수신]
        S_Alert --> S_QR[QR Ticket 발급\n(30초마다 갱신)]
        S_QR --> S_Scan(QR 스캔 대기)
        
        S_Wait -- 문제 발생 --> S_Chat[1:1 채팅 문의]
    end

    %% 관리자 흐름
    subgraph Admin[🕵️‍♂️ Admin Dashboard]
        A_Login(관리자 로그인) --> A_Dash[통합 대시보드]
        
        A_Dash --> A_Queue[실시간 대기열 관리]
        A_Queue --> A_Call[손님 호출]
        
        A_Dash --> A_QR[QR 스캐너]
        A_QR -- 카메라 스캔 --> A_Verify{QR 유효성 검증\n(TOTP)}
        
        A_Verify -- 유효함 --> A_Table[테이블 배정]
        A_Verify -- 유효하지 않음 --> A_Error[경고 메시지]
        
        A_Table --> A_Status[테이블 현황 업데이트]
    end

    %% 시스템 상호작용
    S_Form -- API: 대기 요청 --> A_Queue
    A_Call -- WebSocket: 호출 알림 --> S_Alert
    S_Scan -.-> A_QR
    S_Chat <--> A_Dash
```

---
> 🚀 설치 및 실행 방법은 [INSTALL.md](./INSTALL.md) 파일을 참고해주세요.
