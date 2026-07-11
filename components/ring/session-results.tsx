import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import annualBeltImage from "@/public/images/ranking/champion-belt-annual.png";
import monthlyBeltImage from "@/public/images/ranking/champion-belt-monthly.png";

export type SessionHistoryEpisode = {
  content: string;
  episodeDate: string;
  episodeId: number;
  losses: number;
  score: number;
  title: string;
  titleName?: string | null;
  wins: number;
};

export type SessionHistory = {
  completedMatches: number;
  episodeRank?: number;
  episodes: Record<string, SessionHistoryEpisode>;
  flow: "onboarding" | "placement" | "show";
  placementEpisodeId?: number;
  sessionId: number;
  totalMatches: number;
  type: string;
  winnerIds: number[];
};

export function SessionResults({ history }: { history: SessionHistory }) {
  const standings = Object.values(history.episodes).sort(compareEpisodes);
  const placementEpisode = history.placementEpisodeId
    ? history.episodes[String(history.placementEpisodeId)]
    : undefined;
  const highlightedEpisode = placementEpisode ?? standings[0];
  const isMonthly = history.type.toUpperCase().includes("MONTH");
  const monthlyWinnerIndex = Math.max(
    0,
    history.totalMatches >= 10
      ? history.totalMatches - 2
      : history.totalMatches - 1,
  );
  const monthlyChampion =
    history.episodes[String(history.winnerIds[monthlyWinnerIndex])] ??
    standings[0];
  const annualChampion =
    history.episodes[String(history.winnerIds.at(-1))] ?? monthlyChampion;

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] bg-[#12161b]">
        <header className="flex h-[calc(max(env(safe-area-inset-top),44px)+54px)] items-end justify-between px-4 pb-[9px]">
          <Link
            className="flex size-6 items-center justify-center text-white"
            href="/"
          >
            <BackIcon />
            <span className="sr-only">홈으로 돌아가기</span>
          </Link>
          <h1 className="text-lg font-semibold leading-[1.4]">매치 결과</h1>
          <span aria-hidden className="size-6" />
        </header>

        <section className="px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-6">
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold text-[#ff5b5d]">
              {getSessionTypeLabel(history.type, history.flow)}
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-[1.4] text-white">
              {isMonthly
                ? "타이틀전까지 완료되었습니다"
                : "모든 판정이 완료되었습니다"}
            </h2>
            <p className="mt-2 text-sm font-medium text-[#b1b9c5]">
              {history.completedMatches}개 매치 결과가 랭킹에 반영됐습니다.
            </p>
          </div>

          {isMonthly ? (
            <div className="mt-8 flex flex-col gap-3">
              <ChampionResult
                beltImage={monthlyBeltImage}
                episode={monthlyChampion}
                label="월간 챔피언"
              />
              <ChampionResult
                beltImage={annualBeltImage}
                episode={annualChampion}
                label="연간 챔피언"
              />
            </div>
          ) : highlightedEpisode ? (
            <div className="mt-8 rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] p-5">
              <p className="text-[13px] font-medium text-[#b1b9c5]">
                {placementEpisode ? "신규 에피소드 배치 결과" : "이번 세션 1위"}
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="min-w-0 truncate text-lg font-semibold text-white">
                  {highlightedEpisode.title}
                </p>
                {history.episodeRank ? (
                  <p className="shrink-0 text-sm font-semibold text-[#ff5b5d]">
                    전체 {history.episodeRank}위
                  </p>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-medium text-[#b1b9c5]">
                {highlightedEpisode.score}점 · {highlightedEpisode.wins}승{" "}
                {highlightedEpisode.losses}패
              </p>
            </div>
          ) : null}

          <SessionRanking standings={standings} />

          <div className="mt-8 grid grid-cols-2 gap-2">
            <Link
              className="flex h-12 items-center justify-center rounded-xl bg-[#292e38] text-sm font-semibold text-white"
              href="/"
            >
              홈으로
            </Link>
            <Link
              className="flex h-12 items-center justify-center rounded-xl bg-[#ff0002] text-sm font-semibold text-white"
              href="/ranking"
            >
              전체 랭킹
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function ChampionResult({
  beltImage,
  episode,
  label,
}: {
  beltImage: StaticImageData;
  episode?: SessionHistoryEpisode;
  label: string;
}) {
  return (
    <article className="grid min-h-28 grid-cols-[minmax(0,1fr)_8rem] items-center gap-3 overflow-hidden rounded-2xl border border-[#ff0002]/30 bg-[#292e38] p-4">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#b1b9c5]">{label}</p>
        <p className="mt-2 line-clamp-2 text-base font-semibold leading-[1.4] text-white">
          {episode?.title ?? "미정"}
        </p>
        {episode ? (
          <p className="mt-2 text-xs font-semibold text-[#ff5b5d]">
            {episode.score}점
          </p>
        ) : null}
      </div>
      <div className="relative h-16 w-32">
        <Image
          alt={`${label} 타이틀 벨트`}
          className="object-contain"
          fill
          sizes="128px"
          src={beltImage}
        />
      </div>
    </article>
  );
}

function SessionRanking({
  standings,
}: {
  standings: SessionHistoryEpisode[];
}) {
  return (
    <section aria-labelledby="session-ranking-title" className="mt-8">
      <h2 className="text-base font-semibold text-white" id="session-ranking-title">
        세션 순위
      </h2>
      <div className="mt-3 divide-y divide-[#363d48] border-y border-[#363d48]">
        {standings.slice(0, 10).map((episode, index) => (
          <div
            className="flex min-h-[58px] items-center justify-between gap-4 py-3"
            key={episode.episodeId}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#292e38] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="truncate text-sm font-semibold text-[#f0f0f2]">
                {episode.title}
              </span>
            </div>
            <span className="shrink-0 text-xs font-medium text-[#b1b9c5]">
              {episode.wins}승 · {episode.score}점
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function compareEpisodes(
  left: SessionHistoryEpisode,
  right: SessionHistoryEpisode,
) {
  return (
    right.wins - left.wins ||
    right.score - left.score ||
    left.episodeId - right.episodeId
  );
}

function getSessionTypeLabel(type: string, flow: SessionHistory["flow"]) {
  const normalizedType = type.toUpperCase();

  if (flow === "onboarding") return "온보딩 배치전";
  if (flow === "placement") return "데뷔 매치";
  if (normalizedType.includes("MONTH")) return "Monthly Royal Rumble";
  if (normalizedType.includes("WEEK")) return "Weekly Show";
  return type || "매치";
}

function BackIcon() {
  return (
    <svg aria-hidden fill="none" viewBox="0 0 24 24">
      <path
        d="m15 5-7 7 7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
