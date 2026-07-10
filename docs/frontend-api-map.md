# Frontend API Map

이 문서는 `기능명세서.md`와 백엔드 Swagger 문서를 프론트 개발 기준으로 연결한 참고 문서입니다.

- Swagger UI: https://brands-matrix-sufficient-transcription.trycloudflare.com/swagger-ui/index.html#/
- OpenAPI JSON: https://brands-matrix-sufficient-transcription.trycloudflare.com/v3/api-docs
- API version: `Team 6 API v1`
- 정리 기준일: 2026-07-11

## 공통 규칙

### Base URL

현재 인증 코드에서는 아래 환경변수를 사용한다.

- `AUTH_BACKEND_URL`: 백엔드 기본 URL. 예: `https://brands-matrix-sufficient-transcription.trycloudflare.com`
- `AUTH_BACKEND_LOGIN_URL`: 로그인 API 전체 URL을 직접 지정할 때 사용
- `AUTH_BACKEND_SIGNUP_URL`: 회원가입 API 전체 URL을 직접 지정할 때 사용

추후 일반 API도 서버 액션 또는 route handler에서 호출하는 방식이면 `AUTH_BACKEND_URL`을 공통 base URL로 재사용하는 방향이 자연스럽다. 클라이언트 컴포넌트에서 직접 호출해야 하는 API가 생기면 별도 `NEXT_PUBLIC_` 환경변수 필요 여부를 검토한다.

### Response Envelope

대부분의 API 응답은 아래 형태를 따른다.

```ts
type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};
```

### Auth

Swagger 전역 보안 스키마는 Bearer JWT다.

```http
Authorization: Bearer {accessToken}
```

로그인, 회원가입, refresh를 제외한 API는 기본적으로 인증이 필요하다고 보고 구현한다.

## 기능별 API 연결

### 1. 회원가입

기능명세:
- 이메일 기반 회원가입
- 입력 항목: 이름, 이메일, 비밀번호
- 이메일 인증 없음

API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| 회원가입 | `POST` | `/api/v1/auth/signup` | `SignUpRequest` | `ApiResponse<Record<string, number>>` |

`SignUpRequest`

```ts
type SignUpRequest = {
  email: string;
  password: string; // min 8, max 72
  name: string; // max 50
};
```

프론트 메모:
- 현재 `app/(auth)/signup/actions.ts`에서 이미 연동되어 있다.
- 성공 후 로그인 페이지 이동 또는 자동 로그인 정책은 UX 결정이 필요하다.

### 2. 로그인과 세션

API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| 로그인 | `POST` | `/api/v1/auth/login` | `LoginRequest` | `ApiResponse<LoginResponse>` |
| 토큰 갱신 | `POST` | `/api/v1/auth/refresh` | `RefreshRequest` | `ApiResponse<TokenResponse>` |
| 내 정보 | `GET` | `/api/v1/members/me` | 없음 | `ApiResponse<MemberMeResponse>` |

`LoginRequest`

```ts
type LoginRequest = {
  email: string;
  password: string;
};
```

`LoginResponse`

```ts
type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  name: string;
  email: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
};
```

프론트 메모:
- 로그인 직후 온보딩 노출 여부는 `onboardingCompleted`로 판단한다.
- 현재 `auth.ts`에서 name/email/token을 세션에 담는 구조이므로 `onboardingCompleted`도 세션/JWT에 보관하는 방향이 좋다.
- refresh token 처리 정책은 아직 프론트 구현 필요 항목이다.

### 3. 온보딩 - 에피소드 5개 등록

기능명세:
- 사용자가 겪은 안 좋은 일 5개를 등록한다.
- 사건 제목: AI 자동 생성, 사용자가 수정 가능, 필수
- 사건 내용: 사용자가 자유 입력, 명세상 선택 항목
- 날짜: 기본값은 입력 날짜, 사용자가 수정 가능, 필수
- 5개를 모두 적지 않아도 나갈 수 있어야 한다.

API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| AI 제목 생성 | `POST` | `/api/v1/episodes/title-suggestions` | `TitleSuggestionRequest` | `ApiResponse<TitleSuggestionResponse>` |
| 에피소드 생성 | `POST` | `/api/v1/episodes` | `CreateEpisodeRequest` | `ApiResponse<CreateEpisodeResponse>` |
| 온보딩 완료 처리 | `POST` | `/api/v1/members/me/onboarding/complete` | 없음 | `ApiResponse<MemberMeResponse>` |

`TitleSuggestionRequest`

```ts
type TitleSuggestionRequest = {
  content: string; // max 5000
};
```

`CreateEpisodeRequest`

```ts
type CreateEpisodeRequest = {
  title: string; // max 150
  content: string; // max 5000
  episodeDate: string; // YYYY-MM-DD
};
```

`CreateEpisodeResponse`

