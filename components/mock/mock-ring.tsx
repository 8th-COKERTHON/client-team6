"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MatchFireworks,
  MATCH_FIREWORKS_DURATION_MS,
} from "@/components/mock/match-fireworks";
import { MockLoadingScreen } from "@/components/mock/mock-shell";
import {
  RingMatchScreen,
  type RingBattleEpisode,
} from "@/components/ring-screen";
import {
  getActiveSession,
  getCurrentMatch,
  getEpisode,
  type MockEpisode,
  type MockMatch,
  type MockSession,
} from "@/lib/mock-flow";

export function MockRing() {
  const router = useRouter();
  const { resolveMatch, state } = useMockApp();
  const [pendingWinnerId, setPendingWinnerId] = useState<number | null>(null);
  const session = getActiveSession(state);
  const match = getCurrentMatch(session);
  const episodeA = getEpisode(state, match?.episodeAId);
  const episodeB = getEpisode(state, match?.episodeBId);

  useEffect(() => {
    if (pendingWinnerId === null) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => {
        setPendingWinnerId(null);
        const isSessionComplete = resolveMatch(pendingWinnerId);

        if (isSessionComplete) {
          router.replace("/mock/results");
        }
      },
      prefersReducedMotion ? 0 : MATCH_FIREWORKS_DURATION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [pendingWinnerId, resolveMatch, router]);

  if (!session || !match || !episodeA || !episodeB) {
    return <MockLoadingScreen />;
  }

  function confirmWinner(winnerEpisodeId: number) {
    setPendingWinnerId((current) => current ?? winnerEpisodeId);
  }

  return (
    <>
      <RingMatchScreen
        actionLabel={getActionLabel(session, match)}
        backHref="/mock/home"
        currentRound={match.round}
        episodeA={toRingEpisode(episodeA)}
        episodeB={toRingEpisode(episodeB)}
        isLocked={pendingWinnerId !== null}
        key={match.id}
        onConfirmWinner={confirmWinner}
        totalRounds={session.totalRounds}
      />
      {pendingWinnerId !== null ? <MatchFireworks /> : null}
    </>
  );
}

function toRingEpisode(episode: MockEpisode): RingBattleEpisode {
  return {
    content: episode.content,
    episodeDate: episode.episodeDate,
    episodeId: episode.id,
    recordLabel: `${episode.wins}승 ${episode.losses}패`,
    score: episode.score,
    title: episode.title,
  };
}

function getActionLabel(session: MockSession, match: MockMatch) {
  if (
    match.phase === "ANNUAL_TITLE" ||
    (session.type !== "MONTHLY" && match.round === session.totalRounds)
  ) {
    return "선택 완료";
  }

  return "다음";
}
