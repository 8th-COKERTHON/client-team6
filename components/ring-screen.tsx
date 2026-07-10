"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ActionButton, ActionButtonLink } from "@/components/ui/action-button";

type ActiveEvent = {
  displayDate?: string | null;
  endsAt?: string | null;
  eventId?: number | null;
  roundCount?: number | null;
  scoreReward?: number | null;
  startsAt?: string | null;
  status?: string | null;
  title?: string | null;
  type?: string | null;
};

type AvailableEpisode = {
  content?: string | null;
  episodeDate?: string | null;
  episodeId?: number | null;
  losses?: number | null;
  score?: number | null;
  status?: string | null;
  title?: string | null;
  titleScore?: number | null;
  wins?: number | null;
};

type EpisodeCard = AvailableEpisode;

type ActiveMatch = {
  completedRounds?: number | null;
  currentRound?: number | null;
  episodeA?: EpisodeCard | null;
  episodeB?: EpisodeCard | null;
  eventTitle?: string | null;
  eventType?: string | null;
  matchId?: number | null;
  sessionId?: number | null;
  status?: string | null;
  totalRounds?: number | null;
};

export type RingScreenData = {
  activeEvents?: ActiveEvent[] | null;
  activeMatch?: ActiveMatch | null;
  activeQuestion?: unknown;
  availableEpisodes?: AvailableEpisode[] | null;
};

type RingScreenProps = {
  data?: RingScreenData;
  errorMessage?: string;
};

type BattleSide = "a" | "b";

type BattleRound = {
  episodeA: EpisodeCard;
  episodeB: EpisodeCard;
};

type RingView = "empty" | "list" | "battle" | "complete";

const SAMPLE_EPISODES = [
  {
    content:
      "최종 면접 결과를 기다렸지만 아쉽게 탈락했다. 오랫동안 준비했던 만큼 허탈함과 자신감이 크게 흔들렸다.",
    episodeDate: "2026-07-10",
    episodeId: 1,
    losses: 2,
    score: 1000,
    title: "취업 최종 탈락",
    wins: 5,
  },
  {
    content:
      "좋은 분위기라고 생각했던 소개팅 이후 갑자기 연락이 끊겼다. 이유를 알 수 없어 더 오래 신경 쓰였다.",
    episodeDate: "2026-07-10",
    episodeId: 2,
    losses: 2,
    score: 1000,
    title: "세 번째 소개팅 연락 두절",
    wins: 5,
  },
] satisfies EpisodeCard[];

export function RingScreen({ data, errorMessage }: RingScreenProps) {
  const activeEvents = useMemo(() => data?.activeEvents ?? [], [data?.activeEvents]);
  const availableEpisodes = useMemo(
    () => data?.availableEpisodes ?? [],
    [data?.availableEpisodes],
  );
  const activeMatch = data?.activeMatch ?? null;
  const initialView = getInitialView(activeEvents, activeMatch);
  const [view, setView] = useState<RingView>(initialView);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<BattleSide | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const selectedEvent = activeEvents[selectedEventIndex] ?? activeEvents[0] ?? null;
  const rounds = useMemo(
    () =>
      createBattleRounds({
        activeMatch,
        availableEpisodes,
        selectedEvent,
      }),
    [activeMatch, availableEpisodes, selectedEvent],
  );
  const currentRound = rounds[roundIndex] ?? rounds[0];
  const completedScore = getEpisodeScore(
    selectedSide === "b" ? currentRound?.episodeB : currentRound?.episodeA,
  );

  function goToEventList() {
    resetBattle();
    setView(activeEvents.length > 0 ? "list" : "empty");
  }

  function startEvent(index: number) {
    setSelectedEventIndex(index);
    resetBattle();
    setView("battle");
  }

  function selectWinner(side: BattleSide) {
    setSelectedSide(side);
  }

  function moveNextRound() {
    if (!selectedSide) {
      return;
    }

    const nextRoundIndex = roundIndex + 1;

    if (nextRoundIndex >= rounds.length) {
      setView("complete");
      return;
    }

    setRoundIndex(nextRoundIndex);
    setSelectedSide(null);
    setIsDetailMode(false);
  }

  function resetBattle() {
    setRoundIndex(0);
    setSelectedSide(null);
    setIsDetailMode(false);
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RingArenaBackground isSubtle={view === "battle"} />
        <RingHeader
          onBack={view === "battle" || view === "complete" ? goToEventList : undefined}
        />

        {errorMessage ? (
          <RingErrorState message={errorMessage} />
        ) : view === "empty" ? (
          <EmptyRingState />
        ) : view === "list" ? (
          <EventListScreen events={activeEvents} onSelectEvent={startEvent} />
        ) : view === "complete" ? (
          <CompleteScreen score={completedScore} />
        ) : currentRound ? (
          <BattleScreen
            currentRound={currentRound}
            event={selectedEvent}
            isDetailMode={isDetailMode}
            onMoveNext={moveNextRound}
            onSelectWinner={selectWinner}
            onToggleDetail={() => setIsDetailMode((value) => !value)}
            roundIndex={roundIndex}
            selectedSide={selectedSide}
            totalRounds={rounds.length}
          />
        ) : (
          <EmptyRingState />
        )}
      </div>
    </main>
  );
}

