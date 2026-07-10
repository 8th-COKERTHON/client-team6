export const MOCK_FLOW_VERSION = 1;
export const MOCK_STORAGE_KEY = "mme.mock.flow.v1";

export type MockEpisodeDraft = {
  content: string;
  date: string;
  title: string;
};

export type MockEpisode = {
  content: string;
  createdAt: string;
  episodeDate: string;
  id: number;
  losses: number;
  origin: "USER" | "COMMUNITY";
  score: number;
  title: string;
  wins: number;
};

export type MockSessionType =
  | "ONBOARDING"
  | "DEBUT"
  | "WEEKLY"
  | "MONTHLY";

export type MockMatchPhase =
  | "LEAGUE"
  | "DEBUT"
  | "WEEKLY_RECENT"
  | "WEEKLY_RIVAL"
  | "MONTHLY_RUMBLE"
  | "ANNUAL_TITLE";

export type MockMatch = {
  completedAt?: string;
  episodeAId: number;
  episodeBId: number;
  id: number;
  phase: MockMatchPhase;
  round: number;
  status: "IN_PROGRESS" | "COMPLETED";
  winnerEpisodeId?: number;
};

export type MockSession = {
  annualChampionId?: number;
  completedAt?: string;
  createdAt: string;
  currentMatchIndex: number;
  id: number;
  matches: MockMatch[];
  monthlyChampionId?: number;
  participantIds: number[];
  status: "IN_PROGRESS" | "COMPLETED";
  title: string;
  totalRounds: number;
  type: MockSessionType;
  winnerEpisodeId?: number;
};

export type MockChampions = {
  allTimeEpisodeId?: number;
  annualEpisodeId?: number;
  monthlyEpisodeId?: number;
};

export type MockFlowState = {
  activeSessionId: number | null;
  champions: MockChampions;
  episodes: MockEpisode[];
  lastCompletedSessionId: number | null;
  nextEpisodeId: number;
  nextMatchId: number;
  nextSessionId: number;
  onboardingComplete: boolean;
  onboardingDrafts: MockEpisodeDraft[];
  sessions: MockSession[];
  version: number;
};

type MatchPair = {
  episodeAId: number;
  episodeBId: number;
  phase: MockMatchPhase;
};

const INITIAL_SCORE = 1000;
const WIN_SCORE_DELTA = 100;
const ONBOARDING_EPISODE_COUNT = 5;

const SAMPLE_ONBOARDING_DRAFTS = [
  {
    content:
      "최종 면접 결과를 기다렸지만 아쉽게 탈락했다. 오래 준비한 만큼 자신감이 크게 흔들렸다.",
    title: "취업 최종 탈락",
  },
  {
    content:
      "좋은 분위기라고 생각했던 소개팅 이후 갑자기 연락이 끊겼다. 이유를 몰라 더 오래 신경 쓰였다.",
    title: "세 번째 소개팅 연락 두절",
  },
  {
    content:
      "밤새 만든 발표 자료를 저장하지 않아 마지막 순간에 전부 다시 만들었다.",
    title: "저장 안 한 최후",
  },
  {
    content:
      "중요한 회의실을 잘못 찾아가 모두가 기다리는 자리에서 뒤늦게 들어갔다.",
    title: "회의실 착각",
  },
  {
    content:
      "첫 출근 날 알람을 잘못 맞춰 지각했고 팀 전체 앞에서 사과부터 했다.",
    title: "첫 출근 지각",
  },
] as const;

export function createInitialMockState(): MockFlowState {
  const communityEpisodes = createCommunityEpisodes();
  const legacyChampionId = communityEpisodes.at(-1)?.id;

  return {
    activeSessionId: null,
    champions: {
      annualEpisodeId: legacyChampionId,
      monthlyEpisodeId: legacyChampionId,
    },
    episodes: communityEpisodes,
    lastCompletedSessionId: null,
    nextEpisodeId: 1,
    nextMatchId: 1,
    nextSessionId: 1,
    onboardingComplete: false,
    onboardingDrafts: createEmptyOnboardingDrafts(),
    sessions: [],
    version: MOCK_FLOW_VERSION,
  };
}

export function restoreMockState(rawValue: string | null) {
  if (!rawValue) {
    return createInitialMockState();
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isMockFlowState(parsed)) {
      return createInitialMockState();
    }

    return parsed;
  } catch {
    return createInitialMockState();
  }
}

