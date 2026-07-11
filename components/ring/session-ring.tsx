"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  resolveSessionMatchAction,
  resolveStandaloneMatchAction,
  type SessionFlow,
} from "@/app/ring/actions";
import { BottomNavigation } from "@/components/bottom-navigation";
import {
  ShowScheduleCard,
  type ShowScheduleCardData,
} from "@/components/home/show-schedule-card";
import {
  MatchFireworks,
  MATCH_FIREWORKS_DURATION_MS,
} from "@/components/mock/match-fireworks";
import {
  SessionResults,
  type SessionHistory,
  type SessionHistoryEpisode,
} from "@/components/ring/session-results";
import {
  RingMatchScreen,
  type RingBattleEpisode,
} from "@/components/ring-screen";
import type {
  ActiveEventDto,
  ActiveMatchDto,
  AvailableShowResponse,
  EpisodeView,
  MatchResultResponse,
  RingResponse,
  ShowSessionProgressResponse,
} from "@/lib/backend-types";

const SESSION_HISTORY_VERSION = 1;

export function SessionRing({
  flow,
  initialProgress,
  placementEpisodeId,
}: {
  flow: SessionFlow;
  initialProgress: ShowSessionProgressResponse;
  placementEpisodeId?: number;
}) {
  const [progress, setProgress] = useState(initialProgress);
  const [history, setHistory] = useState(() =>
    registerProgressEpisodes(
      createSessionHistory(initialProgress, flow, placementEpisodeId),
      initialProgress,
    ),
  );
  const [message, setMessage] = useState("");
  const [pendingWinnerId, setPendingWinnerId] = useState<number | null>(null);
  const currentMatch = progress.nextMatch ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const restored = readSessionHistory(initialProgress.sessionId);

      if (restored) {
        setHistory((current) =>
          registerProgressEpisodes(
            mergeSessionHistory(current, restored),
            initialProgress,
          ),
        );
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialProgress]);

  useEffect(() => {
    writeSessionHistory(history);
  }, [history]);

  async function confirmWinner(winnerEpisodeId: number) {
    if (!currentMatch || pendingWinnerId !== null) {
      return;
    }

    setMessage("");
    setPendingWinnerId(winnerEpisodeId);

    const resultPromise = resolveSessionMatchAction({
      episodeId: placementEpisodeId,
      flow,
      matchId: currentMatch.matchId,
      sessionId: progress.sessionId,
      winnerEpisodeId,
    });
    const [result] = await Promise.all([resultPromise, waitForFireworks()]);

    setPendingWinnerId(null);

    if (!result.success || !result.progress || !result.matchResult) {
      setMessage(result.message);
      return;
    }

    const nextProgress = result.progress;
    const matchResult = result.matchResult;
    const finalEpisode = result.finalEpisode;

    setHistory((current) => {
      let nextHistory = applyMatchResult(
        current,
        currentMatch.episodeA,
        currentMatch.episodeB,
        matchResult,
        nextProgress,
      );

      if (finalEpisode) {
        const existing =
          nextHistory.episodes[String(finalEpisode.episodeId)];
        nextHistory = {
          ...nextHistory,
          episodeRank: result.episodeRank,
          episodes: {
            ...nextHistory.episodes,
            [finalEpisode.episodeId]: {
              ...existing,
              content: finalEpisode.content,
              episodeDate: finalEpisode.episodeDate,
              episodeId: finalEpisode.episodeId,
              losses: existing?.losses ?? 0,
              score: finalEpisode.titleScore,
              title: finalEpisode.title,
              wins: existing?.wins ?? 0,
            },
          },
        };
      }

      return registerProgressEpisodes(nextHistory, nextProgress);
    });
    setProgress(nextProgress);
  }

  if (isSessionComplete(progress)) {
    return <SessionResults history={history} />;
  }

  if (!currentMatch) {
    return <SessionWaiting sessionId={progress.sessionId} />;
  }

  return (
    <>
      <RingMatchScreen
        actionLabel={
          progress.completedMatches + 1 >= progress.totalMatches
            ? "선택 완료"
            : "다음"
        }
        backHref="/"
        currentRound={currentMatch.matchOrder || progress.completedMatches + 1}
        episodeA={toRingEpisode(currentMatch.episodeA)}
        episodeB={toRingEpisode(currentMatch.episodeB)}
        isLocked={pendingWinnerId !== null}
        key={currentMatch.matchId}
        onConfirmWinner={confirmWinner}
        totalRounds={progress.totalMatches}
      />
      {message ? <RingErrorMessage message={message} /> : null}
      {pendingWinnerId !== null ? <MatchFireworks /> : null}
    </>
  );
}

