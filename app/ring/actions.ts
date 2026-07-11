"use server";

import { revalidatePath } from "next/cache";
import { update } from "@/auth";
import {
  completeMatch,
  completeOnboarding,
  getAllRankings,
  getBackendErrorMessage,
  getEpisodeDetail,
  getRing,
  getShowSession,
  startEpisodePlacement,
  startOnboardingPlacement,
  startShowSession,
} from "@/lib/backend-api";
import type {
  EpisodeDetailResponse,
  MatchResultResponse,
  RingResponse,
  ShowSessionProgressResponse,
} from "@/lib/backend-types";

export type SessionFlow = "onboarding" | "placement" | "show";

export type StartSessionResult = {
  message: string;
  progress?: ShowSessionProgressResponse;
  success: boolean;
};

export type ResolveSessionMatchResult = {
  episodeRank?: number;
  finalEpisode?: EpisodeDetailResponse;
  matchResult?: MatchResultResponse;
  message: string;
  progress?: ShowSessionProgressResponse;
  success: boolean;
};

export type ResolveStandaloneMatchResult = {
  matchResult?: MatchResultResponse;
  message: string;
  ring?: RingResponse;
  success: boolean;
};

export async function startOnboardingPlacementAction(): Promise<StartSessionResult> {
  try {
    const progress = await startOnboardingPlacement();
    revalidateRingData();
    return { message: "", progress, success: true };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "배치전을 시작하지 못했습니다."),
      success: false,
    };
  }
}

export async function startEpisodePlacementAction(
  episodeId: number,
): Promise<StartSessionResult> {
  if (!isPositiveInteger(episodeId)) {
    return { message: "에피소드 정보가 올바르지 않습니다.", success: false };
  }

  try {
    const progress = await startEpisodePlacement(episodeId);
    revalidateRingData();
    return { message: "", progress, success: true };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "배치전을 시작하지 못했습니다."),
      success: false,
    };
  }
}

export async function startShowSessionAction(
  showId: number,
): Promise<StartSessionResult> {
  if (!isPositiveInteger(showId)) {
    return { message: "쇼 정보가 올바르지 않습니다.", success: false };
  }

  try {
    const progress = await startShowSession(showId);
    revalidateRingData();
    return { message: "", progress, success: true };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "쇼를 시작하지 못했습니다."),
      success: false,
    };
  }
}

export async function resolveSessionMatchAction(input: {
  episodeId?: number;
  flow: SessionFlow;
  matchId: number;
  sessionId: number;
  winnerEpisodeId: number;
}): Promise<ResolveSessionMatchResult> {
  if (
    !isSessionFlow(input.flow) ||
    !isPositiveInteger(input.matchId) ||
    !isPositiveInteger(input.sessionId) ||
    !isPositiveInteger(input.winnerEpisodeId) ||
    (input.episodeId !== undefined && !isPositiveInteger(input.episodeId))
  ) {
    return { message: "매치 정보가 올바르지 않습니다.", success: false };
  }

  try {
    const matchResult = await completeMatch(
      input.matchId,
      input.winnerEpisodeId,
    );
    const progress = await getShowSession(input.sessionId);
    const isComplete = isSessionComplete(progress);
    let finalEpisode: EpisodeDetailResponse | undefined;
    let episodeRank: number | undefined;

    if (isComplete && input.flow === "onboarding") {
      const member = await completeOnboarding();
      await update({
        user: {
          onboardingCompleted: member.onboardingCompleted ?? true,
          onboardingCompletedAt:
            member.onboardingCompletedAt ?? new Date().toISOString(),
        },
      });
    }

    if (isComplete && input.episodeId) {
      finalEpisode = await getEpisodeDetail(input.episodeId);
      const rankings = await getAllRankings();
      episodeRank = rankings.find(
        (ranking) => ranking.episodeId === input.episodeId,
      )?.rank;
    }

    revalidateRingData();

    return {
      episodeRank,
      finalEpisode,
      matchResult,
      message: "",
      progress,
      success: true,
    };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "매치 결과를 반영하지 못했습니다."),
      success: false,
    };
  }
}

export async function resolveStandaloneMatchAction(input: {
  matchId: number;
  winnerEpisodeId: number;
}): Promise<ResolveStandaloneMatchResult> {
  if (
    !isPositiveInteger(input.matchId) ||
    !isPositiveInteger(input.winnerEpisodeId)
  ) {
    return { message: "매치 정보가 올바르지 않습니다.", success: false };
  }

  try {
    const matchResult = await completeMatch(
      input.matchId,
      input.winnerEpisodeId,
    );
    const ring = await getRing();
    revalidateRingData();

    return { matchResult, message: "", ring, success: true };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "매치 결과를 반영하지 못했습니다."),
      success: false,
    };
  }
}

function isSessionComplete(progress: ShowSessionProgressResponse) {
  return (
    !progress.nextMatch &&
    (progress.completedMatches >= progress.totalMatches ||
      progress.status.toUpperCase().includes("COMPLETE"))
  );
}

function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

function isSessionFlow(value: string): value is SessionFlow {
  return value === "onboarding" || value === "placement" || value === "show";
}

function revalidateRingData() {
  revalidatePath("/");
  revalidatePath("/onboarding");
  revalidatePath("/ranking");
  revalidatePath("/records");
  revalidatePath("/ring");
}