export function updateOnboardingDraft(
  state: MockFlowState,
  index: number,
  patch: Partial<MockEpisodeDraft>,
): MockFlowState {
  return {
    ...state,
    onboardingDrafts: state.onboardingDrafts.map((draft, draftIndex) =>
      draftIndex === index ? { ...draft, ...patch } : draft,
    ),
  };
}

export function fillSampleOnboardingDrafts(
  state: MockFlowState,
): MockFlowState {
  const date = formatDateForDisplay(new Date());

  return {
    ...state,
    onboardingDrafts: SAMPLE_ONBOARDING_DRAFTS.map((draft) => ({
      ...draft,
      date,
    })),
  };
}

export function createOnboardingLeague(state: MockFlowState): MockFlowState {
  if (
    state.onboardingComplete ||
    state.onboardingDrafts.length !== ONBOARDING_EPISODE_COUNT ||
    !state.onboardingDrafts.every(isDraftReady)
  ) {
    return state;
  }

  let nextEpisodeId = state.nextEpisodeId;
  const now = new Date().toISOString();
  const episodes = state.onboardingDrafts.map((draft, index): MockEpisode => ({
    content: draft.content.trim(),
    createdAt: new Date(Date.now() + index).toISOString(),
    episodeDate: normalizeEpisodeDate(draft.date),
    id: nextEpisodeId++,
    losses: 0,
    origin: "USER",
    score: INITIAL_SCORE,
    title: draft.title.trim(),
    wins: 0,
  }));
  const pairs: MatchPair[] = [];

  for (let left = 0; left < episodes.length; left += 1) {
    for (let right = left + 1; right < episodes.length; right += 1) {
      pairs.push({
        episodeAId: episodes[left].id,
        episodeBId: episodes[right].id,
        phase: "LEAGUE",
      });
    }
  }

  const nextState = {
    ...state,
    episodes: [...state.episodes, ...episodes],
    nextEpisodeId,
    onboardingComplete: true,
  };

  return createFixedSession(nextState, {
    pairs,
    participantIds: episodes.map((episode) => episode.id),
    title: "온보딩 배치 리그",
    type: "ONBOARDING",
  }, now);
}

export function createDebutSession(
  state: MockFlowState,
  draft: MockEpisodeDraft,
): MockFlowState {
  if (state.activeSessionId !== null || !isDraftReady(draft)) {
    return state;
  }

  const now = new Date().toISOString();
  const episode: MockEpisode = {
    content: draft.content.trim(),
    createdAt: now,
    episodeDate: normalizeEpisodeDate(draft.date),
    id: state.nextEpisodeId,
    losses: 0,
    origin: "USER",
    score: INITIAL_SCORE,
    title: draft.title.trim(),
    wins: 0,
  };
  const userOpponents = getClosestScoreEpisodes(
    state.episodes.filter((item) => item.origin === "USER"),
    episode.score,
    5,
  );
  const fallbackOpponents = getClosestScoreEpisodes(
    state.episodes.filter((item) => item.origin === "COMMUNITY"),
    episode.score,
    5 - userOpponents.length,
  );
  const opponents = [...userOpponents, ...fallbackOpponents];
  const pairs = opponents.map((opponent): MatchPair => ({
    episodeAId: episode.id,
    episodeBId: opponent.id,
    phase: "DEBUT",
  }));
  const nextState = {
    ...state,
    episodes: [...state.episodes, episode],
    nextEpisodeId: state.nextEpisodeId + 1,
  };

  return createFixedSession(nextState, {
    pairs,
    participantIds: [episode.id, ...opponents.map((opponent) => opponent.id)],
    title: `${episode.title} 배치전`,
    type: "DEBUT",
  }, now);
}