export function StandaloneRing({ initialRing }: { initialRing: RingResponse }) {
  const [ring, setRing] = useState(initialRing);
  const [message, setMessage] = useState("");
  const [pendingWinnerId, setPendingWinnerId] = useState<number | null>(null);
  const initialMatch = initialRing.activeMatch ?? null;
  const [history, setHistory] = useState<SessionHistory>(() =>
    createStandaloneHistory(initialMatch),
  );
  const activeMatch = ring.activeMatch ?? null;

  async function confirmWinner(winnerEpisodeId: number) {
    if (!activeMatch || pendingWinnerId !== null) {
      return;
    }

    setMessage("");
    setPendingWinnerId(winnerEpisodeId);

    const resultPromise = resolveStandaloneMatchAction({
      matchId: activeMatch.matchId,
      winnerEpisodeId,
    });
    const [result] = await Promise.all([resultPromise, waitForFireworks()]);

    setPendingWinnerId(null);

    if (!result.success || !result.ring || !result.matchResult) {
      setMessage(result.message);
      return;
    }

    const nextRing = result.ring;
    const matchResult = result.matchResult;

    setHistory((current) =>
      registerStandaloneMatch(
        applyStandaloneResult(current, activeMatch, matchResult),
        nextRing.activeMatch ?? null,
      ),
    );
    setRing(nextRing);
  }

  if (!activeMatch) {
    return <SessionResults history={history} />;
  }

  return (
    <>
      <RingMatchScreen
        actionLabel={
          activeMatch.currentRound >= activeMatch.totalRounds
            ? "선택 완료"
            : "다음"
        }
        backHref="/"
        currentRound={activeMatch.currentRound}
        episodeA={toStandaloneEpisode(activeMatch.episodeA)}
        episodeB={toStandaloneEpisode(activeMatch.episodeB)}
        isLocked={pendingWinnerId !== null}
        key={activeMatch.matchId}
        onConfirmWinner={confirmWinner}
        totalRounds={activeMatch.totalRounds}
      />
      {message ? <RingErrorMessage message={message} /> : null}
      {pendingWinnerId !== null ? <MatchFireworks /> : null}
    </>
  );
}