```ts
type CreateEpisodeResponse = {
  episodeId: number;
  status: string;
  titleScore: number;
  currentTitle: string;
  availableEpisodeCount: number;
  canStartMatch: boolean;
  createdAt: string;
};
```

프론트 메모:
- 현재 Swagger 기준 `CreateEpisodeRequest.content`는 required다. 기능명세는 선택 항목이라고 되어 있어 백엔드와 정책 확인이 필요하다.
- 기능명세는 날짜에 월만 입력 가능한 예외를 언급하지만, Swagger는 `episodeDate`를 `date` 형식으로 요구한다. 월 단위 입력 지원 방식은 백엔드와 확인이 필요하다.
- 5개 등록 후 `POST /api/v1/members/me/onboarding/complete` 호출로 온보딩 완료 처리한다.
- 5개 미만으로 종료하는 UX가 필요하면, 몇 개까지 등록했을 때 완료 처리할지 정책 확인이 필요하다.

### 4. 온보딩 배치전 진행

기능명세:
- 5개 사건에 대한 순위 결정전
- 리그전 총 10판
- 매치 순서 = 등록 순서
- 리그전 1등 = 올타임 챔피언

연결 가능한 API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| 링 이벤트 목록 | `GET` | `/api/v1/ring/events` | 없음 | `ApiResponse<RingEventListResponse>` |
| 링 세션 시작 | `POST` | `/api/v1/ring/sessions` | `StartRingSessionRequest` | `ApiResponse<RingSessionResponse>` |
| 링 세션 조회 | `GET` | `/api/v1/ring/sessions/{sessionId}` | path `sessionId` | `ApiResponse<RingSessionResponse>` |
| 라운드 승자 선택 | `POST` | `/api/v1/ring/sessions/{sessionId}/rounds/{roundNo}/result` | `SelectRingWinnerRequest` | `ApiResponse<RingRoundResultResponse>` |

`StartRingSessionRequest`

```ts
type StartRingSessionRequest = {
  eventId: number;
};
```

`SelectRingWinnerRequest`

```ts
type SelectRingWinnerRequest = {
  winnerEpisodeId: number;
};
```

프론트 메모:
- 온보딩 배치전이 별도 이벤트 타입으로 내려오는지 `GET /api/v1/ring/events`의 `type` 값 확인이 필요하다.
- 세션 응답의 `currentRound.episodeA`, `currentRound.episodeB`를 카드 대결 UI에 연결한다.
- 승자 선택 후 응답의 `nextRound`가 있으면 다음 라운드로 이동하고, `sessionStatus`가 완료 상태이면 결과 화면으로 이동한다.

### 5. 홈

기능명세:
- 알림
- 오늘의 사건 등록
- 예정된 매칭 일정

API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| 홈 데이터 | `GET` | `/api/v1/home` | 없음 | `ApiResponse<HomeResponse>` |
| 오늘의 사건 등록 | `POST` | `/api/v1/episodes` | `CreateEpisodeRequest` | `ApiResponse<CreateEpisodeResponse>` |
| 링 이벤트 목록 | `GET` | `/api/v1/ring/events` | 없음 | `ApiResponse<RingEventListResponse>` |

`HomeResponse`

```ts
type HomeResponse = {
  today: string;
  availableEpisodeCount: number;
  canStartMatch: boolean;
  todayEpisode?: {
    episodeId: number;
    title: string;
    episodeDate: string;
    createdAt: string;
  };
  upcomingEvents: Array<{
    eventId: number;
    type: string;
    title: string;
    startsAt: string;
    endsAt: string;
    daysRemaining: number;
    scoreReward: number;
  }>;
};
```

프론트 메모:
- `todayEpisode`가 있으면 오늘의 사건 등록 CTA 상태를 바꿀 수 있다.
- `availableEpisodeCount`, `canStartMatch`로 매칭 가능 CTA 또는 안내 팝업을 제어할 수 있다.
- 푸시 알림 자체를 등록/조회하는 API는 현재 Swagger에 없다.

### 6. 오늘의 사건 등록

기능명세:
- 사건 제목 AI 생성/수정 가능
- 내용 입력
- 날짜 입력
- 등록 후 링으로 이동할지 나중에 할지 팝업

API:

| 용도 | Method | Path |
| --- | --- | --- |
| AI 제목 생성 | `POST` | `/api/v1/episodes/title-suggestions` |
| 에피소드 생성 | `POST` | `/api/v1/episodes` |
| 매칭 가능 이벤트 확인 | `GET` | `/api/v1/ring/events` 또는 `/api/v1/home` |

프론트 메모:
- 에피소드 생성 응답의 `canStartMatch`가 true면 “매치 하러 링 넘어가기 / 나중에 하기” 팝업을 띄울 수 있다.
- 생성 응답의 `availableEpisodeCount`는 매칭 가능 조건 안내에 활용 가능하다.

### 7. 링

기능명세:
- 현재 진행 가능한 매칭 리스트
- 앞으로 진행 가능한 매칭 리스트
- 월간 챔피언 리그
- 연간 챔피언 리그

