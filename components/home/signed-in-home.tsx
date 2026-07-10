import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MatchScheduleCard } from "@/components/match-schedule-card";

type SignedInHomeUser = {
  email?: string | null;
  name?: string | null;
};

type SignedInHomeProps = {
  user: SignedInHomeUser;
};

const UPCOMING_MATCHES = [
  {
    dateLabel: "7.31 월",
    href: "/ring",
    kind: "D - 4",
    title: "Weekly Shows",
    variant: "solid",
  },
  {
    dateLabel: "7.31 월",
    href: "/ring",
    kind: "D - 4",
    title: "Monthly Royal Rumble",
    variant: "fade",
  },
] as const;

const CHAMPION_CASES = [
  {
    description: "회의 직전에 발표 자료가 전부 날아가서 다시 만든 날",
    title: "발표 10분 전 파일 실종",
  },
  {
    description: "중요한 약속 날에 비까지 맞으며 40분을 기다렸던 사건",
    title: "비 오는 날의 긴 기다림",
  },
] as const;

export function SignedInHome({ user }: SignedInHomeProps) {
  const displayName = user.name || user.email?.split("@")[0] || "챔피언";

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <header className="flex items-center justify-between px-[clamp(1rem,4.8vw,1.5rem)] pt-[calc(env(safe-area-inset-top)+2.75rem)]">
          <div>
            <p className="text-[22px] font-black leading-none tracking-[0]">MME</p>
            <p className="mt-2 text-sm font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
              {displayName}님의 오늘
            </p>
          </div>
          <button
            aria-label="알림"
            className="flex size-11 items-center justify-center rounded-full bg-[#292e38] text-[#f0f0f2] transition-colors hover:bg-[#343a46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
            type="button"
          >
            <BellIcon />
          </button>
        </header>

        <section className="px-[clamp(1rem,4.8vw,1.5rem)] pt-[clamp(3.5rem,10svh,5rem)] pb-[calc(8.25rem+env(safe-area-inset-bottom))]">
          <Link
            className="group flex min-h-[clamp(6.5rem,20svh,8rem)] w-full items-center justify-between rounded-2xl bg-[#f0f0f2] px-[clamp(1.25rem,6vw,1.75rem)] text-[#12161b] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
            href="/events/new"
          >
            <span>
              <span className="block text-xl font-bold leading-[1.4] tracking-[-0.01em]">
                오늘의 사건 등록
              </span>
              <span className="mt-1 block text-sm font-medium leading-[1.4] tracking-[-0.01em] text-[#575e6a]">
                지금 마음에 남은 일을 기록해요
              </span>
            </span>
            <PlusIcon className="size-8 shrink-0 transition-transform group-hover:rotate-90" />
          </Link>

          <section className="mt-[clamp(3.75rem,11svh,5rem)]">
            <div className="mb-4 flex items-end justify-between gap-3">
              <h1 className="text-base font-semibold leading-[1.4] tracking-[-0.01em]">
                예정된 매칭 일정
              </h1>
              <Link
                className="text-sm font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5] transition-colors hover:text-white"
                href="/ring"
              >
                전체보기
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {UPCOMING_MATCHES.map((match) => (
                <MatchScheduleCard key={match.title} {...match} />
              ))}
            </div>
          </section>

          <section className="mt-[clamp(2rem,6svh,3rem)]">
            <h2 className="text-base font-semibold leading-[1.4] tracking-[-0.01em]">
              현재 챔피언
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {CHAMPION_CASES.map((caseItem, index) => (
                <ChampionCaseCard
                  description={caseItem.description}
                  key={caseItem.title}
                  rankLabel={index === 0 ? "월간" : "올타임"}
                  title={caseItem.title}
                />
              ))}
            </div>
          </section>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function ChampionCaseCard({
  description,
  rankLabel,
  title,
}: {
  description: string;
  rankLabel: string;
  title: string;
}) {
  return (
    <article className="flex w-full items-center gap-4 rounded-2xl bg-[#292e38]/80 px-[clamp(1rem,4.8vw,1.25rem)] py-4">
      <div className="flex size-[clamp(3.75rem,18vw,5rem)] shrink-0 items-center justify-center rounded-2xl bg-[#f0f0f2] text-[#12161b]">
        <StarIcon className="size-[62%]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-[1.4] tracking-[-0.01em] text-[#ff0002]">
          {rankLabel} 챔피언
        </p>
        <h3 className="mt-1 truncate text-base font-semibold leading-[1.4] tracking-[-0.01em] text-[#f0f0f2]">
          {title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
          {description}
        </p>
      </div>
    </article>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
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
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12 2.5 2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.4l-5.84 3.07 1.11-6.5-4.72-4.6 6.53-.95L12 2.5Z" />
    </svg>
  );
}
