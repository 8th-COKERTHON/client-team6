import Image from "next/image";
import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";

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
  episodeDate?: string | null;
  episodeId?: number | null;
  status?: string | null;
  title?: string | null;
};

type EpisodeCard = {
  content?: string | null;
  episodeDate?: string | null;
  episodeId?: number | null;
  title?: string | null;
};

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
            <div className="flex flex-col gap-7">
              <RingOverview
                activeEvents={activeEvents}
                activeMatch={activeMatch}
                availableEpisodes={availableEpisodes}
              />
              <CurrentSessionSection match={activeMatch} />
              <EventBoardSection events={activeEvents} />
              <EpisodePoolSection episodes={availableEpisodes} />
            </div>
          )}
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function RingOverview({
  activeEvents,
  activeMatch,
  availableEpisodes,
}: {
  activeEvents: ActiveEvent[];
  activeMatch: ActiveMatch | null;
  availableEpisodes: AvailableEpisode[];
}) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase leading-[1.4] text-[#ff0002]">
        Ring
      </p>
      <h1 className="mt-1 text-[1.625rem] font-bold leading-[1.2] text-white">
        매칭 링
      </h1>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <RingMetric label="세션" value={activeMatch ? "1" : "0"} />
        <RingMetric label="이벤트" value={String(activeEvents.length)} />
        <RingMetric label="후보" value={String(availableEpisodes.length)} />
      </div>
    </section>
  );
}

function RingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#363d48] bg-[#1b1e27]/85 px-3 py-3">
      <p className="text-[11px] font-semibold leading-[1.4] text-[#87919e]">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold leading-[1.2] text-[#f0f0f2]">
        {value}
      </p>
    </div>
  );
}

function CurrentSessionSection({ match }: { match: ActiveMatch | null }) {
  return (
    <section>
      <SectionHeader
        eyebrow="ring_sessions"
        title="진행 중인 세션"
        trailing={match ? formatRoundLabel(match) : undefined}
      />
      {match ? (
        <article className="mt-4 rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-[1.4] text-[#b1b9c5]">
                {formatEventType(match.eventType)} · Session #
                {match.sessionId ?? "-"}
              </p>
              <h2 className="mt-1 truncate text-lg font-bold leading-[1.3] text-white">
                {match.eventTitle || "현재 대결"}
              </h2>
            </div>
            <StatusPill status={match.status} />
          </div>

          <MatchProgress match={match} />

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
            <EpisodeBattleColumn episode={match.episodeA} label="A" />
            <div className="flex items-center justify-center text-sm font-bold leading-[1.4] text-[#ff0002]">
              VS
            </div>
            <EpisodeBattleColumn episode={match.episodeB} label="B" />
          </div>
        </article>
      ) : (
        <RingNotice
          title="진행 중인 세션이 없습니다"
          body="대결을 시작하면 현재 라운드와 대결 카드가 이곳에 표시됩니다."
        />
      )}
    </section>
  );
}

