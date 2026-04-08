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