export function RingLobby({
  activeEvents,
  shows,
}: {
  activeEvents: ActiveEventDto[];
  shows: AvailableShowResponse[];
}) {
  const schedules = useMemo(
    () => createLobbySchedules(shows, activeEvents),
    [activeEvents, shows],
  );

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <header className="flex h-[calc(max(env(safe-area-inset-top),44px)+54px)] items-end px-4 pb-[9px]">
          <Link
            aria-label="홈"
            className="relative size-9 overflow-hidden rounded-[8px]"
            href="/"
          >
            <Image
              alt="MME"
              className="object-cover"
              fill
              priority
              sizes="36px"
              src="/icons/mme-icon-192.png"
            />
          </Link>
        </header>

        <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-6">
          <h1 className="text-xl font-semibold leading-[1.4] text-white">링</h1>
          <p className="mt-2 text-sm font-medium leading-[1.5] text-[#b1b9c5]">
            진행할 수 있는 매치를 선택하세요.
          </p>

          {schedules.length > 0 ? (
            <div className="mt-8 flex flex-col gap-3">
              {schedules.map((show) => (
                <ShowScheduleCard key={`${show.showId}-${show.sessionId ?? 0}`} show={show} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-base font-semibold text-white">
              현재 진행할 수 있는 매치가 없습니다.
            </p>
          )}
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function createSessionHistory(
  progress: ShowSessionProgressResponse,
  flow: SessionFlow,
  placementEpisodeId?: number,
): SessionHistory {
  return {
    completedMatches: progress.completedMatches,
    episodes: {},
    flow,
    placementEpisodeId,
    sessionId: progress.sessionId,
    totalMatches: progress.totalMatches,
    type: progress.type,
    winnerIds: [],
  };
}

function registerProgressEpisodes(
  history: SessionHistory,
  progress: ShowSessionProgressResponse,
) {
  const nextMatch = progress.nextMatch;

  if (!nextMatch) {
    return {
      ...history,
      completedMatches: progress.completedMatches,
      totalMatches: progress.totalMatches,
      type: progress.type,
    };
  }

  return {
    ...history,
    completedMatches: progress.completedMatches,
    episodes: {
      ...history.episodes,
      [nextMatch.episodeA.episodeId]: mergeEpisode(
        history.episodes[String(nextMatch.episodeA.episodeId)],
        nextMatch.episodeA,
      ),
      [nextMatch.episodeB.episodeId]: mergeEpisode(
        history.episodes[String(nextMatch.episodeB.episodeId)],
        nextMatch.episodeB,
      ),
    },
    totalMatches: progress.totalMatches,
    type: progress.type,
  };
}

function mergeEpisode(
  current: SessionHistoryEpisode | undefined,
  episode: EpisodeView,
): SessionHistoryEpisode {
  return {
    content: episode.content,
    episodeDate: episode.episodeDate,
    episodeId: episode.episodeId,
    losses: current?.losses ?? 0,
    score: episode.score,
    title: episode.title,
    titleName: episode.titleName,
    wins: current?.wins ?? 0,
  };
}

function applyMatchResult(
  history: SessionHistory,
  episodeA: EpisodeView,
  episodeB: EpisodeView,
  result: MatchResultResponse,
  progress: ShowSessionProgressResponse,
): SessionHistory {
  const winnerId = result.winnerEpisodeId;
  const loserId =
    winnerId === episodeA.episodeId ? episodeB.episodeId : episodeA.episodeId;
  const winner = history.episodes[String(winnerId)];
  const loser = history.episodes[String(loserId)];

  return {
    ...history,
    completedMatches: progress.completedMatches,
    episodes: {
      ...history.episodes,
      [winnerId]: {
        ...winner,
        score: result.winnerEpisodeTitleScore,
        wins: (winner?.wins ?? 0) + 1,
      },
      [loserId]: {
        ...loser,
        losses: (loser?.losses ?? 0) + 1,
      },
    },
    totalMatches: progress.totalMatches,
    winnerIds: [...history.winnerIds, winnerId],
  } satisfies SessionHistory;
}

function createStandaloneHistory(match: ActiveMatchDto | null): SessionHistory {
  if (!match) {
    return {
      completedMatches: 0,
      episodes: {},
      flow: "placement",
      sessionId: 0,
      totalMatches: 0,
      type: "MATCH",
      winnerIds: [],
    };
  }

  return {
    completedMatches: Math.max(match.currentRound - 1, 0),
    episodes: {
      [match.episodeA.episodeId]: toHistoryEpisode(match.episodeA),
      [match.episodeB.episodeId]: toHistoryEpisode(match.episodeB),
    },
    flow: "placement",
    sessionId: 0,
    totalMatches: match.totalRounds,
    type: "MATCH",
    winnerIds: [],
  };
}

function applyStandaloneResult(
  history: SessionHistory,
  match: ActiveMatchDto,
  result: MatchResultResponse,
): SessionHistory {
  const episodeA = history.episodes[String(match.episodeA.episodeId)];
  const episodeB = history.episodes[String(match.episodeB.episodeId)];
  const winnerId = result.winnerEpisodeId;
  const loserId =
    winnerId === match.episodeA.episodeId
      ? match.episodeB.episodeId
      : match.episodeA.episodeId;
  const winner = winnerId === episodeA.episodeId ? episodeA : episodeB;
  const loser = loserId === episodeA.episodeId ? episodeA : episodeB;

  return {
    ...history,
    completedMatches: Math.min(
      history.completedMatches + 1,
      history.totalMatches,
    ),
    episodes: {
      ...history.episodes,
      [winnerId]: {
        ...winner,
        score: result.winnerEpisodeTitleScore,
        wins: winner.wins + 1,
      },
      [loserId]: { ...loser, losses: loser.losses + 1 },
    },
    winnerIds: [...history.winnerIds, winnerId],
  };
}

function registerStandaloneMatch(
  history: SessionHistory,
  match: ActiveMatchDto | null,
) {
  if (!match) {
    return history;
  }

  return {
    ...history,
    episodes: {
      ...history.episodes,
      [match.episodeA.episodeId]:
        history.episodes[String(match.episodeA.episodeId)] ??
        toHistoryEpisode(match.episodeA),
      [match.episodeB.episodeId]:
        history.episodes[String(match.episodeB.episodeId)] ??
        toHistoryEpisode(match.episodeB),
    },
    totalMatches: match.totalRounds,
  };
}

function toHistoryEpisode(episode: ActiveMatchDto["episodeA"]): SessionHistoryEpisode {
  return {
    content: episode.content,
    episodeDate: episode.episodeDate,
    episodeId: episode.episodeId,
    losses: 0,
    score: 0,
    title: episode.title,
    wins: 0,
  };
}

function toRingEpisode(episode: EpisodeView): RingBattleEpisode {
  return {
    content: episode.content,
    episodeDate: episode.episodeDate,
    episodeId: episode.episodeId,
    recordLabel: episode.titleName || "랭킹 산정 중",
    score: episode.score,
    title: episode.title,
  };
}

function toStandaloneEpisode(
  episode: ActiveMatchDto["episodeA"],
): RingBattleEpisode {
  return {
    ...episode,
    recordLabel: "진행 중인 매치",
    score: 0,
  };
}

function mergeSessionHistory(
  current: SessionHistory,
  restored: SessionHistory,
) {
  if (current.sessionId !== restored.sessionId) {
    return current;
  }

  return {
    ...current,
    ...restored,
    completedMatches: Math.max(
      current.completedMatches,
      restored.completedMatches,
    ),
    episodes: { ...current.episodes, ...restored.episodes },
    placementEpisodeId:
      current.placementEpisodeId ?? restored.placementEpisodeId,
  };
}

function getSessionHistoryKey(sessionId: number) {
  return `mme.session-history.v${SESSION_HISTORY_VERSION}.${sessionId}`;
}

function readSessionHistory(sessionId: number) {
  try {
    const rawValue = window.localStorage.getItem(
      getSessionHistoryKey(sessionId),
    );
    const parsed = rawValue ? (JSON.parse(rawValue) as unknown) : null;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Partial<SessionHistory>;
    return candidate.sessionId === sessionId && candidate.episodes
      ? (candidate as SessionHistory)
      : null;
  } catch {
    return null;
  }
}

function writeSessionHistory(history: SessionHistory) {
  if (!history.sessionId) {
    return;
  }

  try {
    window.localStorage.setItem(
      getSessionHistoryKey(history.sessionId),
      JSON.stringify(history),
    );
  } catch {
    // A storage failure must not block server-backed match progression.
  }
}

function isSessionComplete(progress: ShowSessionProgressResponse) {
  return (
    !progress.nextMatch &&
    (progress.completedMatches >= progress.totalMatches ||
      progress.status.toUpperCase().includes("COMPLETE"))
  );
}

function createLobbySchedules(
  shows: AvailableShowResponse[],
  activeEvents: ActiveEventDto[],
) {
  const showSchedules = shows.map(
    (show, index): ShowScheduleCardData => ({
      completedMatches: show.completedMatchCount,
      dateLabel: formatDateLabel(show.startsAt),
      kind: formatShowType(show.type),
      matchCount: show.matchCount,
      remainingDays: getRemainingDays(show.startsAt),
      sessionId: show.sessionId,
      showId: show.showId,
      title: show.title,
      variant: index % 2 === 0 ? "solid" : "fade",
    }),
  );
  const showIds = new Set(shows.map((show) => show.showId));
  const eventSchedules = activeEvents
    .filter((event) => !showIds.has(event.eventId))
    .map(
      (event, index): ShowScheduleCardData => ({
        dateLabel: event.displayDate,
        kind: formatShowType(event.type),
        remainingDays: 0,
        showId: event.eventId,
        title: event.title,
        variant: (showSchedules.length + index) % 2 === 0 ? "solid" : "fade",
      }),
    );

  return [...showSchedules, ...eventSchedules];
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}

function getRemainingDays(value: string) {
  const start = new Date(value);

  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((start.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );
}

function formatShowType(type: string) {
  const normalizedType = type.toUpperCase();
  if (normalizedType.includes("MONTH")) return "Monthly Show";
  if (normalizedType.includes("WEEK")) return "Weekly Show";
  return type;
}

async function waitForFireworks() {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return;
  }

  await new Promise((resolve) =>
    window.setTimeout(resolve, MATCH_FIREWORKS_DURATION_MS),
  );
}

function SessionWaiting({ sessionId }: { sessionId: number }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#12161b] px-4 text-center text-white">
      <div>
        <h1 className="text-xl font-semibold">다음 매치를 준비하고 있습니다.</h1>
        <Link
          className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#ff0002] px-6 text-sm font-semibold"
          href={`/ring?sessionId=${sessionId}`}
        >
          다시 확인
        </Link>
      </div>
    </main>
  );
}

function RingErrorMessage({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-[calc(max(env(safe-area-inset-top),44px)+4rem)] z-[110] mx-auto max-w-[343px] rounded-xl bg-[#292e38] px-4 py-3 text-center text-sm font-medium text-[#ff5b5d] shadow-lg" role="alert">
      {message}
    </div>
  );
}
