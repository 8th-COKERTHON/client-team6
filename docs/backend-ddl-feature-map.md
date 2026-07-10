# Backend DDL Feature Map

이 문서는 백엔드 SQL DDL을 `기능명세서.md`와 대조해 프론트 개발자가 참고할 수 있도록 정리한 매핑 문서다.

- 기능 기준 문서: `기능명세서.md`
- API 기준 문서: `docs/frontend-api-map.md`
- DDL 기준일: 2026-07-11 사용자 제공 SQL

## 테이블 역할 요약

| Table | 주요 역할 | 연결 기능 |
| --- | --- | --- |
| `members` | 회원 계정, 권한, 온보딩 완료 여부 | 회원가입, 로그인, 온보딩 분기 |
| `episodes` | 사용자가 등록한 사건 본문 | 온보딩 사건 등록, 오늘의 사건 등록, 랭킹/기록 상세 |
| `episode_rankings` | 에피소드별 현재 점수와 칭호 | 랭킹, 올타임 챔피언, 매칭 결과 반영 |
| `titles` | 점수 구간별 칭호 마스터 | 랭킹 칭호 표시 |
| `matching_events` | Weekly/Monthly/Yearly 등 링 이벤트 정의 | 홈 예정 일정, 링 매칭 리스트 |
| `ring_sessions` | 특정 회원이 특정 이벤트에 참여하는 진행 세션 | 링 입장, 라운드 진행, 세션 완료 |
| `matches` | 에피소드 A/B 대결 단위와 승자 | 온보딩 배치전, 오늘의 사건 매칭, 기록실 |
| `ranking_score_events` | 점수 변동 이벤트 로그 | 랭킹 점수 이력, 매칭 보상 추적 |
| `ai_recommendation_caches` | 회원/날짜별 AI 추천 결과 캐시 | 현재 기능명세에는 직접 대응 항목 없음 |

## 기능별 DDL 매핑

### 1. 회원가입 / 로그인

기능명세:

- 이메일 기반 회원가입
- 입력 항목: 이름, 이메일, 비밀번호
- 이메일 인증 없음
- 로그인 후 온보딩 여부에 따라 화면 분기

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `members` | `id` | 회원 식별자 |
| `members` | `email` | 로그인 ID |
| `members` | `password` | 비밀번호 해시 저장 대상 |
| `members` | `name` | 사용자 이름 |
| `members` | `role` | 권한 |
| `members` | `onboarding_completed_at` | 온보딩 완료 여부 판단 |
| `members` | `created_at`, `updated_at` | 회원 생성/수정 시각 |

프론트 참고:

- 로그인 후 `members.onboarding_completed_at`이 `NULL`이면 온보딩 화면으로 보내는 흐름이 자연스럽다.
- 현재 프론트는 로그인 응답에서 이름/이메일/온보딩 여부를 세션에 담는 방향이므로, 백엔드는 `members` 값을 기반으로 응답을 구성할 수 있다.

확인 필요:

- `members.email`에 `UNIQUE` 제약이 DDL에 없다. 이메일 회원가입이면 유니크 제약이 필요해 보인다.
- `id`가 `BIGINT NOT NULL`인데 `AUTO_INCREMENT`가 없다. 애플리케이션 레벨 ID 생성 전략인지 확인이 필요하다.
- refresh token 저장 테이블이 없다. JWT refresh token을 완전 stateless로 운영하는지, 폐기/로그아웃 처리를 어떻게 할지 확인이 필요하다.

### 2. 온보딩 - 사건 5개 등록

기능명세:

