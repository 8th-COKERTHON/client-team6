import Image from "next/image";
import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MatchScheduleCard } from "@/components/match-schedule-card";

type ActiveEvent = {
  displayDate?: string | null;
  eventId?: number | null;
  scoreReward?: number | null;
  title?: string | null;
  type?: string | null;
};

type AvailableEpisode = {
  episodeDate?: string | null;
  episodeId?: number | null;
  title?: string | null;
};

type EpisodeCard = {
  content?: string | null;
  episodeDate?: string | null;
  episodeId?: number | null;
  title?: string | null;
};

type ActiveMatch = {
  currentRound?: number | null;
  episodeA?: EpisodeCard | null;
  episodeB?: EpisodeCard | null;
  matchId?: number | null;
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

export function RingScreen({ data, errorMessage }: RingScreenProps) {
  const activeEvents = data?.activeEvents ?? [];
  const availableEpisodes = data?.availableEpisodes ?? [];
  const activeMatch = data?.activeMatch ?? null;

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RingArenaBackground />
        <RingHeader />

        <section className="relative z-10 px-[clamp(1rem,4.8vw,1.125rem)] pt-[calc(env(safe-area-inset-top)+7.625rem)] pb-[calc(8.5rem+env(safe-area-inset-bottom))]">
          {errorMessage ? (
            <RingNotice title="링 정보를 불러오지 못했습니다" body={errorMessage} />
          ) : (
            <div className="flex flex-col gap-8">
              {activeMatch ? <ActiveMatchSection match={activeMatch} /> : null}
              <ActiveEventSection events={activeEvents} />
              <AvailableEpisodeSection episodes={availableEpisodes} />
            </div>
          )}
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function ActiveEventSection({ events }: { events: ActiveEvent[] }) {
  return (
    <section>
      <h1 className="text-base font-semibold leading-[1.4] tracking-[-0.01em]">
        진행할 수 있는 매치
      </h1>
      <div className="mt-4 flex flex-col gap-3">
        {events.length > 0 ? (
          events.map((event, index) => (
            <MatchScheduleCard
              dateLabel={event.displayDate || "일정 미정"}
              href={`/ring?eventId=${event.eventId ?? index}`}
              key={event.eventId ?? `${event.title}-${index}`}
              kind={formatEventKind(event)}
              title={event.title || "이름 없는 매치"}
              variant={index === 0 ? "solid" : "fade"}
            />
          ))
        ) : (
          <RingNotice
            title="진행 가능한 이벤트가 없습니다"
            body="새로운 매치 일정이 열리면 이곳에 표시됩니다."
          />
        )}
      </div>
    </section>
  );
}

function ActiveMatchSection({ match }: { match: ActiveMatch }) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-base font-semibold leading-[1.4] tracking-[-0.01em]">
          진행 중인 대결
        </h1>
        <span className="shrink-0 rounded-full bg-[#ff0002] px-3 py-1 text-xs font-semibold leading-[1.4] tracking-[-0.01em] text-white">
          {formatRoundLabel(match)}
        </span>
      </div>
      <article className="mt-4 rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
          <span>Match #{match.matchId ?? "-"}</span>
          <span>{match.status || "IN_PROGRESS"}</span>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <EpisodeBattleCard episode={match.episodeA} label="A" />
          <div className="flex items-center justify-center text-sm font-bold leading-[1.4] tracking-[-0.01em] text-[#ff0002]">
            VS
          </div>
          <EpisodeBattleCard episode={match.episodeB} label="B" />
        </div>
      </article>
    </section>
  );
}

function EpisodeBattleCard({
  episode,
  label,
}: {
  episode?: EpisodeCard | null;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#363d48] px-3 py-3">
      <p className="text-xs font-semibold leading-[1.4] tracking-[-0.01em] text-[#ff0002]">
        Episode {label}
      </p>
      <h2 className="mt-2 line-clamp-2 min-h-[2.8em] text-sm font-semibold leading-[1.4] tracking-[-0.01em] text-[#f0f0f2]">
        {episode?.title || "제목 없음"}
      </h2>
      <p className="mt-2 text-xs font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
        {formatDateLabel(episode?.episodeDate)}
      </p>
    </div>
  );
}

function AvailableEpisodeSection({
  episodes,
}: {
  episodes: AvailableEpisode[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold leading-[1.4] tracking-[-0.01em]">
          매칭 가능한 에피소드
        </h2>
        <span className="shrink-0 text-xs font-semibold leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
          {episodes.length}개
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {episodes.length > 0 ? (
          episodes.map((episode, index) => (
            <article
              className="flex min-h-[4.25rem] w-full items-center justify-between rounded-2xl bg-[#292e38]/90 px-4 py-3"
              key={episode.episodeId ?? `${episode.title}-${index}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold leading-[1.4] tracking-[-0.01em] text-[#f0f0f2]">
                  {episode.title || "제목 없음"}
                </span>
                <span className="mt-1.5 block text-[13px] font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
                  {formatDateLabel(episode.episodeDate)}
                </span>
              </span>
              <span className="ml-4 shrink-0 rounded-full bg-[#363d48] px-3 py-1 text-xs font-semibold leading-[1.4] tracking-[-0.01em] text-white">
                #{episode.episodeId ?? "-"}
              </span>
            </article>
          ))
        ) : (
          <RingNotice
            title="매칭 가능한 에피소드가 없습니다"
            body="에피소드를 등록하면 링에서 대결을 시작할 수 있습니다."
            actionHref="/episodes/new"
            actionLabel="등록"
          />
        )}
      </div>
    </section>
  );
}

function RingNotice({
  actionHref,
  actionLabel,
  body,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  body: string;
  title: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#87919e]/30 bg-[#292e38]/80 p-5">
      <h2 className="text-base font-semibold leading-[1.4] tracking-[-0.01em] text-[#f0f0f2]">
        {title}
      </h2>
      <p className="mt-2 text-sm font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#ff0002] px-5 text-sm font-semibold leading-[1.4] tracking-[-0.025em] text-white transition-colors hover:bg-[#e00002] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function RingArenaBackground() {
  return (
    <div className="absolute inset-x-1/2 bottom-[-17svh] h-[min(58.375rem,115svh)] w-[min(32.5625rem,139vw)] -translate-x-1/2">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-50"
        fill
        priority
        sizes="(max-width: 375px) 139vw, 32.5625rem"
        src="/images/auth-arena-background.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#12161b_15.383%,rgba(18,22,27,0)_61.558%,#12161b_82.869%)]" />
    </div>
  );
}

function RingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 flex h-[calc(env(safe-area-inset-top)+6.125rem)] items-end justify-between px-4 pb-[1.125rem]">
      <Link
        aria-label="이전 화면으로 이동"
        className="flex size-6 items-center justify-center text-white transition-colors hover:text-[#ff0002] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        href="/"
      >
        <BackIcon />
      </Link>
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

function formatEventKind(event: ActiveEvent) {
  const type = formatEventType(event.type);

  if (typeof event.scoreReward === "number" && event.scoreReward > 0) {
    return `${type} · +${event.scoreReward}점`;
  }

  return type;
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

function formatRoundLabel(match: ActiveMatch) {
  const currentRound = match.currentRound ?? 1;
  const totalRounds = match.totalRounds ?? 1;

  return `${currentRound}/${totalRounds}R`;
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
