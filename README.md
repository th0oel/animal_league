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
