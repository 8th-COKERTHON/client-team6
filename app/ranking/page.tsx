import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { SVGProps } from "react";
import { auth } from "@/auth";
import { BottomNavigation } from "@/components/bottom-navigation";
import {
  ChampionSummary,
  type ChampionScope,
  type RankingChampion,
} from "@/components/ranking/champion-summary";
import {
  RankingListCard,
  type RankingEntry,
} from "@/components/ranking/ranking-list-card";
import {
  getAllEpisodes,
  getChampionHistory,
  getRankingsForEpisodeIds,
  searchAllEpisodes,
} from "@/lib/backend-api";
import type {
  ChampionHistoryItemResponse,
  RankingItemResponse,
} from "@/lib/backend-types";
import appIcon from "@/public/icons/mme-icon-192.png";

type RankingPageProps = {
  searchParams: Promise<{
    page?: string | string[];
    query?: string | string[];
  }>;
};

const PAGE_SIZE = 20;

export const metadata = {
  title: "랭킹 | MME",
};

export default async function RankingPage({ searchParams }: RankingPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  const queryParams = await searchParams;
  const query = getFirstValue(queryParams.query)?.trim() ?? "";
  const page = parsePage(queryParams.page);
  const [episodesResult, championHistoryResult, searchedEpisodesResult] =
    await Promise.allSettled([
      getAllEpisodes(),
      getChampionHistory(undefined, 50),
      query ? searchAllEpisodes(query) : Promise.resolve(null),
    ]);
  const episodes = valueOr(episodesResult, []);
  const episodeIds = new Set(episodes.map((episode) => episode.episodeId));
  const rankingItems = await loadPersonalRankings(episodeIds);
  const personalRankings = createPersonalRankings(rankingItems);
  const searchedEpisodes = valueOr(searchedEpisodesResult, null);
  const searchedEpisodeIds = searchedEpisodes
    ? new Set(searchedEpisodes.map((episode) => episode.episodeId))
    : null;
  const filteredRankings = searchedEpisodeIds
    ? personalRankings.filter((ranking) =>
        searchedEpisodeIds.has(ranking.episodeId),
      )
    : personalRankings;
  const start = page * PAGE_SIZE;
  const displayedRankings = filteredRankings.slice(start, start + PAGE_SIZE);
  const championHistory = valueOr(
    championHistoryResult,
    [] as ChampionHistoryItemResponse[],
  ).filter((champion) => episodeIds.has(champion.episodeId));
  const champions = createChampionSummary(championHistory, personalRankings);

  return (
    <RankingScreen
      champions={champions}
      entries={displayedRankings.map(toRankingEntry)}
      hasNext={start + PAGE_SIZE < filteredRankings.length}
      page={page}
      query={query}
      totalElements={filteredRankings.length}
    />
  );
}

async function loadPersonalRankings(episodeIds: Set<number>) {
  try {
    return await getRankingsForEpisodeIds(episodeIds);
  } catch {
    return [];
  }
}

function createPersonalRankings(rankings: RankingItemResponse[]) {
  return rankings
    .slice()
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.rank - right.rank ||
        left.episodeId - right.episodeId,
    )
    .map((ranking, index) => ({ ...ranking, rank: index + 1 }));
}

function RankingScreen({
  champions,
  entries,
  hasNext,
  page,
  query,
  totalElements,
}: {
  champions: RankingChampion[];
  entries: RankingEntry[];
  hasNext: boolean;
  page: number;
  query: string;
  totalElements: number;
}) {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RankingHeader />

        <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+7.625rem)]">
          <RankingSearchBox query={query} />
          <ChampionSummary champions={champions} />
          <div className="my-6 h-px w-full bg-[#292e38]" />
          <RankingList entries={entries} totalElements={totalElements} />
          <RankingPagination hasNext={hasNext} page={page} query={query} />
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function RankingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-[calc(env(safe-area-inset-top)+6.125rem)] items-end justify-between px-4 pb-[1.125rem]">
      <Link
        aria-label="홈"
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-[8px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        href="/"
      >
        <Image alt="MME" className="h-full w-full object-cover" priority src={appIcon} />
      </Link>
      <span aria-hidden className="size-6" />
    </header>
  );
}