function EmptyRingState() {
  return (
    <>
      <section className="relative z-10 flex min-h-svh items-start justify-center px-4 pt-[calc(max(env(safe-area-inset-top),44px)+105px)]">
        <h1 className="w-full text-center text-xl font-semibold leading-[1.4] text-white">
          현재 진행할 수 있는 매치가 없습니다.
        </h1>
      </section>
      <BottomHomeIndicator />
    </>
  );
}

function EventListScreen({
  events,
  onSelectEvent,
}: {
  events: ActiveEvent[];
  onSelectEvent: (index: number) => void;
}) {
  return (
    <>
      <section className="relative z-10 px-[18px] pt-[calc(max(env(safe-area-inset-top),44px)+78px)] pb-[calc(3rem+env(safe-area-inset-bottom))]">
        <h1 className="text-base font-semibold leading-[1.4] text-white">
          진행할 수 있는 매치
        </h1>
        <div className="mt-4 flex flex-col gap-3">
          {events.map((event, index) => (
            <button
              className={[
                "group flex min-h-[74px] w-full items-center justify-between rounded-2xl",
                "px-5 py-3.5 text-left transition-transform hover:-translate-y-0.5",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
                "focus-visible:outline-[#ff0002]",
                index === 0
                  ? "bg-[#292e38]"
                  : "bg-[linear-gradient(102deg,#292e38_0%,rgba(41,46,56,0.6)_100%)]",
              ].join(" ")}
              key={getEventKey(event, index)}
              onClick={() => onSelectEvent(index)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={[
                    "mt-[3px] size-2 shrink-0 self-start rounded-full",
                    index === 0 ? "bg-[#ff0002]" : "bg-[#87919e]",
                  ].join(" ")}
                />
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold leading-[1.4] text-[#f0f0f2]">
                    {event.title || "이름 없는 매치"}
                  </span>
                  <span className="mt-1.5 flex min-w-0 items-center gap-2 text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
                    <span className="shrink-0">{formatEventDate(event)}</span>
                    <span aria-hidden="true" className="shrink-0">
                      |
                    </span>
                    <span className="truncate">{formatEventType(event.type)}</span>
                  </span>
                </span>
              </span>
              <ChevronRightIcon className="ml-4 size-6 shrink-0 text-[#87919e] transition-colors group-hover:text-white" />
            </button>
          ))}
        </div>
      </section>
      <BottomHomeIndicator />
    </>
  );
}

function BattleScreen({
  currentRound,
  event,
  isDetailMode,
  onMoveNext,
  onSelectWinner,
  onToggleDetail,
  roundIndex,
  selectedSide,
  totalRounds,
}: {
  currentRound: BattleRound;
  event: ActiveEvent | null;
  isDetailMode: boolean;
  onMoveNext: () => void;
  onSelectWinner: (side: BattleSide) => void;
  onToggleDetail: () => void;
  roundIndex: number;
  selectedSide: BattleSide | null;
  totalRounds: number;
}) {
  return (
    <>
      <section className="relative z-10 px-4 pt-[calc(max(env(safe-area-inset-top),44px)+78px)] pb-[calc(7.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-[285px]">
          <h1 className="text-xl font-semibold leading-[1.4] text-white">
            이번 라운드, 더 힘들었던 에피소드에 판정을 내려주세요
          </h1>
          <p className="mt-2 text-sm font-medium leading-[1.4] text-[#8b95a1]">
            카드를 눌러 승자를 선택하세요
          </p>
        </div>

        <div className="mt-[54px]">
          <RoundCounter current={roundIndex + 1} total={totalRounds} />
          <div className="mt-4 grid grid-cols-[1fr_1fr] gap-[11px]">
            <BattleCard
              episode={currentRound.episodeA}
              index={1}
              isDetailMode={isDetailMode}
              isInactive={selectedSide !== null && selectedSide !== "a"}
              isSelected={selectedSide === "a"}
              onSelect={() => onSelectWinner("a")}
              onToggleDetail={onToggleDetail}
            />
            <BattleCard
              episode={currentRound.episodeB}
              index={2}
              isDetailMode={isDetailMode}
              isInactive={selectedSide !== null && selectedSide !== "b"}
              isSelected={selectedSide === "b"}
              onSelect={() => onSelectWinner("b")}
              onToggleDetail={onToggleDetail}
            />
          </div>
        </div>

        {event?.title ? (
          <p className="sr-only">선택된 매치: {event.title}</p>
        ) : null}
      </section>

      <BottomActionArea>
        <ActionButton isActive={Boolean(selectedSide)} onClick={onMoveNext}>
          다음
        </ActionButton>
      </BottomActionArea>
    </>
  );
}

function BattleCard({
  episode,
  index,
  isDetailMode,
  isInactive,
  isSelected,
  onSelect,
  onToggleDetail,
}: {
  episode: EpisodeCard;
  index: number;
  isDetailMode: boolean;
  isInactive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleDetail: () => void;
}) {
  return (
    <article
      className={[
        "flex h-[305px] min-w-0 flex-col justify-between overflow-hidden rounded-[20px]",
        "px-3 py-4 text-left transition-all",
        isSelected
          ? "border-[1.5px] border-[#ff0002] bg-[#ff0002]/[0.08]"
          : "border border-[#363d48] bg-[#292e38]/70",
        isInactive ? "opacity-50" : "opacity-100",
      ].join(" ")}
    >
      <button
        className="flex min-h-0 flex-1 flex-col items-start text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        onClick={onSelect}
        type="button"
      >
        <span
          className={[
            "flex size-[30px] items-center justify-center rounded-full px-3 py-1",
            "text-xs font-semibold leading-[1.4] text-white",
            isSelected ? "bg-[#ff0002]" : "bg-[#363d48]",
          ].join(" ")}
        >
          {index}
        </span>
        <span className="mt-4 block w-full text-lg font-semibold leading-[1.4] text-white">
          {episode.title || "제목 없음"}
        </span>
        {isDetailMode ? (
          <span className="mt-2 line-clamp-5 block w-full text-[13px] font-medium leading-[1.6] text-white">
            {episode.content || "등록된 상세 내용이 없습니다."}
          </span>
        ) : null}
        <span className="mt-2 block w-full text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
          {formatDateLabel(episode.episodeDate)}
        </span>
      </button>

      <div className="mt-4">
        {!isDetailMode ? (
          <p className="mb-4 text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
            {formatEpisodeRecord(episode)} | {getEpisodeScore(episode)}점
          </p>
        ) : null}
        <button
          className={[
            "flex h-[34px] w-full items-center justify-center rounded-[10px]",
            "border px-2 text-[13px] font-medium leading-[1.4]",
            "text-white transition-colors focus-visible:outline focus-visible:outline-2",
            "focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]",
            isSelected ? "border-[#ff0002]/60" : "border-[#87919e]",
          ].join(" ")}
          onClick={(event) => {
            event.stopPropagation();
            onToggleDetail();
          }}
          type="button"
        >
          {isDetailMode ? "개요 보기" : "상세보기"}
        </button>
      </div>
    </article>
  );
}

function CompleteScreen({ score }: { score: number }) {
  return (
    <>
      <section className="relative z-10 flex min-h-svh flex-col items-center px-4 pt-[calc(max(env(safe-area-inset-top),44px)+211px)] pb-[calc(7.75rem+env(safe-area-inset-bottom))]">
        <div className="flex size-[120px] items-center justify-center rounded-full bg-[#ff0002]">
          <CheckIcon className="size-14 text-white" />
        </div>
        <h1 className="mt-0 text-center text-xl font-semibold leading-[1.4] text-white">
          배치전이 완료되었습니다.
        </h1>
        <div className="mt-10 flex w-full flex-col gap-3">
          <ResultRow label="오늘의 사건 점수" value={`${score}점`} />
          <ResultRow label="순위" value="0등" />
        </div>
      </section>

      <BottomActionArea>
        <ActionButtonLink href="/ranking">랭킹 보러가기</ActionButtonLink>
      </BottomActionArea>
    </>
  );
}

function RingErrorState({ message }: { message: string }) {
  return (
    <>
      <section className="relative z-10 px-4 pt-[calc(max(env(safe-area-inset-top),44px)+105px)]">
        <div className="rounded-[20px] border border-[#87919e]/30 bg-[#292e38]/80 p-5">
          <h1 className="text-base font-semibold leading-[1.4] text-[#f0f0f2]">
            링 정보를 불러오지 못했습니다
          </h1>
          <p className="mt-2 text-sm font-medium leading-[1.4] text-[#b1b9c5]">
            {message}
          </p>
        </div>
      </section>
      <BottomHomeIndicator />
    </>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[50px] items-center justify-between rounded-xl bg-[#292e38] px-5 py-3.5">
      <span className="text-base font-semibold leading-[1.4] text-[#f0f0f2]">
        {label}
      </span>
      <span className="text-base font-semibold leading-[1.4] text-[#f0f0f2]">
        {value}
      </span>
    </div>
  );
}

function RoundCounter({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-end px-1 text-sm leading-[1.4]">
      <span className="font-semibold text-[#ff0002]">{current}</span>
      <span className="font-normal text-[#b1b9c5]">/</span>
      <span className="font-normal text-[#b1b9c5]">{total}</span>
    </div>
  );
}

function BottomActionArea({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-4 pt-3">
      <div className="w-full max-w-[343px]">{children}</div>
      <HomeIndicator />
    </div>
  );
}

function BottomHomeIndicator() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      <HomeIndicator />
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="flex h-[calc(34px+env(safe-area-inset-bottom))] w-full items-end justify-center pb-[max(8px,env(safe-area-inset-bottom))]">
      <span aria-hidden="true" className="h-[5px] w-[134px] rounded-full bg-white/85" />
    </div>
  );
}

function RingArenaBackground({ isSubtle = false }: { isSubtle?: boolean }) {
  return (
    <div className="absolute inset-x-1/2 bottom-[-17.375svh] h-[clamp(50rem,115svh,58.375rem)] w-[clamp(28rem,139vw,32.5625rem)] -translate-x-1/2">
      <Image
        alt=""
        className={[
          "absolute inset-0 h-full w-full object-cover",
          isSubtle ? "opacity-25" : "opacity-50",
        ].join(" ")}
        fill
        priority
        sizes="(max-width: 375px) 139vw, 32.5625rem"
        src="/images/auth-arena-background.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#12161b_15.38%,rgba(18,22,27,0)_61.56%,#12161b_82.87%)]" />
    </div>
  );
}

function RingHeader({ onBack }: { onBack?: () => void }) {
  const className =
    "flex size-6 items-center justify-center text-white transition-colors hover:text-[#ff0002] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]";

  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-[calc(max(env(safe-area-inset-top),44px)+54px)] items-end justify-between px-4 pb-[15px]">
      {onBack ? (
        <button
          aria-label="이전 화면으로 이동"
          className={className}
          onClick={onBack}
          type="button"
        >
          <BackIcon />
        </button>
      ) : (
        <Link aria-label="이전 화면으로 이동" className={className} href="/">
          <BackIcon />
        </Link>
      )}
      <span aria-hidden="true" className="size-6" />
    </header>
  );
}

function BackIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function createBattleRounds({
  activeMatch,
  availableEpisodes,
  selectedEvent,
}: {
  activeMatch: ActiveMatch | null;
  availableEpisodes: AvailableEpisode[];
  selectedEvent: ActiveEvent | null;
}) {
  const episodes = normalizeEpisodes(activeMatch, availableEpisodes);
  const totalRounds = Math.max(
    activeMatch?.totalRounds ?? selectedEvent?.roundCount ?? 5,
    1,
  );
  const rounds: BattleRound[] = [];

  for (let index = 0; index < totalRounds; index += 1) {
    rounds.push({
      episodeA: episodes[index % episodes.length],
      episodeB: episodes[(index + 1) % episodes.length],
    });
  }

  return rounds;
}

function normalizeEpisodes(
  activeMatch: ActiveMatch | null,
  availableEpisodes: AvailableEpisode[],
) {
  const episodes = [
    activeMatch?.episodeA,
    activeMatch?.episodeB,
    ...availableEpisodes,
  ].filter(isEpisode);
  const uniqueEpisodes = new Map<number | string, EpisodeCard>();

  episodes.forEach((episode, index) => {
    uniqueEpisodes.set(episode.episodeId ?? `${episode.title}-${index}`, episode);
  });

  const normalizedEpisodes = Array.from(uniqueEpisodes.values());

  return normalizedEpisodes.length >= 2 ? normalizedEpisodes : SAMPLE_EPISODES;
}

