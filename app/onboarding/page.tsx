import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getEpisodes, getOnboardingStatus } from "@/lib/backend-api";

export const metadata = {
  title: "온보딩 | MME",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.onboardingCompleted === true) {
    redirect("/");
  }

  const [statusResult, episodesResult] = await Promise.allSettled([
    getOnboardingStatus(),
    getEpisodes({ size: 5 }),
  ]);
  const onboardingStatus =
    statusResult.status === "fulfilled" ? statusResult.value : null;

  if (onboardingStatus?.activePlacementSessionId) {
    redirect(
      `/ring?sessionId=${onboardingStatus.activePlacementSessionId}&flow=onboarding`,
    );
  }

  const initialEpisodes =
    episodesResult.status === "fulfilled"
      ? episodesResult.value.items
          .slice()
          .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
          .slice(0, 5)
          .map((episode) => ({
            content: episode.contentPreview,
            date: episode.episodeDate.replaceAll("-", "."),
            episodeId: episode.episodeId,
            title: episode.title,
          }))
      : [];

  return <OnboardingFlow initialEpisodes={initialEpisodes} />;
}
