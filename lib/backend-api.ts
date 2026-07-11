import "server-only";

import { auth } from "@/auth";
import type {
  ApiResponse,
  AvailableShowResponse,
  ChampionHistoryItemResponse,
  CreateEpisodeResponse,
  EpisodeDetailResponse,
  EpisodeListResponse,
  EpisodeSearchResponse,
  HistoryHomeResponse,
  HomeResponse,
  MatchHistoryItemResponse,
  MatchResultResponse,
  MemberMeResponse,
  OnboardingStatusResponse,
  RankingListResponse,
  RingResponse,
  ShowSessionProgressResponse,
} from "@/lib/backend-types";

type BackendRequestInit = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class BackendApiError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, status = 500, code: string | null = null) {
    super(message);
    this.name = "BackendApiError";
    this.code = code;
    this.status = status;
  }
}

export async function getMemberMe() {
  return backendRequest<MemberMeResponse>("/api/v1/members/me");
}

export async function getOnboardingStatus() {
  return backendRequest<OnboardingStatusResponse>(
    "/api/v1/members/me/status",
  );
}

export async function completeOnboarding() {
  return backendRequest<MemberMeResponse>(
    "/api/v1/members/me/onboarding/complete",
    { method: "POST" },
  );
}

export async function getHome() {
  return backendRequest<HomeResponse>("/api/v1/home");
}

export async function createEpisode(input: {
  content: string;
  episodeDate: string;
  title: string;
}) {
  return backendRequest<CreateEpisodeResponse>("/api/v1/episodes", {
    body: input,
    method: "POST",
  });
}

export async function getEpisodes(options: {
  cursor?: string;
  size?: number;
  status?: string;
} = {}) {
  return backendRequest<EpisodeListResponse>(
    withQuery("/api/v1/episodes", options),
  );
}

export async function getAllEpisodes(maxPages = 100) {
  const items: EpisodeListResponse["items"] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await getEpisodes({ cursor, size: 50 });
    items.push(...response.items);

    if (!response.hasNext || !response.nextCursor) {
      break;
    }

    if (seenCursors.has(response.nextCursor)) {
      break;
    }

    seenCursors.add(response.nextCursor);
    cursor = response.nextCursor;
  }

  return items;
}

export async function getEpisodeDetail(episodeId: number) {
  return backendRequest<EpisodeDetailResponse>(
    `/api/v1/episodes/${episodeId}`,
  );
}

export async function searchEpisodes(options: {
  page?: number;
  query: string;
  size?: number;
}) {
  return backendRequest<EpisodeSearchResponse>(
    withQuery("/api/v1/episodes/search", options),
  );
}

export async function searchAllEpisodes(query: string, maxPages = 20) {
  const items: EpisodeSearchResponse["items"] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const response = await searchEpisodes({ page, query, size: 50 });
    items.push(...response.items);

    if (!response.hasNext) {
      break;
    }
  }

  return items;
}

export async function startOnboardingPlacement() {
  return backendRequest<ShowSessionProgressResponse>(
    "/api/v1/placements/onboarding",
    { method: "POST" },
  );
}

export async function startEpisodePlacement(episodeId: number) {
  return backendRequest<ShowSessionProgressResponse>(
    `/api/v1/episodes/${episodeId}/placement`,
    { method: "POST" },
  );
}

export async function getAvailableShows() {
  return backendRequest<AvailableShowResponse[]>("/api/v1/shows/available");
}

export async function startShowSession(showId: number) {
  return backendRequest<ShowSessionProgressResponse>(
    `/api/v1/shows/${showId}/sessions`,
    { method: "POST" },
  );
}

export async function getShowSession(sessionId: number) {
  return backendRequest<ShowSessionProgressResponse>(
    `/api/v1/shows/sessions/${sessionId}`,
  );
}

export async function completeMatch(
  matchId: number,
  winnerEpisodeId: number,
) {
  return backendRequest<MatchResultResponse>(
    `/api/v1/matches/${matchId}/result`,
    {
      body: { winnerEpisodeId },
      method: "POST",
    },
  );
}

export async function getRing() {
  return backendRequest<RingResponse>("/api/v1/ring");
}

export async function getRankings(page = 0, size = 20) {
  return backendRequest<RankingListResponse>(
    withQuery("/api/v1/rankings", { page, size }),
  );
}

export async function getRankingsForEpisodeIds(
  episodeIds: Iterable<number>,
  maxPages = 200,
) {
  const targetIds = new Set(episodeIds);
  const matchedItems = new Map<number, RankingListResponse["items"][number]>();

  if (targetIds.size === 0) {
    return [];
  }

  for (let page = 0; page < maxPages; page += 1) {
    const response = await getRankings(page, 50);

    response.items.forEach((item) => {
      if (targetIds.has(item.episodeId)) {
        matchedItems.set(item.episodeId, item);
      }
    });

    if (matchedItems.size >= targetIds.size || !response.hasNext) {
      break;
    }
  }

  return Array.from(matchedItems.values());
}

export async function getAllRankings(maxPages = 20) {
  const items: RankingListResponse["items"] = [];

  for (let page = 0; page < maxPages; page += 1) {
    const response = await getRankings(page, 50);
    items.push(...response.items);

    if (!response.hasNext) {
      break;
    }
  }

  return items;
}

export async function getHistoryHome(query?: string) {
  return backendRequest<HistoryHomeResponse>(
    withQuery("/api/v1/history", { query }),
  );
}

export async function getMatchHistory(query?: string, size = 50) {
  return backendRequest<MatchHistoryItemResponse[]>(
    withQuery("/api/v1/history/matches", { query, size }),
  );
}

export async function getChampionHistory(query?: string, size = 50) {
  return backendRequest<ChampionHistoryItemResponse[]>(
    withQuery("/api/v1/history/champions", { query, size }),
  );
}

export function getBackendErrorMessage(
  error: unknown,
  fallback = "요청을 처리하지 못했습니다.",
) {
  return error instanceof BackendApiError && error.message
    ? error.message
    : fallback;
}

async function backendRequest<T>(
  path: string,
  { body, headers, ...init }: BackendRequestInit = {},
) {
  const session = await auth();
  const accessToken = session?.user?.accessToken;
  const backendBaseUrl = process.env.AUTH_BACKEND_URL;

  if (!session?.user || !accessToken) {
    throw new BackendApiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  }

  if (session.user.refreshError) {
    throw new BackendApiError(
      "로그인이 만료되었습니다. 다시 로그인해주세요.",
      401,
      session.user.refreshError,
    );
  }

  if (!backendBaseUrl) {
    throw new BackendApiError(
      "백엔드 URL이 설정되어 있지 않습니다.",
      500,
      "BACKEND_URL_MISSING",
    );
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  requestHeaders.set(
    "Authorization",
    `${session.user.tokenType || "Bearer"} ${accessToken}`,
  );

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(new URL(path, backendBaseUrl), {
      ...init,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      headers: requestHeaders,
    });
  } catch {
    throw new BackendApiError(
      "백엔드에 연결하지 못했습니다.",
      503,
      "BACKEND_UNREACHABLE",
    );
  }

  const envelope = (await response
    .json()
    .catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok || envelope.success === false) {
    throw new BackendApiError(
      envelope.message || "요청을 처리하지 못했습니다.",
      response.status,
      envelope.code || null,
    );
  }

  if (!("data" in envelope)) {
    throw new BackendApiError(
      "백엔드 응답 형식이 올바르지 않습니다.",
      response.status,
      envelope.code || "INVALID_RESPONSE",
    );
  }

  return envelope.data as T;
}

function withQuery(
  path: string,
  values: Record<string, number | string | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}
