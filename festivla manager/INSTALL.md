# 🚀 설치 및 실행 가이드 (Installation & Run)

이 프로젝트는 Backend(Spring Boot)와 Frontend(React)로 구성되어 있습니다.

## 사전 요구 사항 (Prerequisites)

*   **Java JDK 17** 이상
*   **Node.js 18** 이상 (LTS 권장)
*   **Docker** (선택 사항 - Redis/DB 실행용)

## 1. Backend 실행 (Spring Boot)

데이터베이스 및 서버 환경을 설정하고 실행합니다.

```bash
# 1. backend 디렉토리로 이동
cd backend

# 2. 의존성 설치 및 빌드 (Windows)
./gradlew build

# 3. 서버 실행
./gradlew bootRun
```

*   서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.
*   API 문서는 `http://localhost:8080/swagger-ui/index.html`에서 확인할 수 있습니다.

## 2. Frontend 실행 (React)

사용자 및 관리자 인터페이스를 실행합니다.

```bash
# 1. frontend 디렉토리로 이동
cd frontend

# 2. 패키지 설치 (의존성 충돌 방지를 위해 legacy-peer-deps 권장)
npm install --legacy-peer-deps

# 3. 개발 서버 실행
npm run dev
```

*   프론트엔드는 기본적으로 `http://localhost:5173` (Vite 기본 포트)에서 실행됩니다.

## 3. 환경 변수 설정 (Environment Variables)

### Backend (`backend/src/main/resources/application.properties`)
DB 설정 및 포트 설정을 변경하려면 이 파일을 수정하세요.

```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb  # 개발용 H2 DB
spring.jpa.hibernate.ddl-auto=update
```

### Frontend (`frontend/.env`)
API 서버 주소가 변경된 경우 루트에 `.env` 파일을 생성하여 설정합니다.

```env
VITE_API_URL=http://localhost:8080/api
```
