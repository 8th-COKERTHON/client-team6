import Image from "next/image";
import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";
import { LogoutDialog } from "@/components/home/logout-dialog";
import {
  EpisodePlacementCard,
  ShowScheduleCard,
  type ShowScheduleCardData,
} from "@/components/home/show-schedule-card";
import type {
  AvailableShowResponse,
  EpisodeListItemResponse,
  HomeResponse,
  OnboardingStatusResponse,
  UpcomingEventResponse,
} from "@/lib/backend-types";

type SignedInHomeProps = {
  home: HomeResponse;
  onboardingStatus: OnboardingStatusResponse | null;
  pendingEpisode?: EpisodeListItemResponse;
  shows: AvailableShowResponse[];
};

export function SignedInHome({
  home,
  onboardingStatus,
  pendingEpisode,
  shows,
}: SignedInHomeProps) {
  const activeShow = shows.find(
    (show) =>
      show.sessionId && !show.status.toUpperCase().includes("COMPLETE"),
  );

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <HomeBackground />
        <HomeHeader />

        <section className="relative z-10 px-4 pb-[calc(7.625rem+env(safe-area-inset-bottom))] pt-6">
          <DailyEpisodeCard
            activeShow={activeShow}
            activePlacementSessionId={
              onboardingStatus?.activePlacementSessionId
            }
            home={home}
            pendingEpisode={pendingEpisode}
          />
          <UpcomingMatchSection homeEvents={home.upcomingEvents} shows={shows} />
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function HomeBackground() {
  return (
    <div className="absolute inset-x-1/2 bottom-[-17.375svh] h-[clamp(50rem,115svh,58.375rem)] w-[clamp(28rem,139vw,32.5625rem)] -translate-x-1/2">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        fill
        priority
        sizes="(max-width: 375px) 139vw, 32.5625rem"
        src="/images/auth-arena-background.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#12161b_15.38%,rgba(18,22,27,0)_61.56%,#12161b_82.87%)]" />
    </div>
  );
}

function HomeHeader() {
  return (
    <header className="relative z-10 flex h-[calc(max(env(safe-area-inset-top),44px)+54px)] items-end justify-between px-4 pb-[9px]">
      <Link
        aria-label="홈"
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-[8px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        href="/"
      >
        <Image
          alt="MME"
          className="h-full w-full object-cover"
          height={36}
          src="/icons/mme-icon-192.png"
          width={36}
        />
      </Link>
      <div className="flex items-center gap-6 text-[#b1b9c5]">
        <button
          aria-label="알림"
          className="relative flex size-6 items-center justify-center transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
          type="button"
        >
          <BellIcon />
        </button>
        <LogoutDialog />
      </div>
    </header>
  );
}

function DailyEpisodeCard({
  activePlacementSessionId,
  activeShow,
  home,
  pendingEpisode,
}: {
  activePlacementSessionId?: number | null;
  activeShow?: AvailableShowResponse;
  home: HomeResponse;
  pendingEpisode?: EpisodeListItemResponse;
}) {
  if (activePlacementSessionId) {
    return (
      <SessionResumeCard
        href={`/ring?sessionId=${activePlacementSessionId}&flow=onboarding`}
        progressLabel={`${home.availableEpisodeCount}개 에피소드`}
        title="온보딩 배치전"
      />
    );
  }

  if (activeShow?.sessionId) {
    return (
      <SessionResumeCard
        href={`/ring?sessionId=${activeShow.sessionId}&flow=show`}
        progressLabel={`${activeShow.completedMatchCount}/${activeShow.matchCount} 매치`}
        title={activeShow.title}
      />
    );
  }

  return (
    <section>
      <h1 className="text-base font-semibold leading-[1.4] text-white">
        {pendingEpisode ? "대기 중인 배치전" : "오늘의 에피소드 등록"}
      </h1>
      {pendingEpisode ? (
        <EpisodePlacementCard
          episodeId={pendingEpisode.episodeId}
          title={pendingEpisode.title}
        />
      ) : (
        <Link
          className="group mt-4 flex min-h-[5.5625rem] items-center justify-between rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
          href="/episodes/new"
        >
          <span className="min-w-0">
            <span className="block text-lg font-semibold leading-[1.4] text-white">
              지금 에피소드를 등록해 보세요.
            </span>
            <span className="mt-1.5 block text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
              바로 매칭을 시작할 수 있어요.
            </span>
          </span>
          <span className="ml-4 flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#ff0002] text-white transition-transform group-hover:rotate-90">
            <PlusIcon className="size-6" />
          </span>
        </Link>
      )}
    </section>
  );
}

function SessionResumeCard({
  href,
  progressLabel,
  title,
}: {
  href: string;
  progressLabel: string;
  title: string;
}) {
  return (
    <section>
      <h1 className="text-base font-semibold leading-[1.4] text-white">
        진행 중인 매치
      </h1>
      <Link
        className="mt-4 flex min-h-[5.5625rem] items-center justify-between rounded-[20px] border border-[#ff0002]/50 bg-[#292e38] p-5"
        href={href}
      >
        <span className="min-w-0">
          <span className="block truncate text-lg font-semibold text-white">
            {title}
          </span>
          <span className="mt-1 block text-[13px] font-medium text-[#b1b9c5]">
            {progressLabel}
          </span>
        </span>
        <span className="ml-4 shrink-0 text-sm font-semibold text-white">
          계속하기
        </span>
      </Link>
    </section>
  );
}

function UpcomingMatchSection({
  homeEvents,
  shows,
}: {
  homeEvents: UpcomingEventResponse[];
  shows: AvailableShowResponse[];
}) {
  const showSchedules = shows.map(toShowSchedule);
  const showIds = new Set(shows.map((show) => show.showId));
  const futureEvents = homeEvents.filter(
    (event) => !showIds.has(event.eventId),
  );

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold leading-[1.4] text-white">
        예정된 매치 일정
      </h2>
      {showSchedules.length > 0 || futureEvents.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {showSchedules.map((show) => (
            <ShowScheduleCard
              key={`${show.showId}-${show.sessionId ?? 0}`}
              show={show}
            />
          ))}
          {futureEvents.map((event, index) => (
            <UpcomingEventCard
              event={event}
              key={event.eventId}
              variant={index % 2 === 0 ? "solid" : "fade"}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#292e38] px-5 py-6 text-center text-sm font-medium text-[#b1b9c5]">
          예정된 매치가 없습니다.
        </p>
      )}
    </section>
  );
}

function UpcomingEventCard({
  event,
  variant,
}: {
  event: UpcomingEventResponse;
  variant: "fade" | "solid";
}) {
  return (
    <article
      className={[
        "flex min-h-[4.625rem] w-full items-start justify-between rounded-2xl px-5 py-3.5",
        variant === "solid"
          ? "bg-[#292e38]"
          : "bg-[linear-gradient(102deg,#292e38_0%,rgba(41,46,56,0.6)_100%)]",
      ].join(" ")}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex self-stretch py-1.5">
          <span aria-hidden className="size-2 rounded-full bg-[#ff0002]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold leading-[1.4] text-[#f0f0f2]">
            {event.title}
          </span>
          <span className="mt-1.5 block truncate text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
            {formatDateLabel(event.startsAt)} | {formatShowType(event.type)}
          </span>
        </span>
      </span>
      <span className="ml-4 rounded-full bg-[#363d48] px-3 py-1 text-xs font-semibold text-white">
        D-{Math.max(event.daysRemaining, 0)}
      </span>
    </article>
  );
}

function toShowSchedule(
  show: AvailableShowResponse,
  index: number,
): ShowScheduleCardData {
  return {
    completedMatches: show.completedMatchCount,
    dateLabel: formatDateLabel(show.startsAt),
    kind: formatShowType(show.type),
    matchCount: show.matchCount,
    remainingDays: getRemainingDays(show.startsAt),
    sessionId: show.sessionId,
    showId: show.showId,
    title: show.title,
    variant: index % 2 === 0 ? "solid" : "fade",
  };
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}

function getRemainingDays(value: string) {
  const start = new Date(value);
  return Number.isNaN(start.getTime())
    ? 0
    : Math.max(
        0,
        Math.ceil((start.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      );
}

function formatShowType(type: string) {
  const normalizedType = type.toUpperCase();
  if (normalizedType.includes("MONTH")) return "Monthly Show";
  if (normalizedType.includes("WEEK")) return "Weekly Show";
  return type;
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M18 9.75a6 6 0 0 0-12 0c0 6-2.25 7.5-2.25 7.5h16.5S18 15.75 18 9.75Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M13.73 20.25a2 2 0 0 1-3.46 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