- 사용자가 겪은 안 좋은 일 5개를 등록
- 사건 제목은 AI 자동 생성 후 수정 가능, 필수
- 사건 내용은 사용자 입력, 선택 항목
- 사건 날짜는 필수, 기본값은 입력일
- 오래된 사건은 월만 입력 가능
- 5개를 다 적지 않아도 나갈 수 있음

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `episodes` | `member_id` | 작성 회원 |
| `episodes` | `title` | 사건 제목 |
| `episodes` | `content` | 사건 내용 |
| `episodes` | `episode_date` | 사건 발생일 |
| `episodes` | `status` | 매칭 가능 상태 |
| `episodes` | `matched_at` | 매칭 처리 시각으로 추정 |
| `episode_rankings` | `episode_id` | 에피소드별 랭킹 레코드 |
| `episode_rankings` | `title_score` | 초기/현재 점수 |
| `episode_rankings` | `current_title_id` | 현재 칭호 |
| `members` | `onboarding_completed_at` | 온보딩 종료 처리 |

프론트 참고:

- 온보딩 입력이 완료되면 `episodes`가 생성되고, 동시에 `episode_rankings` 초기 레코드가 생성되는 흐름으로 보인다.
- 5개 등록 완료 또는 중도 종료 시 `members.onboarding_completed_at`이 채워지는 구조로 해석할 수 있다.
- 프론트에서는 등록 개수와 완료 여부를 API 응답으로 받아 분기하는 것이 안전하다.

확인 필요:

- 기능명세는 `content`가 선택 항목인데 DDL은 `episodes.content TEXT NOT NULL`이다. 빈 문자열 저장 정책인지, `NULL` 허용으로 바꿀지 결정이 필요하다.
- 기능명세는 월만 입력 가능한 케이스가 있는데 DDL은 `episode_date DATE NOT NULL`이다. `YYYY-MM-01` 같은 대표일을 저장할지, 별도 정밀도 컬럼이 필요한지 확인이 필요하다.
- 온보딩에서 5개 미만으로 나간 경우 `onboarding_completed_at`을 채우는지, 아니면 미완료 상태로 유지하는지 정책 확인이 필요하다.
- AI 제목 생성 결과를 별도로 저장하는 테이블은 없다. 최종 선택된 제목만 `episodes.title`에 저장하는 정책으로 보인다.

### 3. 온보딩 배치전

기능명세:

- 온보딩 사건들끼리 순위 결정전 진행
- 5개 기준 리그전 총 10판
- 매치 순서는 등록 순서
- 리그전 1등은 올타임 챔피언

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `matches` | `member_id` | 매치를 진행하는 회원 |
| `matches` | `episode_a_id`, `episode_b_id` | 대결하는 두 사건 |
| `matches` | `winner_episode_id` | 선택된 승자 |
| `matches` | `status` | 매치 상태 |
| `matches` | `round_no` | 라운드 번호 |
| `matches` | `session_id` | 링 세션 연결 |
| `ring_sessions` | `total_rounds`, `completed_rounds` | 전체/완료 라운드 |
| `episode_rankings` | `title_score`, `current_title_id` | 결과 반영 점수/칭호 |
| `ranking_score_events` | `delta`, `source_type`, `source_id` | 점수 변경 로그 |

프론트 참고:

- 대결 UI는 `matches` 또는 `ring_sessions`의 현재 라운드 정보를 받아 카드 A/B를 보여주면 된다.
- 사용자가 더 힘든 사건을 선택하면 `winner_episode_id`가 채워지고, 점수 이벤트가 `ranking_score_events`에 기록되는 구조로 보인다.
- 5개보다 적게 등록한 경우 총 라운드 수는 조합 수로 줄어드는 정책이 필요하다.

확인 필요:

- 온보딩 배치전을 `matching_events`에 별도 이벤트로 생성하는지, 아니면 `matches.event_id = NULL`인 특수 매치로 처리하는지 불명확하다.
- `ring_sessions.event_id`는 `NOT NULL`인데 `matches.event_id`는 `NULL` 가능하다. 이벤트 없는 일반 매치/온보딩 매치를 세션으로 다룰 수 있는지 확인이 필요하다.
- "등록 순서 그대로"의 기준이 `episodes.created_at`인지, 온보딩 제출 순서를 따로 저장하는지 확인이 필요하다.