export function createWeeklySession(state: MockFlowState): MockFlowState {
  if (state.activeSessionId !== null || !state.onboardingComplete) {
    return state;
  }

  const userEpisodes = state.episodes
    .filter((episode) => episode.origin === "USER")
    .sort(compareCreatedAt);
  const latestEpisode = userEpisodes.at(-1);

  if (!latestEpisode) {
    return state;
  }

  const fallbackEpisodes = state.episodes
    .filter((episode) => episode.id !== latestEpisode.id)
    .sort(compareCreatedAt);
  const oldEpisodes = uniqueEpisodes([
    ...userEpisodes.filter((episode) => episode.id !== latestEpisode.id),
    ...fallbackEpisodes,
  ]).slice(0, 3);
  const recentPairs: MatchPair[] = oldEpisodes.map((episode) => ({
    episodeAId: latestEpisode.id,
    episodeBId: episode.id,
    phase: "WEEKLY_RECENT",
  }));
  const rivalPool = userEpisodes.length >= 4 ? userEpisodes : state.episodes;
  const rivalPairs = getClosestRivalPairs(rivalPool, recentPairs, 2);
  const pairs = [...recentPairs, ...rivalPairs];

  if (pairs.length !== 5) {
    return state;
  }

  return createFixedSession(state, {
    pairs,
    participantIds: uniqueNumbers(
      pairs.flatMap((pair) => [pair.episodeAId, pair.episodeBId]),
    ),
    title: "Weekly Show",
    type: "WEEKLY",
  });
}

export function createMonthlySession(state: MockFlowState): MockFlowState {
  if (state.activeSessionId !== null || !state.onboardingComplete) {
    return state;
  }

  const participants = getRankedEpisodes(state.episodes)
    .filter((episode) => episode.id !== state.champions.annualEpisodeId)
    .slice(0, 10)
    .reverse();

  if (participants.length < 10) {
    return state;
  }

  const sessionId = state.nextSessionId;
  const firstMatch: MockMatch = {
    episodeAId: participants[0].id,
    episodeBId: participants[1].id,
    id: state.nextMatchId,
    phase: "MONTHLY_RUMBLE",
    round: 1,
    status: "IN_PROGRESS",
  };
  const session: MockSession = {
    createdAt: new Date().toISOString(),
    currentMatchIndex: 0,
    id: sessionId,
    matches: [firstMatch],
    participantIds: participants.map((episode) => episode.id),
    status: "IN_PROGRESS",
    title: "Monthly Royal Rumble",
    totalRounds: 9,
    type: "MONTHLY",
  };

  return {
    ...state,
    activeSessionId: sessionId,
    nextMatchId: state.nextMatchId + 1,
    nextSessionId: state.nextSessionId + 1,
    sessions: [...state.sessions, session],
  };
}

export function resolveCurrentMatch(
  state: MockFlowState,
  winnerEpisodeId: number,
): MockFlowState {
  const session = getActiveSession(state);
  const currentMatch = session?.matches[session.currentMatchIndex];

  if (
    !session ||
    !currentMatch ||
    currentMatch.status === "COMPLETED" ||
    ![currentMatch.episodeAId, currentMatch.episodeBId].includes(
      winnerEpisodeId,
    )
  ) {
    return state;
  }

  const loserEpisodeId =
    currentMatch.episodeAId === winnerEpisodeId
      ? currentMatch.episodeBId
      : currentMatch.episodeAId;
  const completedAt = new Date().toISOString();
  const episodes = state.episodes.map((episode) => {
    if (episode.id === winnerEpisodeId) {
      return {
        ...episode,
        score: episode.score + WIN_SCORE_DELTA,
        wins: episode.wins + 1,
      };
    }

    if (episode.id === loserEpisodeId) {
      return {
        ...episode,
        losses: episode.losses + 1,
      };
    }

    return episode;
  });
  const completedMatch: MockMatch = {
    ...currentMatch,
    completedAt,
    status: "COMPLETED",
    winnerEpisodeId,
  };
  const matches = session.matches.map((match, index) =>
    index === session.currentMatchIndex ? completedMatch : match,
  );
  const nextState = { ...state, episodes };

  if (session.type === "MONTHLY") {
    return resolveMonthlyProgress(nextState, { ...session, matches }, winnerEpisodeId);
  }

  if (session.currentMatchIndex < matches.length - 1) {
    return replaceSession(nextState, {
      ...session,
      currentMatchIndex: session.currentMatchIndex + 1,
      matches,
    });
  }

  return completeSession(nextState, { ...session, matches }, completedAt);
}

export function getActiveSession(state: MockFlowState) {
  return state.sessions.find((session) => session.id === state.activeSessionId);
}

export function getLastCompletedSession(state: MockFlowState) {
  return state.sessions.find(
    (session) => session.id === state.lastCompletedSessionId,
  );
}

