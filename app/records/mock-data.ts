export type EpisodeListItemResponse = {
  contentPreview: string;
  createdAt: string;
  currentTitleId: number;
  episodeDate: string;
  episodeId: number;
  matchedAt?: string;
  rankingPresent: boolean;
  status: string;
  title: string;
  titleScore: number;
};

export type ChampionRecord = EpisodeListItemResponse & {
  championedAt: string;
  scope: "ALL_TIME" | "ANNUAL" | "MONTHLY" | "PLACEMENT";
  scopeEnglishLabel: string;
  scopeLabel: string;
};

export type MatchEventType = "DEBUT" | "PLACEMENT";

export type MatchEpisodeSnapshot = Pick<
  EpisodeListItemResponse,
  "episodeDate" | "episodeId" | "title"
>;

export type MatchHistoryRecord = {
  completedAt: string;
  episodeA: MatchEpisodeSnapshot;
  episodeB: MatchEpisodeSnapshot;
  eventType: MatchEventType;
  matchId: number;
  memberId: number;
  roundNo: number;
  startedAt: string;
  status: "COMPLETED";
  winnerEpisodeId: number;
};

export const CHAMPION_RECORDS = [
  {
    championedAt: "2026-07-10T21:00:00Z",
    contentPreview: "최종 면접까지 갔지만 결과는 아쉽게 탈락.",
    createdAt: "2026-07-10T09:00:00Z",
    currentTitleId: 1,
    episodeDate: "2026-07-10",
    episodeId: 101,
    matchedAt: "2026-07-10T20:30:00Z",
    rankingPresent: true,
    scope: "ALL_TIME",
    scopeEnglishLabel: "All-Time Champion",
    scopeLabel: "올타임 챔피언",
    status: "MATCHED",
    title: "취업 최종 탈락",
    titleScore: 1450,
  },
  {
    championedAt: "2026-06-30T21:00:00Z",
    contentPreview: "야심차게 발표한 아이디어가 바로 반려됐다.",
    createdAt: "2026-06-28T09:00:00Z",
    currentTitleId: 2,
    episodeDate: "2026-06-28",
    episodeId: 102,
    matchedAt: "2026-06-30T20:30:00Z",
    rankingPresent: true,
    scope: "ANNUAL",
    scopeEnglishLabel: "Annual Champion",
    scopeLabel: "연간 챔피언",
    status: "MATCHED",
    title: "발표 3분 컷",
    titleScore: 1320,
  },
  {
    championedAt: "2026-07-08T21:00:00Z",
    contentPreview: "밤샘 작업 끝에 저장하지 않은 파일이 날아갔다.",
    createdAt: "2026-07-08T09:00:00Z",
    currentTitleId: 3,
    episodeDate: "2026-07-08",
    episodeId: 103,
    matchedAt: "2026-07-08T20:30:00Z",
    rankingPresent: true,
    scope: "MONTHLY",
    scopeEnglishLabel: "Monthly Champion",
    scopeLabel: "월간 챔피언",
    status: "MATCHED",
    title: "저장 안 한 최후",
    titleScore: 1260,
  },
  {
    championedAt: "2026-07-03T21:00:00Z",
    contentPreview: "첫 매치에서 강력한 제목으로 모두를 눌렀다.",
    createdAt: "2026-07-03T09:00:00Z",
    currentTitleId: 4,
    episodeDate: "2026-07-03",
    episodeId: 104,
    matchedAt: "2026-07-03T20:30:00Z",
    rankingPresent: true,
    scope: "PLACEMENT",
    scopeEnglishLabel: "Placement Champion",
    scopeLabel: "배치 챔피언",
    status: "MATCHED",
    title: "첫 출근 지각",
    titleScore: 1180,
  },
] as const satisfies readonly ChampionRecord[];

export const MATCH_HISTORY_RECORDS = [
  {
    completedAt: "2026-07-10T20:30:00Z",
    episodeA: {
      episodeDate: "2026-07-10",
      episodeId: 101,
      title: "취업 최종 탈락",
    },
    episodeB: {
      episodeDate: "2026-07-10",
      episodeId: 105,
      title: "면접장 길 잃음",
    },
    eventType: "PLACEMENT",
    matchId: 201,
    memberId: 1,
    roundNo: 1,
    startedAt: "2026-07-10T20:20:00Z",
    status: "COMPLETED",
    winnerEpisodeId: 101,
  },
  {
    completedAt: "2026-07-09T20:30:00Z",
    episodeA: {
      episodeDate: "2026-07-09",
      episodeId: 106,
      title: "회의실 착각",
    },
    episodeB: {
      episodeDate: "2026-07-09",
      episodeId: 107,
      title: "발표 3분 컷",
    },
    eventType: "PLACEMENT",
    matchId: 202,
    memberId: 1,
    roundNo: 2,
    startedAt: "2026-07-09T20:20:00Z",
    status: "COMPLETED",
    winnerEpisodeId: 107,
  },
  {
    completedAt: "2026-07-08T20:30:00Z",
    episodeA: {
      episodeDate: "2026-07-08",
      episodeId: 103,
      title: "저장 안 한 최후",
    },
    episodeB: {
      episodeDate: "2026-07-08",
      episodeId: 108,
      title: "버스 눈앞 출발",
    },
    eventType: "PLACEMENT",
    matchId: 203,
    memberId: 1,
    roundNo: 3,
    startedAt: "2026-07-08T20:20:00Z",
    status: "COMPLETED",
    winnerEpisodeId: 103,
  },
  {
    completedAt: "2026-07-06T20:30:00Z",
    episodeA: {
      episodeDate: "2026-07-06",
      episodeId: 109,
      title: "카드 두고 외출",
    },
    episodeB: {
      episodeDate: "2026-07-06",
      episodeId: 110,
      title: "택시 반대 방향",
    },
    eventType: "DEBUT",
    matchId: 204,
    memberId: 1,
    roundNo: 1,
    startedAt: "2026-07-06T20:20:00Z",
    status: "COMPLETED",
    winnerEpisodeId: 109,
  },
  {
    completedAt: "2026-07-05T20:30:00Z",
    episodeA: {
      episodeDate: "2026-07-05",
      episodeId: 111,
      title: "약속 날짜 착각",
    },
    episodeB: {
      episodeDate: "2026-07-05",
      episodeId: 112,
      title: "엘리베이터 고장",
    },
    eventType: "DEBUT",
    matchId: 205,
    memberId: 1,
    roundNo: 2,
    startedAt: "2026-07-05T20:20:00Z",
    status: "COMPLETED",
    winnerEpisodeId: 112,
  },
] as const satisfies readonly MatchHistoryRecord[];
