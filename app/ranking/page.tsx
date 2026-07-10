import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { SVGProps } from "react";
import { auth } from "@/auth";
import { BottomNavigation } from "@/components/bottom-navigation";
import {
  ChampionSummary,
  type RankingChampion,
} from "@/components/ranking/champion-summary";
import {
  RankingListCard,
  type RankingEntry,
} from "@/components/ranking/ranking-list-card";
import appIcon from "@/public/icons/mme-icon-192.png";

export const metadata = {
  title: "랭킹 | MME",
};

const MOCK_CHAMPIONS = [
  {
    englishLabel: "All-Time Champion",
    label: "올타임 챔피언",
    scope: "all-time",
    title: "취업 최종 탈락",
  },
  {
    englishLabel: "Annual Champion",
    label: "연간 챔피언",
    scope: "annual",
    title: "취업 최종 탈락",
  },
  {
    englishLabel: "Monthly Champion",
    label: "월간 챔피언",
    scope: "monthly",
    title: "취업 최종 탈락",
  },
] as const satisfies readonly RankingChampion[];

const MOCK_RANKINGS = [
  { rank: 1, score: 1200, title: "취업 최종 탈락" },
  { rank: 2, score: 1200, title: "취업 최종 탈락" },
  { rank: 3, score: 1200, title: "취업 최종 탈락" },
  { rank: 4, score: 1200, title: "취업 최종 탈락" },
  { rank: 5, score: 1200, title: "취업 최종 탈락" },
  { rank: 6, score: 1200, title: "취업 최종 탈락" },
  { rank: 7, score: 1200, title: "취업 최종 탈락" },
] as const satisfies readonly RankingEntry[];

export default async function RankingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  return <RankingScreen />;
}

function RankingScreen() {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RankingHeader />

        <section className="relative z-10 px-4 pt-[calc(env(safe-area-inset-top)+7.625rem)] pb-[calc(8.5rem+env(safe-area-inset-bottom))]">
          <RankingSearchBox />
          <ChampionSummary champions={MOCK_CHAMPIONS} />
          <div className="my-6 h-px w-full bg-[#292e38]" />
          <RankingList entries={MOCK_RANKINGS} />
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
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-[8.4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        href="/"
      >
        <Image
          alt="MME"
          className="h-full w-full object-cover"
          priority
          src={appIcon}
        />
      </Link>
      <span aria-hidden="true" className="size-6" />
    </header>
  );
}

function RankingSearchBox() {
  return (
    <div
      aria-label="랭킹 검색"
      className="flex h-[3.25rem] w-full items-center justify-between rounded-xl bg-[#292e38] px-4 text-[#b1b9c5]"
      role="search"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <SearchIcon className="size-6 shrink-0" />
        <span className="truncate text-base font-medium leading-[1.4]">
          제목이나 내용으로 검색해보세요.
        </span>
      </div>
      <button
        aria-label="랭킹 새로고침"
        className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-full text-[#b1b9c5] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
        type="button"
      >
        <RefreshIcon className="size-5" />
      </button>
    </div>
  );
}

function RankingList({ entries }: { entries: readonly RankingEntry[] }) {
  return (
    <section aria-labelledby="ranking-list-title">
      <h1
        className="px-0 text-base font-semibold leading-[1.4] text-white"
        id="ranking-list-title"
      >
        랭킹
      </h1>
      <div className="mt-4 -mx-4 flex flex-col">
        {entries.map((entry) => (
          <RankingListCard entry={entry} key={entry.rank} />
        ))}
      </div>
    </section>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
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
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
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