export function getCurrentMatch(session?: MockSession) {
  return session?.matches[session.currentMatchIndex];
}

export function getEpisode(state: MockFlowState, episodeId?: number) {
  if (episodeId === undefined) {
    return undefined;
  }

  return state.episodes.find((episode) => episode.id === episodeId);
}

export function getRankedEpisodes(episodes: readonly MockEpisode[]) {
  return [...episodes].sort(compareEpisodesForRanking);
}

export function getSessionStandings(
  state: MockFlowState,
  session?: MockSession,
) {
  if (!session) {
    return [];
  }

  const sessionWins = new Map<number, number>();

  session.matches.forEach((match) => {
    if (match.winnerEpisodeId !== undefined) {
      sessionWins.set(
        match.winnerEpisodeId,
        (sessionWins.get(match.winnerEpisodeId) ?? 0) + 1,
      );
    }
  });

  return session.participantIds
    .map((episodeId) => getEpisode(state, episodeId))
    .filter((episode): episode is MockEpisode => Boolean(episode))
    .sort((left, right) => {
      const winDifference =
        (sessionWins.get(right.id) ?? 0) - (sessionWins.get(left.id) ?? 0);

      if (winDifference !== 0) {
        return winDifference;
      }

      const scoreDifference = right.score - left.score;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return session.participantIds.indexOf(left.id) -
        session.participantIds.indexOf(right.id);
    });
}

export function getSessionTypeLabel(type: MockSessionType) {
  const labels: Record<MockSessionType, string> = {
    DEBUT: "새 에피소드 배치전",
    MONTHLY: "Monthly Royal Rumble",
    ONBOARDING: "온보딩 리그전",
    WEEKLY: "Weekly Show",
  };

  return labels[type];
}

export function getMatchPhaseLabel(phase: MockMatchPhase) {
  const labels: Record<MockMatchPhase, string> = {
    ANNUAL_TITLE: "Annual Championship Title Match",
    DEBUT: "배치 매치",
    LEAGUE: "리그전",
    MONTHLY_RUMBLE: "Royal Rumble",
    WEEKLY_RECENT: "최신 vs 과거",
    WEEKLY_RIVAL: "Rival Match",
  };

  return labels[phase];
}

export function suggestMockTitle(content: string) {
  const normalized = content.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "제목 없는 사건";
  }

  const firstClause = normalized.split(/[.!?。]/)[0].trim();

  return firstClause.length > 18
    ? `${firstClause.slice(0, 18).trim()}...`
    : firstClause;
}

export function isDraftReady(draft: MockEpisodeDraft) {
  return Boolean(draft.title.trim() && normalizeEpisodeDate(draft.date));
}

export function formatDateForDisplay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function createFixedSession(
  state: MockFlowState,
  input: {
    pairs: MatchPair[];
    participantIds: number[];
    title: string;
    type: Exclude<MockSessionType, "MONTHLY">;
  },
  createdAt = new Date().toISOString(),
) {
  let nextMatchId = state.nextMatchId;
  const matches = input.pairs.map((pair, index): MockMatch => ({
    ...pair,
    id: nextMatchId++,
    round: index + 1,
    status: "IN_PROGRESS",
  }));
  const session: MockSession = {
    createdAt,
    currentMatchIndex: 0,
    id: state.nextSessionId,
    matches,
    participantIds: uniqueNumbers(input.participantIds),
    status: "IN_PROGRESS",
    title: input.title,
    totalRounds: matches.length,
    type: input.type,
  };

  return {
    ...state,
    activeSessionId: session.id,
    nextMatchId,
    nextSessionId: state.nextSessionId + 1,
    sessions: [...state.sessions, session],
  };
}

