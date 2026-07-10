"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { ActionButton, ActionButtonLink } from "@/components/ui/action-button";

export type ActiveEventDto = {
  displayDate: string;
  eventId: number;
  scoreReward: number;
  title: string;
  type: string;
};

export type AvailableEpisodeDto = {
  episodeDate: string;
  episodeId: number;
  title: string;
};

export type EpisodeCardDto = AvailableEpisodeDto & {
  content: string;
};

export type ActiveMatchDto = {
  currentRound: number;
  episodeA: EpisodeCardDto;
  episodeB: EpisodeCardDto;
  matchId: number;
  status: string;
  totalRounds: number;
};

export type RingResponse = {
  activeEvents: ActiveEventDto[];
  activeMatch?: ActiveMatchDto;
  activeQuestion: unknown;
  availableEpisodes: AvailableEpisodeDto[];
};

type RingScreenProps = {
  data: RingResponse;
};

export type RingBattleEpisode = EpisodeCardDto & {
  recordLabel: string;
  score: number;
};

export type RingMatchScreenProps = {
  actionLabel?: string;
  backHref?: string;
  currentRound: number;
  episodeA: RingBattleEpisode;
  episodeB: RingBattleEpisode;
  eventTitle: string;
  onConfirmWinner: (winnerEpisodeId: number) => void;
  phaseLabel: string;
  totalRounds: number;
};

type BattleSide = "a" | "b";

type CardFlipState = Record<BattleSide, boolean>;

type BattleRound = {
  episodeA: BattleEpisode;
  episodeB: BattleEpisode;
};

type RingView = "empty" | "battle" | "complete";

type BattleEpisode = RingBattleEpisode;

const MOCK_EPISODE_RECORD = "5승 2패";
const MOCK_EPISODE_SCORE = 1000;
const INITIAL_CARD_FLIP_STATE: CardFlipState = {
  a: false,
  b: false,
};

