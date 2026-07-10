import Image from "next/image";
import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MatchScheduleCard } from "@/components/match-schedule-card";

const MATCH_SCHEDULES = [
  {
    dateLabel: "7.31 월",
    href: "/ring/monday-night-rivals",
    kind: "Weekly Show",
    title: "Monday Night Rivals",
    variant: "solid",
  },
  {
    dateLabel: "7.31 월",
    href: "/ring/monthly-royal-rumble",
    kind: "Weekly Show",
    title: "Monthly Royal Rumble",
    variant: "fade",
  },
  {
    dateLabel: "7.31 월",
    href: "/ring/monthly-royal-rumble-encore",
    kind: "Weekly Show",
    title: "Monthly Royal Rumble",
    variant: "fade",
  },
] as const;

export default function RingPage() {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RingArenaBackground />
        <RingHeader />

        <section className="relative z-10 px-[clamp(1rem,4.8vw,1.125rem)] pt-[calc(env(safe-area-inset-top)+7.625rem)] pb-[calc(8.5rem+env(safe-area-inset-bottom))]">
          <h1 className="text-base font-semibold leading-[1.4] tracking-[-0.01em]">
            진행할 수 있는 매치
          </h1>
          <div className="mt-4 flex flex-col gap-3">
            {MATCH_SCHEDULES.map((schedule) => (
              <MatchScheduleCard key={schedule.href} {...schedule} />
            ))}
          </div>
        </section>

        <BottomNavigation />
      </div>
    </main>
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
