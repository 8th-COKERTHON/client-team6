export type ApiResponse<T> = {
  code?: string;
  data?: T;
  message?: string;
  success?: boolean;
};

export type MemberMeResponse = {
  email: string;
  memberId: number;
  name: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string | null;
};

export type OnboardingStatusResponse = {
  activePlacementSessionId?: number | null;
  completedPlacementMatches: number;
  onboardingStatus: string;
  registeredEpisodeCount: number;
  totalPlacementMatches: number;
};

export type TodayEpisodeResponse = {
  createdAt: string;
  episodeDate: string;
  episodeId: number;
  title: string;
};

export type UpcomingEventResponse = {
  daysRemaining: number;
  endsAt: string;
  eventId: number;
  scoreReward: number;
  startsAt: string;
  title: string;
  type: string;
};

export type HomeResponse = {
  availableEpisodeCount: number;
  canStartMatch: boolean;
  today: string;
  todayEpisode?: TodayEpisodeResponse | null;
  upcomingEvents: UpcomingEventResponse[];
};

export type CreateEpisodeResponse = {
  availableEpisodeCount: number;
  canStartMatch: boolean;
  createdAt: string;
  currentTitle?: string | null;
  episodeId: number;
  status: string;
  titleScore: number;
};

export type EpisodeListItemResponse = {
  contentPreview: string;
  createdAt: string;
  currentTitleId?: number | null;
  episodeDate: string;
  episodeId: number;
  matchedAt?: string | null;
  rankingPresent: boolean;
  status: string;
  title: string;
  titleScore: number;
};

export type EpisodeListResponse = {
  hasNext: boolean;
  items: EpisodeListItemResponse[];
  nextCursor?: string | null;
};

export type EpisodeDetailResponse = {
  content: string;
  createdAt: string;
  currentTitleId?: number | null;
  episodeDate: string;
  episodeId: number;
  matchedAt?: string | null;
  memberId: number;
  rankingPresent: boolean;
  rankingVersion: number;
  status: string;
  title: string;
  titleScore: number;
  updatedAt: string;
};

export type EpisodeSearchItemResponse = {
  contentPreview: string;
  episodeDate: string;
  episodeId: number;
  status: string;
  title: string;
};

export type EpisodeSearchResponse = {
  hasNext: boolean;
  items: EpisodeSearchItemResponse[];
  matchedBy: string;
  page: number;
  query: string;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type EpisodeView = {
  content: string;
  episodeDate: string;
  episodeId: number;
  score: number;
  title: string;
  titleName?: string | null;
};

export type NextMatch = {
  episodeA: EpisodeView;
  episodeB: EpisodeView;
  matchId: number;
  matchOrder: number;
};

export type ShowSessionProgressResponse = {
  completedMatches: number;
  nextMatch?: NextMatch | null;
  sessionId: number;
  status: string;
  totalMatches: number;
  type: string;
};

export type AvailableShowResponse = {
  completedMatchCount: number;
  endsAt: string;
  matchCount: number;
  sessionId?: number | null;
  showId: number;
  startsAt: string;
  status: string;
  title: string;
  type: string;
};

export type MatchResultResponse = {
  completedAt: string;
  matchId: number;
  status: string;
  winnerEpisodeId: number;
  winnerEpisodeScoreAwarded: number;
  winnerEpisodeTitle: string;
  winnerEpisodeTitleScore: number;
};

export type ActiveEventDto = {
  displayDate: string;
  eventId: number;
  scoreReward: number;
  title: string;
  type: string;
};

export type AvailableEpisodeDto = {
  episodeDate: string;
  episodeId: number;
  title: string;
};

export type EpisodeCardDto = AvailableEpisodeDto & {
  content: string;
};

export type ActiveMatchDto = {
  currentRound: number;
  episodeA: EpisodeCardDto;
  episodeB: EpisodeCardDto;
  matchId: number;
  status: string;
  totalRounds: number;
};

export type RingResponse = {
  activeEvents: ActiveEventDto[];
  activeMatch?: ActiveMatchDto | null;
  activeQuestion: unknown;
  availableEpisodes: AvailableEpisodeDto[];
};

export type RankingItemResponse = {
  episodeId: number;
  episodeTitle: string;
  rank: number;
  score: number;
  title: string;
};

export type RankingListResponse = {
  hasNext: boolean;
  items: RankingItemResponse[];
  page: number;
  size: number;
  totalElements: number;
};

export type ChampionHistoryItemResponse = {
  achievedAt: string;
  championTitle: string;
  episodeDate: string;
  episodeId: number;
  episodeTitle: string;
  titleScore: number;
};

export type MatchHistoryItemResponse = {
  completedAt: string;
  episodeADate: string;
  episodeAId: number;
  episodeAResult: string;
  episodeATitle: string;
  episodeBDate: string;
  episodeBId: number;
  episodeBResult: string;
  episodeBTitle: string;
  matchId: number;
  winnerEpisodeId: number;
};

export type HistoryHomeResponse = {
  championRecords: ChampionHistoryItemResponse[];
  matchRecords: MatchHistoryItemResponse[];
};
