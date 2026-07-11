# Frontend API Map

이 문서는 현재 백엔드 Swagger와 프론트 구현을 연결한 개발 기준 문서입니다.

- Swagger UI: https://hit-boating-premier-headed.trycloudflare.com/swagger-ui/index.html#/
- OpenAPI JSON: https://hit-boating-premier-headed.trycloudflare.com/v3/api-docs
- API version: `Team 6 API v1`
- 정리 기준일: 2026-07-11

## 공통 규칙

### Base URL

```env
AUTH_BACKEND_URL=https://hit-boating-premier-headed.trycloudflare.com
```

브라우저에서 백엔드를 직접 호출하지 않습니다. 인증 이후 API는 모두 서버 컴포넌트 또는 서버 액션에서 `lib/backend-api.ts`를 통해 호출합니다.

### 인증

```http
Authorization: Bearer {accessToken}
```

- Auth.js Credentials 로그인이 access/refresh token을 JWT 세션에 저장합니다.
- 만료 60초 전부터 Auth.js JWT 콜백이 access token을 갱신합니다.
- 공통 API 계층은 갱신된 세션의 access token을 사용합니다.
- 로그인, 회원가입, refresh를 제외한 기능 API는 인증이 필요합니다.

### 응답 형식

```ts
type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};
```

`lib/backend-api.ts`가 HTTP 오류, `success: false`, 비정상 envelope와 네트워크 오류를 공통 처리합니다. 조회 요청은 사용자별 최신 데이터를 위해 `cache: "no-store"`를 사용합니다.

## 연동 현황

| 기능 | Method | Path | 프론트 상태 |
| --- | --- | --- | --- |
| 회원가입 | `POST` | `/api/v1/auth/signup` | 연동 |
| 로그인 | `POST` | `/api/v1/auth/login` | 연동 |
| 토큰 갱신 | `POST` | `/api/v1/auth/refresh` | 연동 |
| 내 정보 | `GET` | `/api/v1/members/me` | 홈 분기 연동 |
| 온보딩 상태 | `GET` | `/api/v1/members/me/status` | 등록/배치 재개 연동 |
| 온보딩 완료 | `POST` | `/api/v1/members/me/onboarding/complete` | 10경기 완료 후 연동 |
| 홈 | `GET` | `/api/v1/home` | 연동 |
| 에피소드 생성 | `POST` | `/api/v1/episodes` | 연동 |
| 에피소드 목록 | `GET` | `/api/v1/episodes` | 온보딩 복구/PENDING 배치 연동 |
| 에피소드 상세 | `GET` | `/api/v1/episodes/{episodeId}` | 랭킹/기록 상세 연동 |
| 에피소드 검색 | `GET` | `/api/v1/episodes/search` | 랭킹 검색 연동 |
| 온보딩 배치 시작 | `POST` | `/api/v1/placements/onboarding` | 연동 |
| 추가 배치 시작 | `POST` | `/api/v1/episodes/{episodeId}/placement` | 연동 |
| 쇼 목록 | `GET` | `/api/v1/shows/available` | 홈/링 연동 |
| 쇼 시작 | `POST` | `/api/v1/shows/{showId}/sessions` | 연동 |
| 세션 진행 조회 | `GET` | `/api/v1/shows/sessions/{sessionId}` | 연동 |
| 매치 결과 확정 | `POST` | `/api/v1/matches/{matchId}/result` | 연동 |
| 링 통합 조회 | `GET` | `/api/v1/ring` | 직접 진행 매치/이벤트 연동 |
| 전체 랭킹 | `GET` | `/api/v1/rankings` | 목록/페이지 이동 연동 |
| 기록실 홈 | `GET` | `/api/v1/history` | 검색 포함 연동 |
| 매치 기록 | `GET` | `/api/v1/history/matches` | 검색 포함 연동 |
| 챔피언 기록 | `GET` | `/api/v1/history/champions` | 검색 포함 연동 |

다음 API는 현재 주요 UI 플로우에서 사용하지 않습니다.

- `POST /api/v1/matches`: 사용자가 후보를 직접 선택하는 화면을 제거했으므로 자동 배치/쇼 세션 API를 사용합니다.
- `DELETE /api/v1/matches/{matchId}`: 매치 취소 UI가 현재 디자인에 없습니다.
- `POST /api/v1/episodes/title-suggestions`: 제목을 직접 입력하는 UI로 변경되어 사용하지 않습니다.
- `/api/v1/sample/*`: 백엔드 샘플 API입니다.

## 사용자 플로우

### 로그인과 온보딩 판단

1. 로그인 응답의 `onboardingCompleted`를 Auth.js 세션에 저장합니다.
2. 미완료 사용자는 `/onboarding`으로 이동합니다.
3. `/members/me/status`의 `activePlacementSessionId`가 있으면 `/ring`에서 기존 배치전을 재개합니다.
4. 저장된 에피소드가 있으면 `/episodes` 결과로 작성 진행 상태를 복원합니다.

