import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GuestHome } from "@/components/home/guest-home";
import { SignedInHome } from "@/components/home/signed-in-home";
import {
  getAvailableShows,
  getEpisodes,
  getHome,
  getMemberMe,
  getOnboardingStatus,
} from "@/lib/backend-api";
import type {
  AvailableShowResponse,
  EpisodeListResponse,
  HomeResponse,
} from "@/lib/backend-types";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <GuestHome />;
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  const [memberResult, homeResult, showsResult, statusResult, pendingResult] =
    await Promise.allSettled([
      getMemberMe(),
      getHome(),
      getAvailableShows(),
      getOnboardingStatus(),
      getEpisodes({ size: 1, status: "PENDING" }),
    ]);
  const member = valueOrNull(memberResult);

  if (member?.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  return (
    <SignedInHome
      home={valueOr(homeResult, createEmptyHome())}
      onboardingStatus={valueOrNull(statusResult)}
      pendingEpisode={valueOr(pendingResult, createEmptyEpisodeList()).items[0]}
      shows={valueOr(showsResult, [] as AvailableShowResponse[])}
    />
  );
}

function valueOrNull<T>(result: PromiseSettledResult<T>) {
  return result.status === "fulfilled" ? result.value : null;
}

function valueOr<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function createEmptyHome(): HomeResponse {
  return {
    availableEpisodeCount: 0,
    canStartMatch: false,
    today: "",
    todayEpisode: null,
    upcomingEvents: [],
  };
}

function createEmptyEpisodeList(): EpisodeListResponse {
  return { hasNext: false, items: [], nextCursor: null };
}
