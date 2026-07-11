import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  RingLobby,
  SessionRing,
  StandaloneRing,
} from "@/components/ring/session-ring";
import {
  getAvailableShows,
  getOnboardingStatus,
  getRing,
  getShowSession,
} from "@/lib/backend-api";
import type {
  AvailableShowResponse,
  OnboardingStatusResponse,
  RingResponse,
  ShowSessionProgressResponse,
} from "@/lib/backend-types";

type RingPageProps = {
  searchParams: Promise<{
    episodeId?: string | string[];
    flow?: string | string[];
    sessionId?: string | string[];
  }>;
};

export const metadata = {
  title: "링 | MME",
};

export default async function RingPage({ searchParams }: RingPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const query = await searchParams;
  const requestedSessionId = parsePositiveInteger(query.sessionId);
  const placementEpisodeId = parsePositiveInteger(query.episodeId);
  const requestedFlow = parseFlow(query.flow);
  const [statusResult, showsResult, ringResult] = await Promise.allSettled([
    getOnboardingStatus(),
    getAvailableShows(),
    getRing(),
  ]);
  const onboardingStatus = valueOrNull(statusResult);
  const shows = valueOr(showsResult, [] as AvailableShowResponse[]);
  const ring = valueOr(ringResult, createEmptyRing());
  const sessionId =
    requestedSessionId ??
    onboardingStatus?.activePlacementSessionId ??
    findActiveShowSessionId(shows);
  const progress = sessionId ? await loadSession(sessionId) : null;

  if (
    session.user.onboardingCompleted === false &&
    !progress &&
    !onboardingStatus?.activePlacementSessionId
  ) {
    redirect("/onboarding");
  }

  if (progress) {
    return (
      <SessionRing
        flow={
          requestedFlow ??
          inferFlow(progress, onboardingStatus, placementEpisodeId)
        }
        initialProgress={progress}
        placementEpisodeId={placementEpisodeId}
      />
    );
  }

  if (ring.activeMatch) {
    return <StandaloneRing initialRing={ring} />;
  }

  return <RingLobby activeEvents={ring.activeEvents} shows={shows} />;
}

async function loadSession(sessionId: number) {
  try {
    return await getShowSession(sessionId);
  } catch {
    return null;
  }
}

function findActiveShowSessionId(shows: AvailableShowResponse[]) {
  return shows.find(
    (show) =>
      show.sessionId && !show.status.toUpperCase().includes("COMPLETE"),
  )?.sessionId;
}

function inferFlow(
  progress: ShowSessionProgressResponse,
  onboardingStatus: OnboardingStatusResponse | null,
  placementEpisodeId?: number,
) {
  if (onboardingStatus?.activePlacementSessionId === progress.sessionId) {
    return "onboarding" as const;
  }

  if (placementEpisodeId) {
    return "placement" as const;
  }

  return "show" as const;
}

function parseFlow(value?: string | string[]) {
  const normalized = getFirstValue(value)?.toLowerCase();

  if (
    normalized === "onboarding" ||
    normalized === "placement" ||
    normalized === "show"
  ) {
    return normalized;
  }

  return null;
}

function parsePositiveInteger(value?: string | string[]) {
  const parsed = Number(getFirstValue(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function getFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function valueOrNull<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : null;
}

function valueOr<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function createEmptyRing(): RingResponse {
  return {
    activeEvents: [],
    activeMatch: null,
    activeQuestion: null,
    availableEpisodes: [],
  };
}
