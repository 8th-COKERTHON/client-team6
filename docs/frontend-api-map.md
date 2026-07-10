# Frontend API Map

이 문서는 `기능명세서.md`와 백엔드 Swagger 문서를 프론트 개발 기준으로 연결한 참고 문서입니다.

- Swagger UI: https://brands-matrix-sufficient-transcription.trycloudflare.com/swagger-ui/index.html#/
- OpenAPI JSON: https://brands-matrix-sufficient-transcription.trycloudflare.com/v3/api-docs
- API version: `Team 6 API v1`
- 정리 기준일: 2026-07-11

## 업데이트 메모

2026-07-11 기준 Swagger에서 링 관련 API가 이전 문서와 달라졌습니다.

- 기존 문서에 있던 `/api/v1/ring/events`, `/api/v1/ring/sessions`, `/rounds/{roundNo}/result` 계열 API는 현재 Swagger에 없습니다.
- 현재 링 화면은 `GET /api/v1/ring` 하나로 조회합니다.
- 대결 시작/취소는 `POST /api/v1/matches`, `DELETE /api/v1/matches/{matchId}`로 분리되어 있습니다.
- 승자 선택, 라운드 결과 제출, 매치 완료, 매칭 기록 목록, 랭킹 전용 API는 현재 Swagger에 없습니다.

## 공통 규칙

### Base URL

현재 인증 코드에서는 아래 환경변수를 사용합니다.

- `AUTH_BACKEND_URL`: 백엔드 기본 URL. 예: `https://brands-matrix-sufficient-transcription.trycloudflare.com`
- `AUTH_BACKEND_LOGIN_URL`: 로그인 API 전체 URL을 직접 지정할 때 사용
- `AUTH_BACKEND_SIGNUP_URL`: 회원가입 API 전체 URL을 직접 지정할 때 사용

추후 일반 API도 서버 액션 또는 route handler에서 호출하는 방식이면 `AUTH_BACKEND_URL`을 공통 base URL로 재사용하는 방향이 자연스럽습니다. 클라이언트 컴포넌트에서 직접 호출해야 하는 API가 생기면 별도 `NEXT_PUBLIC_` 환경변수 필요 여부를 검토합니다.

### Response Envelope

대부분의 API 응답은 아래 형태를 따릅니다.

```ts
type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};
```

### Auth

Swagger 전역 보안 스키마는 Bearer JWT입니다.

```http
Authorization: Bearer {accessToken}
```

로그인, 회원가입, refresh를 제외한 API는 기본적으로 인증이 필요하다고 보고 구현합니다.

## 현재 Swagger 경로 요약

| 용도 | Method | Path |
| --- | --- | --- |
| 회원가입 | `POST` | `/api/v1/auth/signup` |
| 로그인 | `POST` | `/api/v1/auth/login` |
| 토큰 갱신 | `POST` | `/api/v1/auth/refresh` |
| 내 정보 조회 | `GET` | `/api/v1/members/me` |
| 온보딩 완료 | `POST` | `/api/v1/members/me/onboarding/complete` |
| 홈 조회 | `GET` | `/api/v1/home` |
| 에피소드 목록 | `GET` | `/api/v1/episodes` |
| 에피소드 등록 | `POST` | `/api/v1/episodes` |
| 에피소드 상세 | `GET` | `/api/v1/episodes/{episodeId}` |
| 에피소드 제목 제안 | `POST` | `/api/v1/episodes/title-suggestions` |
| 링 화면 조회 | `GET` | `/api/v1/ring` |
| 대결 시작 | `POST` | `/api/v1/matches` |
| 대결 취소 | `DELETE` | `/api/v1/matches/{matchId}` |

