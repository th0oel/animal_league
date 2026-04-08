# animal_league

## Auth API

### 1) 회원가입

- **Method**: `POST`
- **URL**: `/api/v1/auth/register`

#### Request Body

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Response (성공)

```json
{
  "status": 200,
  "message": "회원가입이 완료되었습니다."
}
```

#### Response (실패 예시: 중복 이메일/잘못된 입력)

```json
{
  "status": 400,
  "message": "이미 가입된 이메일입니다."
}
```

---

### 2) 로그인

- **Method**: `POST`
- **URL**: `/api/v1/auth/login`

#### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

#### Response (성공)

```json
{
  "status": 200,
  "message": "로그인 성공",
  "data": {
	"token": "string"
  }
}
```

#### Response (실패 예시: 인증 실패)

```json
{
  "status": 401,
  "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "data": null
}
```

## 구현 상세

- 비밀번호는 `SHA-256` 해시로 저장됩니다.
- 로그인 성공 시 JWT 토큰이 발급됩니다.
- JWT 설정값은 `src/main/resources/application.yaml`의 `jwt.secret`, `jwt.expire-ms`에서 관리합니다.

---

### 시험 일정 등록

- **Method**: `POST`
- **URL**: `/api/exams/{userId}`

#### Request Body

```json
{
  "subject": "string",
  "examDate": "YYYY-MM-DD",
  "difficulty": "string",
  "understandingLevel": "integer"
}
```

#### Response (성공)

```json
{
  "status": 201,
  "message": "시험 일정이 등록되었습니다.",
  "data": {
    "id": "integer",
    "subject": "string",
    "examDate": "YYYY-MM-DD",
    "difficulty": "string",
    "understandingLevel": "integer"
  }
}
```

#### Response (실패 예시: 유저 없음/데이터 누락)

```json
{
  "status": 400,
  "message": "해당 유저를 찾을 수 없거나 입력값이 올바르지 않습니다."
}
```

---

### 2) 전체 시험 일정 조회

- **Method**: `GET`
- **URL**: `/api/exams/{userId}`

#### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

## Calendar API

### 1) 캘린더 생성 및 연결

- **Method**: `POST`
- **URL**: `/api/calendars/{userId}?name={calendarName}`

#### Response (성공)

```json
{
  "status": 200,
  "message": "캘린더가 생성되어 유저와 연결되었습니다.",
  "data": {
    "id": "integer",
    "calendarName": "string",
    "userId": "integer"
  }
}
```

## 2) 유저별 캘린더 조회

- **Method**: `GET`
- **URL**: `api/calendars/user/{userId}`


#### Response (성공)

```json
{
  "status": 200,
  "message": "캘린더 조회 성공",
  "data": {
    "id": "integer",
    "calendarName": "string",
    "createdAt": "ISO-8601 String"
  }
}
```

## 구현 상세

- Relationship: User와 Exam은 1:N, User와 Calendar는 1:1 매핑 구조입니다.
- Auditing: BaseEntity 상속을 통해 모든 데이터의 생성/수정 시간이 자동 관리됩니다.
- Utopia Feature: 일정 등록 시 확률적으로 '자기합리화' 로직이 작동하여 데이터가 변조될 수 있습니다. (isFake 필드 활용)
