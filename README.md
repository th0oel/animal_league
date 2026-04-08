# Utopia Planner Frontend

Utopia Planner는 시험 일정과 학습 계획을 관리하기 위한 웹 서비스입니다. 이 저장소는 프론트엔드 프로젝트이며, `Backend_README.md`에 정리된 Spring Boot REST API와 연동하도록 구성되어 있습니다.

## 프로젝트 개요

- 로그인/회원가입 기반 학습 관리 웹 애플리케이션
- 사용자별 시험 일정(`Exam`)과 캘린더(`Calendar`) 관리
- 과목 입력 마법사, 캘린더, 프로필, 통계 화면 제공
- JWT 토큰을 `localStorage`에 저장하여 인증 상태를 유지

## 주요 기능

### 1. 메인 페이지
- 로그인/회원가입 진입
- 로그인 상태에 따라 과목 입력 / 캘린더 이동 버튼 노출

### 2. 과목 정보 입력 페이지
- 과목명, 시험 예정일, 난이도, 이해도 입력
- 여러 과목을 한 번에 단계적으로 추가 가능
- `POST /api/v1/exams` 호출로 시험 일정 생성

### 3. 캘린더 페이지
- 사용자별 학습 일정 조회 및 월간 캘린더 렌더링
- 캘린더 데이터는 백엔드 응답을 기반으로 동적 표시
- 로그인 사용자 기준으로 동작

### 4. 프로필 / 통계 페이지
- 시험 과목 수, 평균 난이도, 최근 시험 목록 표시
- 난이도/이해도별 분포와 전체 시험 목록 확인

### 5. 부가 인터랙션
- 캘린더 페이지에 실험적인 게임화 팝업 포함
- 팝업 동의 여부는 `localStorage`에 저장

## 폴더 구조

```text
animal_league_front/
├── index.html                # 메인 페이지
├── pages/                    # 기능별 화면
│   ├── calendar.html
│   ├── profile.html
│   ├── stats.html
│   └── study-plan-wizard.html
├── assets/
│   ├── css/
│   │   └── custom.css
│   └── js/
│       ├── main.js           # 공통 인증/팝업/API 로직
│       └── study-plan.js     # 과목 입력 wizard 로직
├── components/               # 재사용용 HTML 조각(현재는 비어 있음)
├── Backend_README.md         # 백엔드 API 명세
└── package.json              # Vite 실행 스크립트
```

## 실행 방법

### 1) 의존성 설치

```cmd
cd /d D:\IdeaProjects\animal_league_front
npm install
```

### 2) 개발 서버 실행

```cmd
npm run dev
```

기본 접속 주소는 보통 아래와 같습니다.

```text
http://localhost:5173/
```

### 3) 주요 페이지 접속

- `http://localhost:5173/` — 메인 페이지
- `http://localhost:5173/pages/study-plan-wizard.html` — 과목 입력
- `http://localhost:5173/pages/calendar.html` — 캘린더
- `http://localhost:5173/pages/profile.html` — 프로필
- `http://localhost:5173/pages/stats.html` — 통계

## 백엔드 연동 정보

프론트엔드는 기본적으로 아래 API 주소를 사용합니다.

```text
http://localhost:8080/api/v1
```

### 인증
- `POST /api/v1/auth/register` — 회원가입
- `POST /api/v1/auth/login` — 로그인

### 캘린더
- `POST /api/v1/calendars` — 캘린더 생성
- `GET /api/v1/calendars` — 캘린더 조회

### 시험 일정
- `POST /api/v1/exams` — 시험 일정 생성
- `GET /api/v1/exams` — 시험 일정 목록 조회

### 인증/보안 규칙
- `POST /api/v1/auth/**`는 인증 없이 접근 가능
- 나머지 API는 JWT 인증 필요
- 프론트엔드는 로그인 성공 시 받은 토큰을 `localStorage`에 저장하고, 이후 요청의 `Authorization: Bearer {token}` 헤더에 포함합니다.

상세한 응답 포맷과 서버 규칙은 `Backend_README.md`를 참고하세요.

## 참고 사항

- 이 프로젝트는 프론트엔드 정적 파일 기반으로 구성되어 있습니다.
- `components/` 폴더는 현재 재사용 컴포넌트 보관용으로 남아 있습니다.
- `README.md`는 프론트 실행 및 백엔드 연결 방법을 빠르게 이해하기 위한 문서입니다.

