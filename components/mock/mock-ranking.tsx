"use client";

import { useMockApp } from "@/components/mock/mock-app-provider";
import { MockPageFrame } from "@/components/mock/mock-shell";
import {
  ChampionSummary,
  type RankingChampion,
} from "@/components/ranking/champion-summary";
import { RankingListCard } from "@/components/ranking/ranking-list-card";
import { getEpisode, getRankedEpisodes } from "@/lib/mock-flow";

export function MockRanking() {
  const { state } = useMockApp();
  const rankings = getRankedEpisodes(state.episodes);
  const champions = createChampionSummary(state);

  return (
    <MockPageFrame withNavigation>
      <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-[calc(max(env(safe-area-inset-top),44px)+7.5rem)]">
        <ChampionSummary champions={champions} />

        <section className="mt-8 border-t border-[#292e38] pt-6" aria-labelledby="mock-ranking-list-title">
          <h2 className="text-base font-semibold text-white" id="mock-ranking-list-title">
            랭킹
          </h2>
          <div className="-mx-4 mt-3 flex flex-col">
            {rankings.map((episode, index) => (
              <div className="border-b border-[#292e38]" key={episode.id}>
                <RankingListCard
                  entry={{
                    rank: index + 1,
                    score: episode.score,
                    title: episode.title,
                  }}
                />
              </div>
            ))}
          </div>
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