API:

| 용도 | Method | Path |
| --- | --- | --- |
| 링 이벤트 목록 | `GET` | `/api/v1/ring/events` |
| 링 세션 시작 | `POST` | `/api/v1/ring/sessions` |
| 링 세션 조회 | `GET` | `/api/v1/ring/sessions/{sessionId}` |
| 라운드 승자 선택 | `POST` | `/api/v1/ring/sessions/{sessionId}/rounds/{roundNo}/result` |

`RingEventResponse`

```ts
type RingEventResponse = {
  eventId: number;
  type: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  scoreReward: number;
  roundCount: number;
  participationStatus: string;
  sessionId?: number;
};
```

프론트 메모:
- `participationStatus`와 `sessionId`를 기준으로 “진행 가능 / 진행 중 / 완료 / 예정” UI를 나눌 수 있다.
- 월간/연간 리그는 `type` 값으로 구분될 가능성이 높다. 실제 enum 값 확인이 필요하다.

### 8. 에피소드 목록과 상세

기능명세 연결:
- 랭킹 리스트
- 기록실 검색
- 상세 내용

API:

| 용도 | Method | Path | Query |
| --- | --- | --- | --- |
| 에피소드 목록 | `GET` | `/api/v1/episodes` | `status`, `size`, `cursor` |
| 에피소드 상세 | `GET` | `/api/v1/episodes/{episodeId}` | 없음 |

`EpisodeListItemResponse`

```ts
type EpisodeListItemResponse = {
  episodeId: number;
  title: string;
  contentPreview: string;
  episodeDate: string;
  status: string;
  rankingPresent: boolean;
  titleScore: number;
  currentTitleId: number;
  matchedAt?: string;
  createdAt: string;
};
```

프론트 메모:
- 목록은 cursor pagination이다. `nextCursor`, `hasNext`를 사용한다.
- Swagger 기준 검색어 query가 없다. 기능명세의 제목/내용 기반 검색은 아직 API가 부족하다.
- `status` 필터 값 enum은 Swagger에 명시되어 있지 않아 백엔드 확인이 필요하다.

### 9. 랭킹

기능명세:
- 월간 챔피언
- 연간 챔피언
- 올타임 챔피언
- 검색바
- 랭킹 리스트
- 상세 내용

현재 연결 가능 API:
- `GET /api/v1/episodes`
- `GET /api/v1/episodes/{episodeId}`

프론트 메모:
- 전용 랭킹 API는 현재 Swagger에 없다.
- 에피소드 목록의 `rankingPresent`, `titleScore`, `currentTitleId`, `rankingVersion`으로 일부 화면을 구성할 수는 있지만 월간/연간/올타임 챔피언을 안정적으로 구분하기에는 정보가 부족하다.
- 랭킹 화면 구현 전 백엔드에 아래 API 존재 여부 또는 추가 계획을 확인해야 한다.
  - 월간 챔피언 조회
  - 연간 챔피언 조회
  - 올타임 챔피언 조회
  - 랭킹 리스트 조회
  - 제목/내용 검색

### 10. 기록실

기능명세:
- 검색바
- 역대 매칭 기록 리스트
- 승/패 표시

현재 연결 가능 API:
- `GET /api/v1/episodes`
- `GET /api/v1/episodes/{episodeId}`
- `GET /api/v1/ring/sessions/{sessionId}`

프론트 메모:
- 역대 매칭 기록 전용 목록 API는 현재 Swagger에 없다.
- 승/패 이력을 리스트로 보여주려면 match history API가 필요해 보인다.
- 현재 API만으로는 특정 세션을 알고 있을 때 세션 상세를 조회하는 것은 가능하지만, 모든 과거 매칭을 페이지네이션으로 조회하는 흐름은 부족하다.

## 구현 우선순위 제안

1. 로그인 응답의 `onboardingCompleted`를 세션에 저장하고 로그인 후 분기 처리
2. 온보딩 에피소드 생성 API 연결
3. AI 제목 생성 API 연결
4. 온보딩 완료 API 연결
5. 홈 데이터 API 연결
6. 링 이벤트 목록과 세션 진행 API 연결
7. 랭킹/기록실은 백엔드 API 갭 확인 후 진행

## 백엔드 확인 필요 항목

- `CreateEpisodeRequest.content`가 실제로 필수인지 여부
- 온보딩에서 5개 미만 등록 후 종료할 때 `completeOnboarding`을 호출해도 되는지 여부
- 날짜를 월 단위로만 입력하는 케이스를 API가 어떻게 받을지
- `RingEventResponse.type`, `participationStatus`, ring session `status`의 enum 값
- 온보딩 배치전 이벤트와 일반 월간/연간 이벤트를 구분하는 방식
- 랭킹 전용 API 제공 여부
- 기록실의 역대 매칭 기록 및 승/패 API 제공 여부
- 제목/내용 검색 API 제공 여부
