import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EpisodeDetail } from "@/components/episodes/episode-detail";
import { BackendApiError, getEpisodeDetail } from "@/lib/backend-api";

type EpisodeDetailPageProps = {
  params: Promise<{ episodeId: string }>;
};

export const metadata = {
  title: "에피소드 상세 | MME",
};

export default async function EpisodeDetailPage({
  params,
}: EpisodeDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const episodeId = Number((await params).episodeId);

  if (!Number.isInteger(episodeId) || episodeId <= 0) {
    notFound();
  }

  let episode;

  try {
    episode = await getEpisodeDetail(episodeId);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return <EpisodeDetail episode={episode} />;
}
