"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  getArenaImpactClassName,
  getMatchFireworksDuration,
  MatchFireworks,
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

type PendingDecision = {
  isFinal: boolean;
  winnerEpisodeId: number;
};

export function MockRing() {
  const router = useRouter();
  const { resolveMatch, state } = useMockApp();
  const [pendingDecision, setPendingDecision] =
    useState<PendingDecision | null>(null);
  const session = getActiveSession(state);
  const match = getCurrentMatch(session);
  const episodeA = getEpisode(state, match?.episodeAId);
  const episodeB = getEpisode(state, match?.episodeBId);
  const isCurrentMatchFinal = Boolean(
    session && match && isFinalMatch(session, match),
  );

  useEffect(() => {
    if (!pendingDecision) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => {
        setPendingDecision(null);
        const isSessionComplete = resolveMatch(
          pendingDecision.winnerEpisodeId,
        );

        if (isSessionComplete) {
          router.replace("/mock/results");
        }
      },
      prefersReducedMotion
        ? 0
        : getMatchFireworksDuration(pendingDecision.isFinal),
    );

    return () => window.clearTimeout(timer);
  }, [pendingDecision, resolveMatch, router]);

  if (!session || !match || !episodeA || !episodeB) {
    return <MockLoadingScreen />;
  }

  function confirmWinner(winnerEpisodeId: number) {
    setPendingDecision((current) =>
      current ?? {
        isFinal: isCurrentMatchFinal,
        winnerEpisodeId,
      },
    );
  }

  return (
    <>
      <div
        className={
          pendingDecision
            ? getArenaImpactClassName(pendingDecision.isFinal)
            : undefined
        }
      >
        <RingMatchScreen
          actionLabel={getActionLabel(session, match)}
          backHref="/mock/home"
          currentRound={match.round}
          episodeA={toRingEpisode(episodeA)}
          episodeB={toRingEpisode(episodeB)}
          isCelebrating={pendingDecision !== null}
          isLocked={pendingDecision !== null}
          key={match.id}
          onConfirmWinner={confirmWinner}
          totalRounds={session.totalRounds}
        />
      </div>
      {pendingDecision ? (
        <MatchFireworks isFinal={pendingDecision.isFinal} />
      ) : null}
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
  if (isFinalMatch(session, match)) {
    return "선택 완료";
  }

  return "다음";
}

function isFinalMatch(session: MockSession, match: MockMatch) {
  return (
    match.phase === "ANNUAL_TITLE" ||
    (session.type !== "MONTHLY" && match.round === session.totalRounds)
  );
}