function isEpisode(value: EpisodeCard | null | undefined): value is EpisodeCard {
  return Boolean(value);
}

function getInitialView(
  activeEvents: ActiveEvent[],
  activeMatch: ActiveMatch | null,
): RingView {
  if (activeMatch?.episodeA && activeMatch.episodeB) {
    return "battle";
  }

  return activeEvents.length > 0 ? "list" : "empty";
}

function formatEventType(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return "Event";
  }

  const upperValue = normalized.toUpperCase();

  if (upperValue.includes("MONTH")) {
    return "Monthly Show";
  }

  if (upperValue.includes("YEAR")) {
    return "Yearly Show";
  }

  if (upperValue.includes("WEEK")) {
    return "Weekly Show";
  }

  return normalized;
}

function formatEventDate(event: ActiveEvent) {
  if (event.displayDate) {
    return event.displayDate;
  }

  if (event.startsAt) {
    return formatDateLabel(event.startsAt);
  }

  return "일정 미정";
}

function formatDateLabel(value?: string | null) {
  if (!value) {
    return "날짜 없음";
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  return `${year}.${month}.${day}`;
}

function formatEpisodeRecord(episode: EpisodeCard) {
  const wins = getNumberValue(episode.wins);
  const losses = getNumberValue(episode.losses);

  if (wins === null || losses === null) {
    return "전적 없음";
  }

  return `${wins}승 ${losses}패`;
}

function getEpisodeScore(episode?: EpisodeCard | null) {
  return getNumberValue(episode?.score) ?? getNumberValue(episode?.titleScore) ?? 1200;
}

function getNumberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getEventKey(event: ActiveEvent, index: number) {
  return event.eventId ?? `${event.type}-${event.title}-${index}`;
}