function resolveMonthlyProgress(
  state: MockFlowState,
  session: MockSession,
  winnerEpisodeId: number,
) {
  const currentMatch = session.matches[session.currentMatchIndex];

  if (currentMatch.phase === "ANNUAL_TITLE") {
    const nextState = {
      ...state,
      champions: {
        ...state.champions,
        annualEpisodeId: winnerEpisodeId,
      },
    };

    return completeSession(
      nextState,
      {
        ...session,
        annualChampionId: winnerEpisodeId,
        winnerEpisodeId,
      },
      currentMatch.completedAt ?? new Date().toISOString(),
    );
  }

  if (currentMatch.round < 9) {
    const nextOpponentId = session.participantIds[currentMatch.round + 1];
    const nextMatch: MockMatch = {
      episodeAId: winnerEpisodeId,
      episodeBId: nextOpponentId,
      id: state.nextMatchId,
      phase: "MONTHLY_RUMBLE",
      round: currentMatch.round + 1,
      status: "IN_PROGRESS",
    };

    return replaceSession(
      { ...state, nextMatchId: state.nextMatchId + 1 },
      {
        ...session,
        currentMatchIndex: session.currentMatchIndex + 1,
        matches: [...session.matches, nextMatch],
      },
    );
  }

  const annualChampionId = state.champions.annualEpisodeId;
  const champions = {
    ...state.champions,
    monthlyEpisodeId: winnerEpisodeId,
  };
  const monthlySession = {
    ...session,
    monthlyChampionId: winnerEpisodeId,
  };

  if (annualChampionId && annualChampionId !== winnerEpisodeId) {
    const titleMatch: MockMatch = {
      episodeAId: winnerEpisodeId,
      episodeBId: annualChampionId,
      id: state.nextMatchId,
      phase: "ANNUAL_TITLE",
      round: 10,
      status: "IN_PROGRESS",
    };

    return replaceSession(
      {
        ...state,
        champions,
        nextMatchId: state.nextMatchId + 1,
      },
      {
        ...monthlySession,
        currentMatchIndex: session.currentMatchIndex + 1,
        matches: [...session.matches, titleMatch],
        totalRounds: 10,
      },
    );
  }

  const nextState = {
    ...state,
    champions: {
      ...champions,
      annualEpisodeId: winnerEpisodeId,
    },
  };

  return completeSession(
    nextState,
    {
      ...monthlySession,
      annualChampionId: winnerEpisodeId,
      winnerEpisodeId,
    },
    currentMatch.completedAt ?? new Date().toISOString(),
  );
}

function completeSession(
  state: MockFlowState,
  session: MockSession,
  completedAt: string,
) {
  const standings = getSessionStandings(state, session);
  const sessionWinnerId =
    session.winnerEpisodeId ??
    session.annualChampionId ??
    session.monthlyChampionId ??
    standings[0]?.id;
  const completedSession: MockSession = {
    ...session,
    completedAt,
    status: "COMPLETED",
    winnerEpisodeId: sessionWinnerId,
  };
  const rankedEpisodes = getRankedEpisodes(state.episodes);
  const allTimeEpisodeId = rankedEpisodes[0]?.id;

  return replaceSession(
    {
      ...state,
      activeSessionId: null,
      champions: {
        ...state.champions,
        allTimeEpisodeId,
      },
      lastCompletedSessionId: session.id,
    },
    completedSession,
  );
}

function replaceSession(state: MockFlowState, session: MockSession) {
  return {
    ...state,
    sessions: state.sessions.map((item) =>
      item.id === session.id ? session : item,
    ),
  };
}

function getClosestScoreEpisodes(
  episodes: readonly MockEpisode[],
  score: number,
  count: number,
) {
  return [...episodes]
    .sort((left, right) => {
      const scoreGap =
        Math.abs(left.score - score) - Math.abs(right.score - score);

      return scoreGap || compareCreatedAt(left, right);
    })
    .slice(0, count);
}