export function RingScreen({ data }: RingScreenProps) {
  const activeMatch = data.activeMatch ?? null;
  const initialView = getInitialView(activeMatch);
  const [view, setView] = useState<RingView>(initialView);
  const [roundIndex, setRoundIndex] = useState(() =>
    getInitialRoundIndex(activeMatch),
  );
  const [selectedSide, setSelectedSide] = useState<BattleSide | null>(null);
  const [flippedCards, setFlippedCards] = useState<CardFlipState>(
    INITIAL_CARD_FLIP_STATE,
  );
  const rounds = useMemo(
    () => createBattleRounds(activeMatch),
    [activeMatch],
  );
  const currentRound = rounds[roundIndex] ?? rounds[0];
  const completedScore =
    MOCK_EPISODE_SCORE + (data.activeEvents[0]?.scoreReward ?? 0);

  function selectWinner(side: BattleSide) {
    setSelectedSide(side);
  }

  function toggleCard(side: BattleSide) {
    setFlippedCards((current) => ({
      ...current,
      [side]: !current[side],
    }));
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
    setFlippedCards(INITIAL_CARD_FLIP_STATE);
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        {view !== "complete" ? (
          <RingArenaBackground isSubtle={view === "battle"} />
        ) : null}
        <RingHeader />

        {view === "empty" ? (
          <EmptyRingState />
        ) : view === "complete" ? (
          <CompleteScreen score={completedScore} />
        ) : currentRound ? (
          <BattleScreen
            currentRound={currentRound}
            flippedCards={flippedCards}
            onMoveNext={moveNextRound}
            onSelectWinner={selectWinner}
            onToggleDetail={toggleCard}
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

export function RingMatchScreen({
  actionLabel,
  backHref = "/mock/home",
  currentRound,
  episodeA,
  episodeB,
  eventTitle,
  onConfirmWinner,
  phaseLabel,
  totalRounds,
}: RingMatchScreenProps) {
  const [selectedSide, setSelectedSide] = useState<BattleSide | null>(null);
  const [flippedCards, setFlippedCards] = useState<CardFlipState>(
    INITIAL_CARD_FLIP_STATE,
  );
  const round: BattleRound = { episodeA, episodeB };

  function confirmWinner() {
    if (!selectedSide) {
      return;
    }

    onConfirmWinner(
      selectedSide === "a" ? episodeA.episodeId : episodeB.episodeId,
    );
  }

  function toggleCard(side: BattleSide) {
    setFlippedCards((current) => ({
      ...current,
      [side]: !current[side],
    }));
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RingArenaBackground isSubtle />
        <RingHeader backHref={backHref} />
        <BattleScreen
          actionLabel={actionLabel}
          currentRound={round}
          currentRoundNumber={currentRound}
          eyebrow={`${eventTitle} · ${phaseLabel}`}
          flippedCards={flippedCards}
          onMoveNext={confirmWinner}
          onSelectWinner={setSelectedSide}
          onToggleDetail={toggleCard}
          roundIndex={Math.max(currentRound - 1, 0)}
          selectedSide={selectedSide}
          totalRounds={totalRounds}
        />
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

function BattleScreen({
  actionLabel,
  currentRound,
  currentRoundNumber,
  eyebrow,
  flippedCards,
  heading = "이번 라운드, 더 힘들었던 에피소드에 판정을 내려주세요",
  onMoveNext,
  onSelectWinner,
  onToggleDetail,
  roundIndex,
  selectedSide,
  subtitle = "카드를 눌러 승자를 선택하세요",
  totalRounds,
}: {
  actionLabel?: string;
  currentRound: BattleRound;
  currentRoundNumber?: number;
  eyebrow?: string;
  flippedCards: CardFlipState;
  heading?: string;
  onMoveNext: () => void;
  onSelectWinner: (side: BattleSide) => void;
  onToggleDetail: (side: BattleSide) => void;
  roundIndex: number;
  selectedSide: BattleSide | null;
  subtitle?: string;
  totalRounds: number;
}) {
  return (
    <>
      <section className="relative z-10 px-4 pt-[calc(max(env(safe-area-inset-top),44px)+78px)] pb-[calc(7.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-[285px]">
          {eyebrow ? (
            <p className="mb-2 truncate text-xs font-semibold text-[#ff5b5d]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-xl font-semibold leading-[1.4] text-white">
            {heading}
          </h1>
          <p className="mt-2 text-sm font-medium leading-[1.4] text-[#8b95a1]">
            {subtitle}
          </p>
        </div>

        <div className="mt-[54px]">
          <RoundCounter
            current={currentRoundNumber ?? roundIndex + 1}
            total={totalRounds}
          />
          <div className="mt-4 grid grid-cols-[1fr_1fr] gap-[11px]">
            <BattleCard
              episode={currentRound.episodeA}
              index={1}
              isFlipped={flippedCards.a}
              isInactive={selectedSide !== null && selectedSide !== "a"}
              isSelected={selectedSide === "a"}
              onSelect={() => onSelectWinner("a")}
              onToggleDetail={() => onToggleDetail("a")}
            />
            <BattleCard
              episode={currentRound.episodeB}
              index={2}
              isFlipped={flippedCards.b}
              isInactive={selectedSide !== null && selectedSide !== "b"}
              isSelected={selectedSide === "b"}
              onSelect={() => onSelectWinner("b")}
              onToggleDetail={() => onToggleDetail("b")}
            />
          </div>
        </div>

      </section>

      <BottomActionArea>
        <ActionButton isActive={Boolean(selectedSide)} onClick={onMoveNext}>
          {actionLabel ??
            (roundIndex === totalRounds - 1 ? "선택 완료" : "다음")}
        </ActionButton>
      </BottomActionArea>
    </>
  );
}

function BattleCard({
  episode,
  index,
  isFlipped,
  isInactive,
  isSelected,
  onSelect,
  onToggleDetail,
}: {
  episode: BattleEpisode;
  index: number;
  isFlipped: boolean;
  isInactive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleDetail: () => void;
}) {
  const overviewToggleRef = useRef<HTMLButtonElement>(null);
  const detailToggleRef = useRef<HTMLButtonElement>(null);

  function toggleDetail() {
    const nextToggleButton = isFlipped
      ? overviewToggleRef
      : detailToggleRef;

    onToggleDetail();
    requestAnimationFrame(() => {
      nextToggleButton.current?.focus({ preventScroll: true });
    });
  }

  return (
    <article
      className={[
        "h-[305px] min-w-0 rounded-[20px] transition-opacity duration-200",
        isInactive ? "opacity-50" : "opacity-100",
      ].join(" ")}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 ease-in-out motion-reduce:transition-none"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <BattleCardFace
          episode={episode}
          index={index}
          isDetail={false}
          isSelected={isSelected}
          isVisible={!isFlipped}
          onSelect={onSelect}
          onToggleDetail={toggleDetail}
          toggleButtonRef={overviewToggleRef}
        />
        <BattleCardFace
          episode={episode}
          index={index}
          isDetail
          isSelected={isSelected}
          isVisible={isFlipped}
          onSelect={onSelect}
          onToggleDetail={toggleDetail}
          toggleButtonRef={detailToggleRef}
        />
      </div>
    </article>
  );
}

function BattleCardFace({
  episode,
  index,
  isDetail,
  isSelected,
  isVisible,
  onSelect,
  onToggleDetail,
  toggleButtonRef,
}: {
  episode: BattleEpisode;
  index: number;
  isDetail: boolean;
  isSelected: boolean;
  isVisible: boolean;
  onSelect: () => void;
  onToggleDetail: () => void;
  toggleButtonRef: Ref<HTMLButtonElement>;
}) {
  return (
    <div
      aria-hidden={!isVisible}
      className={[
        "absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[20px]",
        "px-3 py-4 text-left",
        isSelected
          ? "border-[1.5px] border-[#ff0002] bg-[#ff0002]/[0.08]"
          : "border border-[#363d48] bg-[#292e38]/70",
        isVisible ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      inert={!isVisible}
      style={{
        backfaceVisibility: "hidden",
        transform: isDetail ? "rotateY(180deg)" : "rotateY(0deg)",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <button
        className="flex min-h-0 flex-1 flex-col items-start text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        onClick={onSelect}
        tabIndex={isVisible ? 0 : -1}
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
        {isDetail ? (
          <span className="mt-2 line-clamp-5 block w-full text-[13px] font-medium leading-[1.6] text-white">
            {episode.content || "등록된 상세 내용이 없습니다."}
          </span>
        ) : null}
        <span className="mt-2 block w-full text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
          {formatDateLabel(episode.episodeDate)}
        </span>
      </button>

      <div className="mt-4">
        {!isDetail ? (
          <p className="mb-4 text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
            {episode.recordLabel} | {episode.score}점
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
          onClick={onToggleDetail}
          ref={toggleButtonRef}
          tabIndex={isVisible ? 0 : -1}
          type="button"
        >
          {isDetail ? "개요 보기" : "상세보기"}
        </button>
      </div>
    </div>
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
    <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-4 pt-[14px]">
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

function RingHeader({
  backHref = "/",
  onBack,
}: {
  backHref?: string;
  onBack?: () => void;
}) {
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
        <Link aria-label="이전 화면으로 이동" className={className} href={backHref}>
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

function createBattleRounds(activeMatch: ActiveMatchDto | null) {
  if (!activeMatch) {
    return [];
  }

  const episodeA = createBattleEpisode(activeMatch.episodeA);
  const episodeB = createBattleEpisode(activeMatch.episodeB);
  const totalRounds = Math.max(activeMatch.totalRounds, 1);

  return Array.from({ length: totalRounds }, (_, index): BattleRound =>
    index % 2 === 0
      ? { episodeA, episodeB }
      : { episodeA: episodeB, episodeB: episodeA },
  );
}

function createBattleEpisode(episode: EpisodeCardDto): BattleEpisode {
  return {
    ...episode,
    recordLabel: MOCK_EPISODE_RECORD,
    score: MOCK_EPISODE_SCORE,
  };
}

function getInitialRoundIndex(activeMatch: ActiveMatchDto | null) {
  if (!activeMatch) {
    return 0;
  }

  return Math.min(
    Math.max(activeMatch.currentRound - 1, 0),
    Math.max(activeMatch.totalRounds - 1, 0),
  );
}

function getInitialView(activeMatch: ActiveMatchDto | null): RingView {
  return activeMatch ? "battle" : "empty";
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