### 4. 홈

기능명세:

- 알림
- 오늘의 사건 등록
- 예정된 Weekly Shows, Monthly Royal Rumble 일정 표시

관련 테이블:

| 기능 | Table | 의미 |
| --- | --- | --- |
| 오늘의 사건 | `episodes` | 오늘 등록된 에피소드 여부 확인 |
| 예정 일정 | `matching_events` | 이벤트 기간, 상태, 보상, 라운드 수 |
| 매칭 가능 여부 | `episodes`, `matches`, `ring_sessions` | 등록된 에피소드 수와 진행 중 세션 |

프론트 참고:

- 홈의 예정 일정은 `matching_events.starts_at`, `ends_at`, `status`, `event_type`으로 구성 가능하다.
- 오늘의 사건 CTA 상태는 오늘 날짜의 `episodes` 존재 여부 또는 홈 API의 요약 응답이 필요하다.

확인 필요:

- 푸시 알림, 디바이스 토큰, 알림 읽음 여부에 해당하는 테이블은 없다.
- 홈 전용 요약 테이블은 없으므로 API에서 여러 테이블을 조합해 응답하는 구조로 보인다.

### 5. 오늘의 사건 등록과 대진 매칭

기능명세:

- 오늘의 사건 등록 후 링으로 이동할지 나중에 할지 팝업
- 오늘의 사건 vs 이전 사건 5개
- 이전 사건은 점수대별 랜덤 매칭
- 카드 대결에서 사용자가 더 힘든 사건을 선택

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `episodes` | `status` | 매칭 가능한 사건 필터 |
| `episode_rankings` | `title_score` | 점수대별 랜덤 매칭 기준 |
| `matches` | `episode_a_id`, `episode_b_id` | 오늘 사건과 이전 사건 매칭 |
| `matches` | `winner_episode_id`, `status` | 대결 결과 |
| `ranking_score_events` | `score_type`, `delta` | 승패에 따른 점수 변화 |

프론트 참고:

- 에피소드 생성 응답에서 `canStartMatch` 같은 플래그를 받으면 팝업 분기 구현이 쉽다.
- 대결 카드에서 본문 60자 제한과 전체 보기 팝업은 프론트 표현 정책이며, DDL에는 별도 영향이 없다.

확인 필요:

- "이전 사건 5개" 선정 방식이 `episode_rankings.title_score` 기준인지 확인이 필요하다.
- `episodes.matched_at`은 한 에피소드가 여러 번 매칭될 수 있는 구조와 충돌할 수 있다. 마지막 매칭 시각인지, 최초 매칭 시각인지 확인이 필요하다.

### 6. 링

기능명세:

- 현재 진행할 수 있는 매칭 리스트
- 앞으로 진행 가능한 매칭 리스트
- 월간 챔피언 리그
- 연간 챔피언 리그

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `matching_events` | `event_type` | Weekly/Monthly/Yearly 등 이벤트 종류 |
| `matching_events` | `starts_at`, `ends_at` | 이벤트 기간 |
| `matching_events` | `status` | 예정/진행/종료 상태 |
| `matching_events` | `score_reward` | 이벤트 보상 점수 |
| `matching_events` | `round_count` | 이벤트 라운드 수 |
| `ring_sessions` | `member_id`, `event_id` | 회원별 이벤트 참여 |
| `ring_sessions` | `status`, `completed_rounds` | 진행 상태 |
| `matches` | `session_id`, `round_no` | 세션 내 라운드 대결 |

프론트 참고:

- 링 리스트는 `matching_events`와 회원별 `ring_sessions` 상태를 조합해 "진행 가능", "진행 중", "완료", "예정"으로 나누는 형태가 적합하다.
- 이미 시작한 세션은 `ring_sessions.id`로 이어서 진행할 수 있다.

확인 필요:

- `matching_events.event_type`, `matching_events.status`, `ring_sessions.status`, `matches.status`의 enum 값이 DDL에는 없다.
- 월간 챔피언 리그와 연간 챔피언 리그가 같은 `matching_events` 테이블의 `event_type`으로 구분되는지 확인이 필요하다.
- 월간/연간 리그가 전역 이벤트인지, 회원별 개인 이벤트인지 불명확하다. DDL의 `ring_sessions.member_id`, `matches.member_id` 구조는 회원별 진행에 가깝다.

### 7. 랭킹

기능명세:

- 월간 챔피언
- 연간 챔피언
- 올타임 챔피언
- 제목/내용 검색
- 랭킹 리스트와 상세 내용

관련 테이블:

| 기능 | Table | 의미 |
| --- | --- | --- |
| 점수 기반 랭킹 | `episode_rankings` | 에피소드별 현재 점수 |
| 칭호 | `titles` | 점수 구간별 칭호 |
| 점수 이력 | `ranking_score_events` | 점수 변화 이벤트 로그 |
| 상세 내용 | `episodes` | 제목/본문/날짜 |

프론트 참고:

- 전체 랭킹 리스트는 `episode_rankings.title_score` 내림차순과 `episodes` 조인으로 구성 가능해 보인다.
- 올타임 챔피언은 현재 점수가 가장 높은 에피소드로 계산할 수 있을 가능성이 있다.
- 월간/연간 챔피언은 `ranking_score_events.event_key`나 `matching_events.event_type` 기반으로 계산해야 할 가능성이 있다.

확인 필요:

- 월간 챔피언, 연간 챔피언을 스냅샷으로 저장하는 테이블이 없다.
- `ranking_score_events.event_key`가 월간/연간 랭킹 기간을 표현하는 키인지 확인이 필요하다.
- `episode_rankings.current_title_id`에 `titles.id` FK가 선언되어 있지 않다.
- 제목/내용 검색을 위한 인덱스나 별도 검색 테이블이 없다.

### 8. 기록실

기능명세:

- 제목/내용 기반 검색
- 역대 매칭 기록 리스트
- 승/패 표시

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `matches` | `member_id` | 회원별 매칭 기록 |
| `matches` | `episode_a_id`, `episode_b_id` | 대결한 사건 |
| `matches` | `winner_episode_id` | 승패 계산 기준 |
| `matches` | `started_at`, `completed_at` | 진행 시각 |
| `ring_sessions` | `event_id`, `status` | 어떤 링 이벤트의 기록인지 |
| `episodes` | `title`, `content` | 검색/상세 표시 |

프론트 참고:

- 기록실 리스트는 `matches`를 기준으로 조회하고, 현재 사용자의 에피소드가 `winner_episode_id`와 일치하는지로 승/패를 표시할 수 있다.
- 검색은 `episodes.title`, `episodes.content` 대상으로 API가 제공되어야 한다.

확인 필요:

- 역대 매칭 기록 전용 조회 API가 없으면 프론트에서 필요한 페이지네이션/검색 UX 구현이 어렵다.
- 한 매치에 두 에피소드가 모두 같은 회원의 것인지, 이벤트 리그에서는 다른 회원의 에피소드와 매칭될 수도 있는지 확인이 필요하다.

### 9. AI 추천 캐시

관련 테이블:

| Table | Column | 의미 |
| --- | --- | --- |
| `ai_recommendation_caches` | `member_id` | 추천 대상 회원 |
| `ai_recommendation_caches` | `recommendation_date` | 추천 기준일 |
| `ai_recommendation_caches` | `content` | 추천 내용 |
| `ai_recommendation_caches` | `generated_at`, `expires_at` | 생성/만료 시각 |

프론트 참고:

- 현재 기능명세서에는 이 테이블과 직접 연결되는 화면이 없다.
- 홈의 AI 조언, 사건 작성 가이드, 제목 추천 캐시 등으로 확장될 가능성이 있다.

확인 필요:

- 이 테이블이 사건 제목 생성 캐시인지, 홈 추천 문구인지, 별도 AI 추천 기능인지 확인이 필요하다.

## DDL상 누락된 것으로 보이는 관계

현재 DDL에는 PK와 `episode_rankings.episode_id -> episodes.id` FK만 선언되어 있다. 실제 운영 DDL에 아래 제약이 포함되는지 확인이 필요하다.

| 예상 관계 | 이유 |
| --- | --- |
| `episodes.member_id -> members.id` | 에피소드 작성자 |
| `matches.event_id -> matching_events.id` | 이벤트 매치 |
| `matches.member_id -> members.id` | 회원별 매치 |
| `matches.episode_a_id -> episodes.id` | 대결 에피소드 A |
| `matches.episode_b_id -> episodes.id` | 대결 에피소드 B |
| `matches.winner_episode_id -> episodes.id` | 승자 에피소드 |
| `matches.session_id -> ring_sessions.id` | 링 세션 라운드 |
| `ranking_score_events.episode_id -> episodes.id` | 점수 변경 대상 |
| `ranking_score_events.source_id` | `source_type`에 따라 `matches` 등과 연결될 가능성 |
| `episode_rankings.current_title_id -> titles.id` | 현재 칭호 |
| `ai_recommendation_caches.member_id -> members.id` | 추천 대상 회원 |
| `ring_sessions.event_id -> matching_events.id` | 참여 이벤트 |
| `ring_sessions.member_id -> members.id` | 참여 회원 |

## 프론트 구현 관점의 핵심 결론

1. 회원/온보딩 분기는 `members.onboarding_completed_at`을 기준으로 잡으면 된다.
2. 에피소드 등록 화면은 `episodes` 생성 API와 1:1로 맞는다.
3. 매칭 진행 화면은 `ring_sessions`와 `matches`를 중심으로 설계하면 된다.
4. 랭킹 화면은 `episode_rankings`, `titles`, `ranking_score_events`가 핵심이다.
5. 기록실은 `matches` 기반으로 가능해 보이지만, 검색/페이지네이션 API가 별도로 필요하다.
6. 알림, 월간/연간 챔피언 스냅샷, 월 단위 날짜 입력, refresh token 관리, 검색 인덱스는 DDL만으로는 지원 방식이 불명확하다.

## 백엔드에 물어볼 질문

1. `members.email`은 유니크 제약을 추가할 예정인가?
2. 각 테이블의 `id`는 DB `AUTO_INCREMENT`가 아니라 애플리케이션에서 생성하는가?
3. `episodes.content`는 기능명세처럼 선택 항목인가, 아니면 빈 문자열을 저장하는 필수 항목인가?
4. 월만 입력 가능한 사건 날짜는 `episode_date`에 어떤 값으로 저장하는가?
5. 온보딩을 5개 미만으로 종료해도 `members.onboarding_completed_at`을 채우는가?
6. 온보딩 배치전은 `matching_events`의 이벤트로 관리하는가, 아니면 `matches.event_id = NULL`로 처리하는가?
7. `matching_events.event_type/status`, `ring_sessions.status`, `matches.status`, `ranking_score_events.score_type/source_type`의 enum 값은 무엇인가?
8. 월간/연간 챔피언은 별도 테이블 없이 이벤트/점수 로그에서 계산하는가?
9. `ranking_score_events.event_key`의 포맷과 의미는 무엇인가?
10. `episodes.matched_at`은 마지막 매칭 시각인가, 최초 매칭 시각인가?
11. 푸시 알림과 디바이스 토큰 저장은 이번 범위에서 제외된 것인가?
12. 제목/내용 검색은 DB full-text/index 없이 API 레벨에서 처리할 예정인가?
13. `ai_recommendation_caches`는 어떤 화면/기능에서 사용할 예정인가?
14. DDL에 FK/인덱스가 대부분 생략되어 있는데 실제 마이그레이션에는 추가되는가?
