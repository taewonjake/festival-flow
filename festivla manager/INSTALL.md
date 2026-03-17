# 설치 및 실행 가이드

이 프로젝트는 다음 구성으로 동작합니다.
- 백엔드: Spring Boot
- 프론트엔드: React (Vite)
- 인프라: Docker 기반 MySQL, Redis

현재 백엔드는 H2 메모리 DB가 아니라 MySQL + Flyway 마이그레이션 기준으로 실행됩니다.

## 1. 사전 준비

- Java 17 이상
- Node.js 18 이상 (LTS 권장)
- Docker / Docker Compose

## 2. 인프라 실행 (MySQL, Redis)

프로젝트 루트(`docker-compose.yml`이 있는 위치)에서 실행:

```bash
docker-compose up -d
```

컨테이너 상태 확인:

```bash
docker ps
```

정상 기동 기대 컨테이너:
- `festival_flow_mysql` (`3307 -> 3306`)
- `festival_flow_redis` (`6379 -> 6379`)

## 3. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

Windows PowerShell:

```powershell
cd backend
.\gradlew.bat bootRun
```

### 백엔드 실행 설정

- DB URL: `jdbc:mysql://localhost:3307/festival_flow`
- JPA 모드: `spring.jpa.hibernate.ddl-auto=validate`
- Flyway: `spring.flyway.enabled=true`

애플리케이션 시작 시 Flyway 마이그레이션이 자동 적용됩니다.

### 백엔드 접속 주소

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

## 4. 프론트엔드 실행

새 터미널에서 실행:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

프론트엔드 주소:
- `http://localhost:5173`

## 5. 빠른 점검

1. Docker 컨테이너가 실행 중인지 확인 (`docker ps`)
2. 백엔드 로그에서 Flyway 성공 로그 확인
3. Swagger UI 접속 확인
4. 프론트 페이지 접속 후 API 호출 정상 동작 확인

## 6. 문제 해결

- MySQL 연결 실패 (`Connection refused`):
  - `docker-compose up -d` 재실행
  - `festival_flow_mysql` 컨테이너 상태 확인
  - 로컬 `3307` 포트 사용 여부 확인

- Flyway 마이그레이션 실패:
  - 백엔드 로그에서 실패한 migration 버전 확인
  - `backend/src/main/resources/db/migration` 스크립트 점검

- Redis 연결 오류:
  - `festival_flow_redis` 컨테이너 상태 확인
  - 로컬 `6379` 포트 충돌 여부 확인