function RankingSearchBox({ query }: { query: string }) {
  return (
    <form
      action="/ranking"
      className="flex h-[3.25rem] w-full items-center rounded-xl bg-[#292e38] px-4 text-[#b1b9c5]"
      role="search"
    >
      <SearchIcon className="size-6 shrink-0" />
      <label className="sr-only" htmlFor="ranking-query">
        랭킹 검색
      </label>
      <input
        className="min-w-0 flex-1 bg-transparent px-2 text-base font-medium leading-[1.4] text-white outline-none placeholder:text-[#b1b9c5]"
        defaultValue={query}
        id="ranking-query"
        name="query"
        placeholder="제목이나 내용으로 검색해보세요."
        type="search"
      />
      <button
        aria-label="랭킹 검색"
        className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-full text-[#b1b9c5] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
        type="submit"
      >
        <RefreshIcon className="size-5" />
      </button>
    </form>
  );
}

function RankingList({
  entries,
  totalElements,
}: {
  entries: RankingEntry[];
  totalElements: number;
}) {
  return (
    <section aria-labelledby="ranking-list-title">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold leading-[1.4] text-white" id="ranking-list-title">
          랭킹
        </h1>
        <span className="text-xs font-medium text-[#b1b9c5]">{totalElements}개</span>
      </div>
      {entries.length > 0 ? (
        <div className="-mx-4 mt-4 flex flex-col">
          {entries.map((entry) => (
            <RankingListCard entry={entry} key={entry.episodeId} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm font-medium text-[#b1b9c5]">
          표시할 랭킹이 없습니다.
        </p>
      )}
    </section>
  );
}

function RankingPagination({
  hasNext,
  page,
  query,
}: {
  hasNext: boolean;
  page: number;
  query: string;
}) {
  if (page === 0 && !hasNext) return null;

  return (
    <nav aria-label="랭킹 페이지" className="mt-6 grid grid-cols-2 gap-2">
      <PaginationLink disabled={page === 0} href={createPageHref(page - 1, query)}>
        이전
      </PaginationLink>
      <PaginationLink disabled={!hasNext} href={createPageHref(page + 1, query)}>
        다음
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  children,
  disabled,
  href,
}: {
  children: string;
  disabled: boolean;
  href: string;
}) {
  return (
    <Link
      aria-disabled={disabled}
      className={[
        "flex h-11 items-center justify-center rounded-xl text-sm font-semibold",
        disabled
          ? "pointer-events-none bg-[#292e38] text-[#575e6a]"
          : "bg-[#292e38] text-white hover:bg-[#363d48]",
      ].join(" ")}
      href={href}
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </Link>
  );
}

function createChampionSummary(
  history: ChampionHistoryItemResponse[],
  rankings: RankingItemResponse[],
) {
  const classified = new Map<ChampionScope, ChampionHistoryItemResponse>();

  history.forEach((champion) => {
    const scope = getChampionScope(champion.championTitle);
    if (scope && !classified.has(scope)) classified.set(scope, champion);
  });

  const champions: RankingChampion[] = [];
  const allTimeTitle =
    classified.get("all-time")?.episodeTitle ?? rankings[0]?.episodeTitle;

  if (allTimeTitle) {
    champions.push(createChampion("all-time", allTimeTitle));
  }

  const annualTitle = classified.get("annual")?.episodeTitle;
  if (annualTitle) {
    champions.push(createChampion("annual", annualTitle));
  }

  const monthlyTitle = classified.get("monthly")?.episodeTitle;
  if (monthlyTitle) {
    champions.push(createChampion("monthly", monthlyTitle));
  }

  return champions;
}

function createChampion(scope: ChampionScope, title: string): RankingChampion {
  const labels: Record<ChampionScope, [string, string]> = {
    "all-time": ["올타임 챔피언", "All-Time Champion"],
    annual: ["연간 챔피언", "Annual Champion"],
    monthly: ["월간 챔피언", "Monthly Champion"],
  };
  return { englishLabel: labels[scope][1], label: labels[scope][0], scope, title };
}

function getChampionScope(value: string): ChampionScope | null {
  const normalized = value.toUpperCase();
  if (normalized.includes("ALL") || value.includes("올타임")) return "all-time";
  if (normalized.includes("ANNUAL") || normalized.includes("YEAR") || value.includes("연간")) return "annual";
  if (normalized.includes("MONTH") || value.includes("월간")) return "monthly";
  return null;
}

function toRankingEntry(item: RankingItemResponse): RankingEntry {
  return {
    episodeId: item.episodeId,
    rank: item.rank,
    score: item.score,
    title: item.episodeTitle,
  };
}

function createPageHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (page > 0) params.set("page", String(page));
  const search = params.toString();
  return search ? `/ranking?${search}` : "/ranking";
}

function parsePage(value?: string | string[]) {
  const parsed = Number(getFirstValue(value));
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function getFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function valueOr<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="m20 20-4.2-4.2m2.2-5.3a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <path
        d="M20 11a8.1 8.1 0 0 0-14.1-4.9L4 8m0 0h5M4 8V3m0 10a8.1 8.1 0 0 0 14.1 4.9L20 16m0 0h-5m5 0v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