### 온보딩 배치전

1. 제목, 내용, 날짜를 직접 입력해 에피소드를 5회 생성합니다.
2. 마지막 생성 후 `/placements/onboarding`을 호출합니다.
3. 서버가 반환한 `sessionId`, `nextMatch`로 링을 표시합니다.
4. 승자 선택마다 `/matches/{matchId}/result`를 호출합니다.
5. `/shows/sessions/{sessionId}`를 재조회해 다음 경기를 표시합니다.
6. 10경기 완료 후에만 `/members/me/onboarding/complete`를 호출합니다.

온보딩 완료를 에피소드 등록 직후 처리하지 않는 이유는 로그인 분기와 실제 배치 진행 상태가 어긋나는 것을 방지하기 위해서입니다.

### 추가 에피소드 배치전

1. `/episodes`로 에피소드를 생성합니다.
2. 생성 응답의 `canStartMatch`가 true면 바로 시작/나중에 하기를 표시합니다.
3. 바로 시작 시 `/episodes/{episodeId}/placement`를 호출합니다.
4. 나중에 하기를 선택한 경우 홈에서 `status=PENDING` 에피소드를 조회해 다시 시작할 수 있습니다.
5. 5경기 완료 후 에피소드 상세와 랭킹을 재조회해 최종 점수와 전체 순위를 표시합니다.

### Weekly/Monthly Show

1. 홈과 링에서 `/shows/available`을 조회합니다.
2. `sessionId`가 있으면 기존 쇼를 재개합니다.
3. 없으면 `/shows/{showId}/sessions`로 시작합니다.
4. 배치전과 동일한 세션/결과 반복 프로토콜을 사용합니다.
5. Monthly 완료 화면은 mock 디자인을 따라 월간/연간 타이틀 벨트를 표시합니다.

Weekly 대진 구성과 Monthly 승자연전/연간 타이틀전 순서는 서버가 생성한 `nextMatch` 순서를 그대로 신뢰합니다.

### 링

- 승자 확정 중에는 입력을 잠가 중복 제출을 막습니다.
- 승패 확정마다 mock과 동일한 폭죽 파티클을 860ms 표시합니다.
- 파티클 재생과 API 호출은 병렬로 진행하고 둘 다 끝난 후 다음 경기로 전환합니다.
- `prefers-reduced-motion` 사용자는 파티클 지연을 생략합니다.
- URL의 `sessionId`, `flow`, `episodeId`로 새로고침과 직접 진입을 복구합니다.

### 랭킹

- 일반 목록은 `/rankings?page&size`를 사용합니다.
- 랭킹 API에 검색 조건이 없으므로 `/episodes/search`의 에피소드 ID와 전체 랭킹을 서버에서 교차합니다.
- 챔피언 기록의 `championTitle`을 월간/연간/올타임으로 정규화합니다.
- 올타임 챔피언은 전체 랭킹 1위를 사용합니다.
- 월간·연간 챔피언은 구분 가능한 실제 챔피언 기록이 있을 때만 표시합니다.
- 랭킹 카드는 `/episodes/{episodeId}` 상세로 이동합니다.

### 기록실

- 홈은 `/history?query`를 사용합니다.
- 전체보기는 `/history/champions`, `/history/matches`를 사용합니다.
- 검색어는 URL query로 유지합니다.
- 백엔드 응답에 이벤트 종류가 없으므로 배치/데뷔 필터는 제공하지 않습니다.
- 전체보기 API의 현재 최대 조회 수인 50개를 사용합니다.

## 프론트 보완 상태

백엔드 응답에 세션 완료 순위표와 챔피언 결과가 없으므로, 프론트는 진행 중 받은 서버 결과를 `localStorage`에 보조 저장합니다.

- 서버가 승패와 점수의 원본입니다.
- 저장소는 결과 화면과 새로고침 복구에만 사용합니다.
- 저장 실패가 경기 진행을 막지 않습니다.
- 세션 키는 `mme.session-history.v1.{sessionId}` 형식입니다.

Monthly 세션은 마지막 Royal Rumble 경기 승자를 월간 챔피언으로 표시합니다. 총 매치 수가 10 이상이고 별도 타이틀전 결과가 있을 때만 마지막 경기 승자를 연간 챔피언으로 표시합니다.

API에 점수, 전적 또는 챔피언 값이 없으면 임의의 `0점`, 전적 문구, 대체 챔피언을 만들지 않고 해당 정보를 렌더링하지 않습니다.

`GET /ring`의 이벤트만 있고 `/shows/available` 결과가 없는 경우에는 `eventId`를 `showId`로 사용해 시작을 시도합니다. 서버 ID 정책이 다르면 해당 카드는 API 오류 메시지를 표시합니다.

## 제외 범위

푸시 알림은 현재 주요 기능 범위에서 제외합니다. 알림 구독, 디바이스 토큰 등록, 알림 목록 API는 연결하지 않습니다.
