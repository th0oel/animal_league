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

# animal_league

동물 리그 학습/일정 관리를 위한 Spring Boot REST API 프로젝트입니다.

## 1. 프로젝트 소개

- 사용자 회원가입/로그인
- JWT 기반 인증
- 사용자별 시험 일정(Exam) 관리
- 사용자별 캘린더(Calendar) 관리
- 공통 응답 포맷(`ApiResponse`) + 전역 예외 처리

## 2. 기술 스택

- Java 21
- Spring Boot 3.x
- Spring Web, Spring Security, Spring Data JPA
- MySQL
- JWT (`jjwt`)
- Lombok

## 3. 패키지 구조

- `com.up.demo.config`: 보안 설정, JWT 필터/토큰 제공자
- `com.up.demo.controller`: API 컨트롤러, 전역 예외 처리기
- `com.up.demo.controller.dto`: 요청/응답 DTO, 공통 응답 모델
- `com.up.demo.entity`: JPA 엔티티
- `com.up.demo.repository`: JPA Repository
- `com.up.demo.service`: 비즈니스 로직

## 4. 인증/보안 동작

- `POST /api/v1/auth/**`는 인증 없이 접근 가능
- 나머지 API는 JWT 인증 필요
- JWT의 `userId`를 SecurityContext에 올려서, 캘린더/시험 API는 현재 로그인 사용자 기준으로 동작합니다.
- Swagger UI에서 `Authorize` 버튼으로 JWT를 입력하면 보호 API를 바로 테스트할 수 있습니다.
- Swagger 접속 경로

```text
/swagger-ui/index.html
```

- 요청 헤더 예시

```http
Authorization: Bearer {token}
```

- 비밀번호는 `BCrypt`로 암호화되어 저장됩니다.
- JWT 설정값: `src/main/resources/application.yaml`
  - `jwt.secret`
  - `jwt.expire-ms`

## 5. 공통 응답 포맷

```json
{
  "status": 200,
  "message": "string",
  "data": {}
}
```

- `data`는 없을 때 생략될 수 있습니다.

## 6. API 명세

### 6.1 Auth API

#### 회원가입
- **Method**: `POST`
- **URL**: `/api/v1/auth/register`

Request

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

Response (200)

```json
{
  "status": 200,
  "message": "회원가입이 완료되었습니다."
}
```

Response (400)

```json
{
  "status": 400,
  "message": "이미 가입된 이메일입니다."
}
```

#### 로그인
- **Method**: `POST`
- **URL**: `/api/v1/auth/login`

Request

```json
{
  "email": "string",
  "password": "string"
}
```

Response (200)

```json
{
  "status": 200,
  "message": "로그인 성공",
  "data": {
    "token": "string"
  }
}
```

Response (401)

```json
{
  "status": 401,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다."
}
```

---

### 6.2 Calendar API

> 아래 API는 JWT 필요
> 현재 로그인한 사용자의 캘린더만 조회/생성합니다.

#### 캘린더 생성
- **Method**: `POST`
- **URL**: `/api/v1/calendars`

Request

```json
{
  "calendarName": "My Calendar"
}
```

Response (201)

```json
{
  "status": 201,
  "message": "캘린더가 생성되었습니다.",
  "data": {
    "id": 1,
    "calendarName": "My Calendar",
    "userId": 1
  }
}
```

Response (400, 중복 생성)

```json
{
  "status": 400,
  "message": "해당 유저의 캘린더가 이미 존재합니다."
}
```

#### 캘린더 조회
- **Method**: `GET`
- **URL**: `/api/v1/calendars`

Response (200)

```json
{
  "status": 200,
  "message": "캘린더 조회 성공",
  "data": {
    "id": 1,
    "calendarName": "My Calendar",
    "userId": 1,
    "schedules": [
      {
        "date": "2026-04-09",
        "subjects": [
          {
            "subject": "Math",
            "priority": 1
          }
        ]
      }
    ]
  }
}
```

Response (404)

```json
{
  "status": 404,
  "message": "해당 유저의 캘린더가 존재하지 않습니다."
}
```

---

### 6.3 Exam API

> 아래 API는 JWT 필요
> 현재 로그인한 사용자의 시험 일정만 조회/생성합니다.

#### 시험 일정 생성
- **Method**: `POST`
- **URL**: `/api/v1/exams`

Request

```json
{
  "subject": "Math",
  "examDate": "2026-05-10",
  "difficulty": 8,
  "understanding": 2
}
```

Response (201)

```json
{
  "status": 201,
  "message": "시험 일정이 생성되었습니다.",
  "data": {
    "id": 1,
    "subject": "Math",
    "examDate": "2026-05-10",
    "difficulty": 8,
    "understanding": 2,
    "userId": 1
  }
}
```

Response (400)

```json
{
  "status": 400,
  "message": "subject, examDate, difficulty, understanding은 필수입니다."
}
```

#### 시험 일정 목록 조회
- **Method**: `GET`
- **URL**: `/api/v1/exams`

Response (200)

```json
{
  "status": 200,
  "message": "시험 일정 조회 성공",
  "data": [
    {
      "id": 1,
      "subject": "Math",
      "examDate": "2026-05-10",
      "difficulty": 8,
      "understanding": 2,
      "userId": 1
    }
  ]
}
```

---

### 6.4 Calendar 조회 학습 일정 생성 규칙

- `GET /api/v1/calendars`는 현재 사용자의 시험 목록(`difficulty`, `understanding`, `examDate`)을 이용해 우선순위를 계산합니다.
- 우선순위 점수는 **난이도(높을수록 우선)**, **이해도(낮을수록 우선)**, **시험일이 가까울수록 우선** 기준으로 계산됩니다.
- 우선순위 순서대로 `priority`를 부여합니다. (`1`이 가장 중요)
- 오늘부터 각 시험 `examDate`까지 학습 과목을 배치합니다.
- 생성된 학습 기간이 30일보다 짧으면, 앞/뒤에 빈 날짜를 최대한 균등하게 채워 총 30일을 반환합니다.

Response (200 예시)

```json
{
  "status": 200,
  "message": "캘린더 조회 성공",
  "data": {
    "id": 1,
    "calendarName": "My Calendar",
    "userId": 1,
    "schedules": [
      {
        "date": "2026-04-08",
        "subjects": []
      },
      {
        "date": "2026-04-09",
        "subjects": [
          {
            "subject": "Math",
            "priority": 1
          },
          {
            "subject": "English",
            "priority": 2
          }
        ]
      }
    ]
  }
}
```

## 7. 실행 전 설정

`src/main/resources/application.yaml`에서 DB/JWT 값을 환경에 맞게 수정하세요.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?serverTimezone=Asia/Seoul
    username: root
    password: 1234

jwt:
  secret: this-is-a-very-long-jwt-secret-key-for-animal-league-project
  expire-ms: 3600000
```