function getClosestRivalPairs(
  episodes: readonly MockEpisode[],
  excludedPairs: readonly MatchPair[],
  count: number,
) {
  const excludedKeys = new Set(
    excludedPairs.map((pair) => pairKey(pair.episodeAId, pair.episodeBId)),
  );
  const candidates: Array<{
    episodeAId: number;
    episodeBId: number;
    gap: number;
  }> = [];

  for (let left = 0; left < episodes.length; left += 1) {
    for (let right = left + 1; right < episodes.length; right += 1) {
      const episodeA = episodes[left];
      const episodeB = episodes[right];
      const key = pairKey(episodeA.id, episodeB.id);

      if (!excludedKeys.has(key)) {
        candidates.push({
          episodeAId: episodeA.id,
          episodeBId: episodeB.id,
          gap: Math.abs(episodeA.score - episodeB.score),
        });
      }
    }
  }

  candidates.sort(
    (left, right) =>
      left.gap - right.gap ||
      pairKey(left.episodeAId, left.episodeBId).localeCompare(
        pairKey(right.episodeAId, right.episodeBId),
      ),
  );

  const selected: MatchPair[] = [];
  const usedEpisodeIds = new Set<number>();

  for (const candidate of candidates) {
    if (
      usedEpisodeIds.has(candidate.episodeAId) ||
      usedEpisodeIds.has(candidate.episodeBId)
    ) {
      continue;
    }

    selected.push({
      episodeAId: candidate.episodeAId,
      episodeBId: candidate.episodeBId,
      phase: "WEEKLY_RIVAL",
    });
    usedEpisodeIds.add(candidate.episodeAId);
    usedEpisodeIds.add(candidate.episodeBId);

    if (selected.length === count) {
      return selected;
    }
  }

  for (const candidate of candidates) {
    if (
      selected.some(
        (pair) =>
          pairKey(pair.episodeAId, pair.episodeBId) ===
          pairKey(candidate.episodeAId, candidate.episodeBId),
      )
    ) {
      continue;
    }

    selected.push({
      episodeAId: candidate.episodeAId,
      episodeBId: candidate.episodeBId,
      phase: "WEEKLY_RIVAL",
    });

    if (selected.length === count) {
      break;
    }
  }

  return selected;
}

function createEmptyOnboardingDrafts() {
  const date = formatDateForDisplay(new Date());

  return Array.from({ length: ONBOARDING_EPISODE_COUNT }, () => ({
    content: "",
    date,
    title: "",
  }));
}

function createCommunityEpisodes(): MockEpisode[] {
  const samples = [
    [9001, "발표 3분 컷", 1150, "야심차게 준비한 발표가 시작하자마자 중단됐다."],
    [9002, "버스 눈앞 출발", 1100, "정류장에 도착하자마자 버스가 출발했다."],
    [9003, "택시 반대 방향", 1050, "택시가 목적지와 반대 방향으로 한참 이동했다."],
    [9004, "약속 날짜 착각", 1000, "중요한 약속 날짜를 하루 늦게 기억했다."],
    [9005, "카드 두고 외출", 950, "결제하려는 순간 카드를 두고 온 걸 알았다."],
    [9006, "엘리베이터 고장", 900, "늦은 날 엘리베이터까지 멈춰 계단을 올랐다."],
    [9007, "우산 없는 폭우", 850, "맑을 줄 알고 나갔다가 폭우를 그대로 맞았다."],
    [9008, "초대 연간 챔피언", 800, "오래전 모든 타이틀전을 버텨낸 기존 연간 챔피언이다."],
  ] as const;

  return samples.map(([id, title, score, content], index) => ({
    content,
    createdAt: new Date(Date.now() - (samples.length - index) * 86_400_000).toISOString(),
    episodeDate: formatDateKey(
      new Date(Date.now() - (samples.length - index) * 86_400_000),
    ),
    id,
    losses: 0,
    origin: "COMMUNITY" as const,
    score,
    title,
    wins: 0,
  }));
}

function normalizeEpisodeDate(value: string) {
  const match = value.trim().match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : "";
}

function compareEpisodesForRanking(left: MockEpisode, right: MockEpisode) {
  return (
    right.wins - left.wins ||
    right.score - left.score ||
    compareCreatedAt(left, right) ||
    left.id - right.id
  );
}

function compareCreatedAt(
  left: Pick<MockEpisode, "createdAt">,
  right: Pick<MockEpisode, "createdAt">,
) {
  return left.createdAt.localeCompare(right.createdAt);
}

function uniqueEpisodes(episodes: readonly MockEpisode[]) {
  return Array.from(
    new Map(episodes.map((episode) => [episode.id, episode])).values(),
  );
}

function uniqueNumbers(values: readonly number[]) {
  return Array.from(new Set(values));
}

function pairKey(left: number, right: number) {
  return [Math.min(left, right), Math.max(left, right)].join(":");
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isMockFlowState(value: unknown): value is MockFlowState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MockFlowState>;

  return (
    candidate.version === MOCK_FLOW_VERSION &&
    Array.isArray(candidate.episodes) &&
    Array.isArray(candidate.onboardingDrafts) &&
    Array.isArray(candidate.sessions) &&
    typeof candidate.onboardingComplete === "boolean"
  );
}
