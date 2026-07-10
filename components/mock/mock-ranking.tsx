"use client";

import { useMemo, useState } from "react";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MockHeader,
  MockPageFrame,
} from "@/components/mock/mock-shell";
import {
  ChampionSummary,
  type RankingChampion,
} from "@/components/ranking/champion-summary";
import { RankingListCard } from "@/components/ranking/ranking-list-card";
import { getEpisode, getRankedEpisodes } from "@/lib/mock-flow";

export function MockRanking() {
  const { state } = useMockApp();
  const [query, setQuery] = useState("");
  const rankings = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");

    return getRankedEpisodes(state.episodes).filter((episode) =>
      normalizedQuery
        ? `${episode.title} ${episode.content}`
            .toLocaleLowerCase("ko-KR")
            .includes(normalizedQuery)
        : true,
    );
  }, [query, state.episodes]);
  const champions = createChampionSummary(state);

  return (
    <MockPageFrame withNavigation>
      <MockHeader backHref="/mock/home" title="랭킹" />

      <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-6">
        <label className="flex h-[52px] items-center gap-2 rounded-xl bg-[#292e38] px-4 text-[#b1b9c5]">
          <SearchIcon />
          <span className="sr-only">랭킹 검색</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-[#b1b9c5]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="제목이나 내용으로 검색"
            type="search"
            value={query}
          />
        </label>

        <ChampionSummary champions={champions} />

        <section className="mt-8 border-t border-[#292e38] pt-6" aria-labelledby="mock-ranking-list-title">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white" id="mock-ranking-list-title">
              전체 랭킹
            </h2>
            <span className="text-xs font-medium text-[#b1b9c5]">
              승수 우선 · 점수 동률 정렬
            </span>
          </div>
          <div className="-mx-4 mt-3 flex flex-col">
            {rankings.map((episode) => {
              const rank = getRankedEpisodes(state.episodes).findIndex(
                (item) => item.id === episode.id,
              ) + 1;

              return (
                <div className="border-b border-[#292e38]" key={episode.id}>
                  <RankingListCard
                    entry={{
                      rank,
                      score: episode.score,
                      title: episode.title,
                    }}
                  />
                </div>
              );
            })}
          </div>
          {rankings.length === 0 ? (
            <p className="py-12 text-center text-sm font-medium text-[#b1b9c5]">
              일치하는 에피소드가 없습니다.
            </p>
          ) : null}
        </section>
      </section>
    </MockPageFrame>
  );
}

function createChampionSummary(
  state: ReturnType<typeof useMockApp>["state"],
): readonly RankingChampion[] {
  const allTime = getEpisode(state, state.champions.allTimeEpisodeId);
  const annual = getEpisode(state, state.champions.annualEpisodeId);
  const monthly = getEpisode(state, state.champions.monthlyEpisodeId);

  return [
    {
      englishLabel: "All-Time Champion",
      label: "올타임 챔피언",
      scope: "all-time",
      title: allTime?.title ?? "첫 결과 집계 중",
    },
    {
      englishLabel: "Annual Champion",
      label: "연간 챔피언",
      scope: "annual",
      title: annual?.title ?? "미정",
    },
    {
      englishLabel: "Monthly Champion",
      label: "월간 챔피언",
      scope: "monthly",
      title: monthly?.title ?? "미정",
    },
  ];
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
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