function MatchProgress({ match }: { match: ActiveMatch }) {
  const totalRounds = Math.max(match.totalRounds ?? 1, 1);
  const completedRounds = getCompletedRounds(match);
  const progress = Math.min(Math.max(completedRounds / totalRounds, 0), 1);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs font-semibold leading-[1.4] text-[#b1b9c5]">
        <span>라운드 진행</span>
        <span>
          {completedRounds}/{totalRounds}
        </span>
      </div>
      <div
        aria-label="라운드 진행률"
        aria-valuemax={totalRounds}
        aria-valuemin={0}
        aria-valuenow={completedRounds}
        className="mt-2 h-2 overflow-hidden rounded-full bg-[#12161b]"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-[#ff0002]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function EpisodeBattleColumn({
  episode,
  label,
}: {
  episode?: EpisodeCard | null;
  label: string;
}) {
  return (
    <div className="min-w-0 border-t border-[#4a5360] pt-3">
      <p className="text-xs font-semibold leading-[1.4] text-[#ff0002]">
        episode_{label.toLowerCase()}
      </p>
      <h3 className="mt-2 line-clamp-2 min-h-[2.8em] text-sm font-bold leading-[1.4] text-[#f0f0f2]">
        {episode?.title || "제목 없음"}
      </h3>
      <p className="mt-2 text-xs font-medium leading-[1.4] text-[#b1b9c5]">
        {formatDateLabel(episode?.episodeDate)}
      </p>
      {episode?.content ? (
        <p className="mt-2 line-clamp-2 text-xs font-medium leading-[1.45] text-[#87919e]">
          {episode.content}
        </p>
      ) : null}
    </div>
  );
}

function EventBoardSection({ events }: { events: ActiveEvent[] }) {
  return (
    <section>
      <SectionHeader eyebrow="matching_events" title="대결 이벤트" />
      <div className="mt-4 flex flex-col gap-3">
        {events.length > 0 ? (
          events.map((event, index) => (
            <EventCard event={event} index={index} key={getEventKey(event, index)} />
          ))
        ) : (
          <RingNotice
            title="진행 가능한 이벤트가 없습니다"
            body="새로운 Weekly Show 또는 Monthly Royal Rumble이 열리면 이곳에 표시됩니다."
          />
        )}
      </div>
    </section>
  );
}

function EventCard({ event, index }: { event: ActiveEvent; index: number }) {
  return (
    <Link
      className={[
        "group block rounded-[20px] border px-5 py-4 text-left transition-transform",
        "hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]",
        index === 0
          ? "border-[#ff0002]/35 bg-[#292e38]"
          : "border-[#363d48] bg-[linear-gradient(102deg,#292e38_0%,rgba(41,46,56,0.68)_100%)]",
      ].join(" ")}
      href={`/ring?eventId=${event.eventId ?? index}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold leading-[1.4] text-[#ff0002]">
            {formatEventType(event.type)}
          </p>
          <h3 className="mt-1 truncate text-base font-bold leading-[1.35] text-[#f0f0f2]">
            {event.title || "이름 없는 이벤트"}
          </h3>
        </div>
        <StatusPill status={event.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold leading-[1.4] text-[#b1b9c5]">
        <EventMeta label="기간" value={formatEventDate(event)} />
        <EventMeta label="보상" value={formatReward(event.scoreReward)} />
        <EventMeta label="라운드" value={formatRoundCount(event.roundCount)} />
        <EventMeta label="이벤트 ID" value={String(event.eventId ?? "-")} />
      </div>
    </Link>
  );
}

function EventMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold leading-[1.4] text-[#87919e]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-semibold leading-[1.4] text-[#f0f0f2]">
        {value}
      </p>
    </div>
  );
}

function EpisodePoolSection({ episodes }: { episodes: AvailableEpisode[] }) {
  return (
    <section>
      <SectionHeader
        eyebrow="episodes"
        title="매칭 후보 에피소드"
        trailing={`${episodes.length}개`}
      />
      <div className="mt-4 flex flex-col gap-3">
        {episodes.length > 0 ? (
          episodes.map((episode, index) => (
            <EpisodePoolItem
              episode={episode}
              index={index}
              key={episode.episodeId ?? `${episode.title}-${index}`}
            />
          ))
        ) : (
          <RingNotice
            title="매칭 가능한 에피소드가 없습니다"
            body="에피소드를 등록하면 링에서 대결 후보로 사용할 수 있습니다."
            actionHref="/episodes/new"
            actionLabel="등록"
          />
        )}
      </div>
    </section>
  );
}

function EpisodePoolItem({
  episode,
  index,
}: {
  episode: AvailableEpisode;
  index: number;
}) {
  return (
    <article className="grid min-h-[4.5rem] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-[#363d48] bg-[#1b1e27]/88 px-4 py-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-[#292e38] text-sm font-bold leading-none text-[#ff0002]">
        {index + 1}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-bold leading-[1.35] text-[#f0f0f2]">
          {episode.title || "제목 없음"}
        </span>
        <span className="mt-1 block text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
          {formatDateLabel(episode.episodeDate)}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-[#363d48] px-3 py-1 text-xs font-semibold leading-[1.4] text-white">
        {formatStatusLabel(episode.status, "AVAILABLE")}
      </span>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow: string;
  title: string;
  trailing?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase leading-[1.4] text-[#87919e]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-base font-bold leading-[1.35] text-white">
          {title}
        </h2>
      </div>
      {trailing ? (
        <span className="shrink-0 rounded-full bg-[#363d48] px-3 py-1 text-xs font-semibold leading-[1.4] text-white">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const normalizedStatus = status?.trim();

  return (
    <span className="shrink-0 rounded-full bg-[#12161b] px-3 py-1 text-xs font-semibold leading-[1.4] text-[#f0f0f2] ring-1 ring-[#4a5360]">
      {formatStatusLabel(normalizedStatus, "IN_PROGRESS")}
    </span>
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
    <div className="mt-4 rounded-[20px] border border-[#87919e]/30 bg-[#292e38]/80 p-5">
      <h2 className="text-base font-bold leading-[1.35] text-[#f0f0f2]">
        {title}
      </h2>
      <p className="mt-2 text-sm font-medium leading-[1.45] text-[#b1b9c5]">
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#ff0002] px-5 text-sm font-semibold leading-[1.4] text-white transition-colors hover:bg-[#e00002] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
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
        className="absolute inset-0 h-full w-full object-cover opacity-42"
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

function formatEventType(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return "Event";
  }

  const upperValue = normalized.toUpperCase();

  if (upperValue.includes("MONTH")) {
    return "Monthly Royal Rumble";
  }

  if (upperValue.includes("YEAR")) {
    return "Yearly Champion";
  }

  if (upperValue.includes("WEEK")) {
    return "Weekly Show";
  }

  return normalized;
}

function formatStatusLabel(value?: string | null, fallback = "UNKNOWN") {
  const normalized = value?.trim().toUpperCase() || fallback;

  const labels: Record<string, string> = {
    ACTIVE: "진행 중",
    AVAILABLE: "가능",
    CANCELLED: "취소",
    CLOSED: "종료",
    COMPLETED: "완료",
    ENDED: "종료",
    IN_PROGRESS: "진행 중",
    OPEN: "오픈",
    PENDING: "대기",
    SCHEDULED: "예정",
    UPCOMING: "예정",
  };

  return labels[normalized] ?? normalized;
}

function formatRoundLabel(match: ActiveMatch) {
  const currentRound = match.currentRound ?? getCompletedRounds(match) + 1;
  const totalRounds = Math.max(match.totalRounds ?? 1, 1);

  return `${currentRound}/${totalRounds}R`;
}

function getCompletedRounds(match: ActiveMatch) {
  if (typeof match.completedRounds === "number") {
    return match.completedRounds;
  }

  if (typeof match.currentRound === "number") {
    return Math.max(match.currentRound - 1, 0);
  }

  return 0;
}

function formatEventDate(event: ActiveEvent) {
  if (event.displayDate) {
    return event.displayDate;
  }

  if (event.startsAt && event.endsAt) {
    return `${formatDateLabel(event.startsAt)} - ${formatDateLabel(event.endsAt)}`;
  }

  if (event.startsAt) {
    return formatDateLabel(event.startsAt);
  }

  return "일정 미정";
}

function formatReward(value?: number | null) {
  if (typeof value !== "number" || value <= 0) {
    return "보상 없음";
  }

  return `+${value}점`;
}

function formatRoundCount(value?: number | null) {
  if (typeof value !== "number" || value <= 0) {
    return "-";
  }

  return `${value}R`;
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

function getEventKey(event: ActiveEvent, index: number) {
  return event.eventId ?? `${event.type}-${event.title}-${index}`;
}
