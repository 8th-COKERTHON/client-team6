"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MockArenaBackground,
  MockHeader,
  MockPageFrame,
} from "@/components/mock/mock-shell";
import {
  getActiveSession,
  getEpisode,
  getSessionTypeLabel,
} from "@/lib/mock-flow";

export function MockHome() {
  const router = useRouter();
  const { reset, startMonthly, startWeekly, state } = useMockApp();
  const activeSession = getActiveSession(state);
  const allTimeChampion = getEpisode(state, state.champions.allTimeEpisodeId);
  const userEpisodeCount = state.episodes.filter(
    (episode) => episode.origin === "USER",
  ).length;

  function resetFlow() {
    reset();
    router.replace("/mock/onboarding");
  }

  function startEvent(type: "weekly" | "monthly") {
    const didStart = type === "weekly" ? startWeekly() : startMonthly();

    if (didStart) {
      router.push("/mock/ring");
    }
  }

  return (
    <MockPageFrame withNavigation>
      <MockArenaBackground />
      <MockHeader onReset={resetFlow} />

      <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#b1b9c5]">
              API 연결 없는 독립 실행 모드
            </p>
            <h1 className="mt-1 text-xl font-semibold leading-[1.4] text-white">
              오늘도 링은 열려 있습니다
            </h1>
          </div>
          <span className="rounded-full bg-[#292e38] px-3 py-1 text-xs font-semibold text-[#f0f0f2]">
            {userEpisodeCount} EP
          </span>
        </div>

        {activeSession ? (
          <Link
            className="mt-6 flex min-h-[88px] items-center justify-between rounded-[20px] border border-[#ff0002]/50 bg-[#292e38] p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
            href="/mock/ring"
          >
            <span className="min-w-0">
              <span className="text-xs font-semibold text-[#ff5b5d]">
                진행 중
              </span>
              <span className="mt-1 block truncate text-lg font-semibold text-white">
                {getSessionTypeLabel(activeSession.type)}
              </span>
              <span className="mt-1 block text-[13px] font-medium text-[#b1b9c5]">
                {activeSession.currentMatchIndex + 1}/{activeSession.totalRounds} 매치
              </span>
            </span>
            <span className="ml-4 text-sm font-semibold text-white">계속하기</span>
          </Link>
        ) : (
          <Link
            className="group mt-6 flex min-h-[88px] items-center justify-between rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
            href="/mock/episodes/new"
          >
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-white">
                새 에피소드 등록
              </span>
              <span className="mt-1.5 block text-[13px] font-medium text-[#b1b9c5]">
                등록 후 점수가 가까운 5개 에피소드와 배치전
              </span>
            </span>
            <span className="ml-4 flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#ff0002] text-2xl font-light text-white transition-transform group-hover:rotate-90">
              +
            </span>
          </Link>
        )}

        <section className="mt-8" aria-labelledby="mock-event-title">
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold text-white" id="mock-event-title">
              지금 진행 가능한 쇼
            </h2>
            <span className="text-xs font-medium text-[#b1b9c5]">상시 오픈</span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <EventButton
              description="최신 에피소드 vs 오래된 에피소드 3매치 + 유사 점수 라이벌 2매치"
              disabled={Boolean(activeSession)}
              label="Weekly Show"
              onClick={() => startEvent("weekly")}
              tag="5 MATCHES"
            />
            <EventButton
              description="상위 10개 에피소드의 승자연전 9게임 후 연간 타이틀전"
              disabled={Boolean(activeSession)}
              label="Monthly Royal Rumble"
              onClick={() => startEvent("monthly")}
              tag="9 + TITLE"
            />
          </div>
        </section>

        <section className="mt-8 border-t border-[#292e38] pt-6">
          <p className="text-[13px] font-medium text-[#b1b9c5]">현재 올타임 챔피언</p>
          <p className="mt-2 truncate text-lg font-semibold text-white">
            {allTimeChampion?.title ?? "첫 리그 결과를 기다리는 중"}
          </p>
        </section>
      </section>
    </MockPageFrame>
  );
}

function EventButton({
  description,
  disabled,
  label,
  onClick,
  tag,
}: {
  description: string;
  disabled: boolean;
  label: string;
  onClick: () => void;
  tag: string;
}) {
  return (
    <button
      className="min-h-[102px] w-full rounded-2xl bg-[#292e38] px-5 py-4 text-left transition-colors hover:bg-[#313742] disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="truncate text-base font-semibold text-[#f0f0f2]">{label}</span>
        <span className="shrink-0 rounded-full bg-[#363d48] px-2.5 py-1 text-[10px] font-semibold text-[#ff7b7d]">
          {disabled ? "진행 중 매치 우선" : tag}
        </span>
      </span>
      <span className="mt-2 block text-[13px] font-medium leading-[1.5] text-[#b1b9c5]">
        {description}
      </span>
    </button>
  );
}