`/api/v1/sample/public`, `/api/v1/sample/me`는 샘플 API로 보고 프론트 기능 매핑에서는 제외합니다.

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
  email: string; // min 1
  password: string; // min 8, max 72
  name: string; // max 50
};
```

프론트 메모:

- 현재 `app/(auth)/signup/actions.ts`에서 이미 연동되어 있습니다.
- 성공 후 로그인 페이지 이동 또는 자동 로그인 정책은 UX 결정이 필요합니다.

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

`MemberMeResponse`

```ts
type MemberMeResponse = {
  memberId: number;
  name: string;
  email: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
};
```

프론트 메모:

- 로그인 직후 온보딩 노출 여부는 `onboardingCompleted`로 판단합니다.
- 세션/JWT에는 `accessToken`, `refreshToken`, `name`, `email`, `onboardingCompleted`, `onboardingCompletedAt`을 담는 방향이 현재 API와 맞습니다.
- refresh token 재발급 플로우는 아직 프론트 구현 필요 항목입니다.

### 3. 온보딩 - 에피소드 등록

기능명세:

- 사용자가 겪은 안 좋은 일 5개를 등록합니다.
- 사건 제목: AI 자동 생성, 사용자가 수정 가능, 필수
- 사건 내용: 사용자가 자유 입력, 명세상 선택 항목
- 날짜: 기본값은 입력 날짜, 사용자가 수정 가능, 필수
- 5개를 모두 적지 않아도 나갈 수 있어야 합니다.

API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| AI 제목 생성 | `POST` | `/api/v1/episodes/title-suggestions` | `TitleSuggestionRequest` | `ApiResponse<TitleSuggestionResponse>` |
| 에피소드 생성 | `POST` | `/api/v1/episodes` | `CreateEpisodeRequest` | `ApiResponse<CreateEpisodeResponse>` |
| 온보딩 완료 처리 | `POST` | `/api/v1/members/me/onboarding/complete` | 없음 | `ApiResponse<MemberMeResponse>` |

`TitleSuggestionRequest`

```ts
type TitleSuggestionRequest = {
  content: string; // required, max 5000
};
```

`TitleSuggestionResponse`

```ts
type TitleSuggestionResponse = {
  title: string;
};
```

`CreateEpisodeRequest`

```ts
type CreateEpisodeRequest = {
  title: string; // required, max 150
  content: string; // required, max 5000
  episodeDate: string; // required, YYYY-MM-DD
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

- 현재 Swagger 기준 `CreateEpisodeRequest.content`는 required입니다. 기능명세는 선택 항목이라고 되어 있어 백엔드와 정책 확인이 필요합니다.
- 기능명세는 날짜에 월만 입력 가능한 예외를 언급하지만, Swagger는 `episodeDate`를 `date` 형식으로 요구합니다.
- 5개 등록 후 또는 사용자가 중도 종료할 때 `POST /api/v1/members/me/onboarding/complete` 호출 여부를 정책으로 확정해야 합니다.

### 4. 온보딩 배치전

기능명세:

- 5개 사건에 대한 순위 결정전
- 리그전 총 10판
- 매치 순서 = 등록 순서
- 리그전 1등 = 올타임 챔피언

현재 Swagger에서 연결 가능한 API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| 링 화면 조회 | `GET` | `/api/v1/ring` | 없음 | `ApiResponse<RingResponse>` |
| 대결 시작 | `POST` | `/api/v1/matches` | `MatchRequestDto` | `ApiResponse<number>` |
| 대결 취소 | `DELETE` | `/api/v1/matches/{matchId}` | path `matchId` | `ApiResponse<void>` |

프론트 메모:

- 현재 명세만으로는 온보딩 리그전 10판을 완결할 수 없습니다.
- `POST /api/v1/matches`는 두 에피소드 ID로 대결을 생성하고 `matchId`를 반환합니다.
- 승자 선택, 점수 반영, 다음 라운드 진행, 매치 완료 API가 Swagger에 없습니다.
- 온보딩 배치전 UI 구현 전에 백엔드가 승자 제출 API를 제공할지 확인해야 합니다.

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

- `todayEpisode`가 있으면 오늘의 사건 등록 CTA 상태를 바꿀 수 있습니다.
- `availableEpisodeCount`, `canStartMatch`로 매칭 가능 CTA 또는 안내 팝업을 제어할 수 있습니다.
- Swagger 설명상 현재 구현에서는 `canStartMatch`가 `false`, `upcomingEvents`가 빈 배열입니다.
- 푸시 알림 등록/조회 API는 현재 Swagger에 없습니다.

### 6. 오늘의 사건 등록과 대결 시작

기능명세:

- 사건 제목 AI 생성/수정 가능
- 내용 입력
- 날짜 입력
- 등록 후 링으로 이동할지 나중에 할지 팝업
- 오늘의 사건 vs 이전 사건 5개 매칭

API:

| 용도 | Method | Path |
| --- | --- | --- |
| AI 제목 생성 | `POST` | `/api/v1/episodes/title-suggestions` |
| 에피소드 생성 | `POST` | `/api/v1/episodes` |
| 링 상태 확인 | `GET` | `/api/v1/ring` |
| 대결 시작 | `POST` | `/api/v1/matches` |
| 대결 취소 | `DELETE` | `/api/v1/matches/{matchId}` |

`MatchRequestDto`

```ts
type MatchRequestDto = {
  episodeAId: number;
  episodeBId: number;
};
```

프론트 메모:

- 에피소드 생성 응답의 `canStartMatch`가 true면 “매치 하러 링 넘어가기 / 나중에 하기” 팝업을 띄울 수 있습니다.
- 링으로 이동한 뒤 `GET /api/v1/ring`의 `availableEpisodes`로 선택 가능한 사건 목록을 구성할 수 있습니다.
- 현재 Swagger에는 “점수대별 랜덤 매칭”을 서버에 요청하는 API가 명확히 없습니다.
- 현재 Swagger에는 승자 제출 API가 없으므로 대결 완료 플로우는 구현 대기입니다.

### 7. 링

기능명세:

- 현재 진행 가능한 매칭 리스트
- 앞으로 진행 가능한 매칭 리스트
- 월간 챔피언 리그
- 연간 챔피언 리그

API:

| 용도 | Method | Path | Request | Response |
| --- | --- | --- | --- | --- |
| 링 화면 조회 | `GET` | `/api/v1/ring` | 없음 | `ApiResponse<RingResponse>` |
| 대결 시작 | `POST` | `/api/v1/matches` | `MatchRequestDto` | `ApiResponse<number>` |
| 대결 취소 | `DELETE` | `/api/v1/matches/{matchId}` | path `matchId` | `ApiResponse<void>` |

`RingResponse`

```ts
type RingResponse = {
  activeQuestion: unknown;
  availableEpisodes: AvailableEpisodeDto[];
  activeMatch?: ActiveMatchDto;
  activeEvents: ActiveEventDto[];
};

type AvailableEpisodeDto = {
  episodeId: number;
  title: string;
  episodeDate: string;
};

type ActiveMatchDto = {
  matchId: number;
  episodeA: EpisodeCardDto;
  episodeB: EpisodeCardDto;
  status: string;
  currentRound: number;
  totalRounds: number;
};

type EpisodeCardDto = {
  episodeId: number;
  title: string;
  content: string;
  episodeDate: string;
};

type ActiveEventDto = {
  eventId: number;
  type: string;
  title: string;
  displayDate: string;
  scoreReward: number;
};
```

프론트 메모:

- 링 메인 화면은 `activeQuestion`, `availableEpisodes`, `activeMatch`, `activeEvents`를 한 번에 받아 구성합니다.
- `activeMatch`가 있으면 진행 중 대결 카드 UI를 보여줄 수 있습니다.
- `activeEvents`는 월간/연간 등 진행 가능한 이벤트 리스트로 보입니다.
- `activeQuestion`은 Swagger schema가 비어 있어 실제 응답 구조 확인이 필요합니다.
- `currentRound`, `totalRounds`가 있지만, 라운드 결과 제출 API가 없습니다.

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

`EpisodeDetailResponse`

```ts
type EpisodeDetailResponse = {
  episodeId: number;
  memberId: number;
  title: string;
  content: string;
  episodeDate: string;
  status: string;
  matchedAt?: string;
  rankingPresent: boolean;
  titleScore: number;
  currentTitleId: number;
  rankingVersion: number;
  createdAt: string;
  updatedAt: string;
};
```

프론트 메모:

- 목록은 cursor pagination입니다. `nextCursor`, `hasNext`를 사용합니다.
- `status` 필터 값 enum은 Swagger에 명시되어 있지 않습니다.
- Swagger 기준 검색어 query가 없습니다. 기능명세의 제목/내용 기반 검색은 아직 API가 부족합니다.

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

- 전용 랭킹 API는 현재 Swagger에 없습니다.
- 에피소드 목록/상세의 `rankingPresent`, `titleScore`, `currentTitleId`, `rankingVersion`으로 일부 표시를 구성할 수는 있습니다.
- 월간/연간/올타임 챔피언을 안정적으로 구분하기에는 정보가 부족합니다.

### 10. 기록실

기능명세:

- 검색바
- 역대 매칭 기록 리스트
- 승/패 표시

현재 연결 가능 API:

- `GET /api/v1/episodes`
- `GET /api/v1/episodes/{episodeId}`
- `GET /api/v1/ring`의 `activeMatch`

프론트 메모:

- 역대 매칭 기록 전용 목록 API는 현재 Swagger에 없습니다.
- 승/패 이력을 리스트로 보여주려면 match history API가 필요합니다.
- `POST /api/v1/matches`와 `DELETE /api/v1/matches/{matchId}`만으로는 기록실을 구현할 수 없습니다.

## 구현 우선순위 제안

1. 로그인 응답의 `onboardingCompleted`를 세션에 저장하고 로그인 후 분기 처리
2. 온보딩 에피소드 생성 API 연결
3. AI 제목 생성 API 연결
4. 온보딩 완료 API 연결
5. 홈 데이터 API 연결
6. 링 화면 조회 `GET /api/v1/ring` 연결
7. 대결 시작/취소 `POST /api/v1/matches`, `DELETE /api/v1/matches/{matchId}` 연결
8. 승자 제출/매치 완료 API가 추가되면 대결 완료 플로우 연결
9. 랭킹/기록실은 백엔드 API 갭 확인 후 진행

## 백엔드 확인 필요 항목

- `CreateEpisodeRequest.content`가 실제로 필수인지 여부
- 온보딩에서 5개 미만 등록 후 종료할 때 `completeOnboarding`을 호출해도 되는지 여부
- 날짜를 월 단위로만 입력하는 케이스를 API가 어떻게 받을지
- `GET /api/v1/ring`의 `activeQuestion` 실제 응답 구조
- `ActiveEventDto.type`, `ActiveMatchDto.status`, episode `status`의 enum 값
- 대결 승자 선택/결과 제출 API 제공 여부
- 대결 완료 후 점수 반영과 다음 라운드 진행 방식
- 온보딩 배치전 10판을 현재 matches API로 어떻게 표현하는지
- `GET /api/v1/home`의 `canStartMatch=false`, `upcomingEvents=[]`가 임시 구현인지 여부
- 점수대별 랜덤 매칭을 서버가 해주는 API 제공 여부
- 랭킹 전용 API 제공 여부
- 기록실의 역대 매칭 기록 및 승/패 API 제공 여부
- 제목/내용 검색 API 제공 여부
