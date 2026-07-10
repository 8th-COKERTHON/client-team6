"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MockHeader,
  MockPageFrame,
} from "@/components/mock/mock-shell";
import {
  getEpisode,
  getLastCompletedSession,
  getRankedEpisodes,
  getSessionStandings,
  getSessionTypeLabel,
  type MockEpisode,
  type MockSession,
} from "@/lib/mock-flow";
import annualBeltImage from "@/public/images/ranking/champion-belt-annual.png";
import monthlyBeltImage from "@/public/images/ranking/champion-belt-monthly.png";

export function MockResults() {
  const { state } = useMockApp();
  const session = getLastCompletedSession(state);

  if (!session) {
    return null;
  }

  const standings = getSessionStandings(state, session);
  const monthlyChampion = getEpisode(state, session.monthlyChampionId);
  const annualChampion = getEpisode(state, session.annualChampionId);
  const winner = getEpisode(state, session.winnerEpisodeId) ?? standings[0];
  const placementEpisode =
    session.type === "DEBUT"
      ? getEpisode(state, session.participantIds[0])
      : undefined;
  const highlightedEpisode = placementEpisode ?? winner;
  const globalRank = highlightedEpisode
    ? getRankedEpisodes(state.episodes).findIndex(
        (episode) => episode.id === highlightedEpisode.id,
      ) + 1
    : 0;

  return (
    <MockPageFrame withNavigation>
      <MockHeader backHref="/mock/home" title="매치 결과" />

      <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold text-[#ff5b5d]">
            {getSessionTypeLabel(session.type)}
          </p>
          <h1 className="mt-2 text-xl font-semibold leading-[1.4] text-white">
            {session.type === "MONTHLY"
              ? "타이틀전까지 완료되었습니다"
              : "모든 판정이 완료되었습니다"}
          </h1>
          <p className="mt-2 text-sm font-medium text-[#b1b9c5]">
            {session.matches.length}개 매치 결과가 로컬 랭킹에 반영됐습니다.
          </p>
        </div>

        {session.type === "MONTHLY" ? (
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
              <p className="shrink-0 text-sm font-semibold text-[#ff5b5d]">
                전체 {globalRank}위
              </p>
            </div>
            {placementEpisode ? (
              <p className="mt-3 text-sm font-medium text-[#b1b9c5]">
                {placementEpisode.score}점 · {placementEpisode.wins}승 {placementEpisode.losses}패
              </p>
            ) : null}
          </div>
        ) : null}

        <SessionRanking session={session} standings={standings} />

        <div className="mt-8 grid grid-cols-2 gap-2">
          <Link
            className="flex h-[48px] items-center justify-center rounded-xl bg-[#292e38] text-sm font-semibold text-white"
            href="/mock/home"
          >
            홈으로
          </Link>
          <Link
            className="flex h-[48px] items-center justify-center rounded-xl bg-[#ff0002] text-sm font-semibold text-white"
            href="/mock/ranking"
          >
            전체 랭킹
          </Link>
        </div>
      </section>
    </MockPageFrame>
  );
}

function ChampionResult({
  beltImage,
  episode,
  label,
}: {
  beltImage: StaticImageData;
  episode?: MockEpisode;
  label: string;
}) {
  return (
    <article className="grid min-h-[112px] grid-cols-[minmax(0,1fr)_8rem] items-center gap-3 overflow-hidden rounded-2xl border border-[#ff0002]/30 bg-[#292e38] p-4">
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
  session,
  standings,
}: {
  session: MockSession;
  standings: MockEpisode[];
}) {
  const wins = new Map<number, number>();

  session.matches.forEach((match) => {
    if (match.winnerEpisodeId !== undefined) {
      wins.set(match.winnerEpisodeId, (wins.get(match.winnerEpisodeId) ?? 0) + 1);
    }
  });

  return (
    <section className="mt-8" aria-labelledby="mock-session-ranking-title">
      <h2 className="text-base font-semibold text-white" id="mock-session-ranking-title">
        세션 순위
      </h2>
      <div className="mt-3 divide-y divide-[#363d48] border-y border-[#363d48]">
        {standings.slice(0, 10).map((episode, index) => (
          <div
            className="flex min-h-[58px] items-center justify-between gap-4 py-3"
            key={episode.id}
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
              {wins.get(episode.id) ?? 0}승 · {episode.score}점
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
