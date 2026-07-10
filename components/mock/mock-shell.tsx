"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";

const MOCK_NAVIGATION_ITEMS = [
  { href: "/mock/home", icon: "home", label: "홈" },
  { href: "/mock/ring", icon: "ring", label: "링" },
  { href: "/mock/ranking", icon: "ranking", label: "랭킹" },
  { href: "/mock/results", icon: "records", label: "결과" },
] as const;

export function MockPageFrame({
  children,
  withNavigation = false,
}: {
  children: ReactNode;
  withNavigation?: boolean;
}) {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        {children}
        {withNavigation ? <MockBottomNavigation /> : null}
      </div>
    </main>
  );
}

export function MockLoadingScreen() {
  return (
    <MockPageFrame>
      <div className="flex min-h-svh items-center justify-center px-4">
        <div aria-label="화면 불러오는 중" role="status">
          <span className="block size-8 animate-spin rounded-full border-[3px] border-[#363d48] border-t-[#ff0002]" />
        </div>
      </div>
    </MockPageFrame>
  );
}

export function MockHeader({
  backHref,
  onReset,
  title,
}: {
  backHref?: string;
  onReset?: () => void;
  title?: string;
}) {
  function confirmReset() {
    if (onReset && window.confirm("진행 기록을 모두 초기화할까요?")) {
      onReset();
    }
  }

  return (
    <header className="relative z-20 flex h-[calc(max(env(safe-area-inset-top),44px)+54px)] items-end justify-between px-4 pb-[9px]">
      {backHref ? (
        <Link
          aria-label="이전 화면으로 이동"
          className="flex size-9 items-center justify-start text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
          href={backHref}
        >
          <ChevronLeftIcon className="size-6" />
        </Link>
      ) : (
        <Link
          aria-label="홈"
          className="relative flex size-9 overflow-hidden rounded-[8px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
          href="/mock/home"
        >
          <Image
            alt="MME"
            className="object-cover"
            fill
            priority
            sizes="36px"
            src="/icons/mme-icon-192.png"
          />
        </Link>
      )}

      {title ? (
        <h1 className="absolute inset-x-14 bottom-[15px] truncate text-center text-lg font-semibold leading-[1.4] text-white">
          {title}
        </h1>
      ) : null}

      {onReset ? (
        <button
          aria-label="진행 기록 초기화"
          className="flex size-9 items-center justify-end text-[#b1b9c5] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
          onClick={confirmReset}
          title="진행 기록 초기화"
          type="button"
        >
          <ResetIcon className="size-5" />
        </button>
      ) : (
        <span aria-hidden="true" className="size-9" />
      )}
    </header>
  );
}

export function MockHomeIndicator() {
  return (
    <div className="h-[calc(34px+env(safe-area-inset-bottom))] w-full" />
  );
}

export function MockBottomNavigation() {
  return <BottomNavigation items={MOCK_NAVIGATION_ITEMS} />;
}

export function MockArenaBackground({ opacity = "opacity-25" }: { opacity?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-1/2 bottom-[-17.375svh] h-[clamp(50rem,115svh,58.375rem)] w-[clamp(28rem,139vw,32.5625rem)] -translate-x-1/2">
      <Image
        alt=""
        className={`absolute inset-0 h-full w-full object-cover ${opacity}`}
        fill
        priority
        sizes="(max-width: 375px) 139vw, 32.5625rem"
        src="/images/auth-arena-background.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#12161b_15.38%,rgba(18,22,27,0)_61.56%,#12161b_82.87%)]" />
    </div>
  );
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
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

function ResetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 11a8 8 0 0 0-14.2-5L4 8m0 0h5M4 8V3m0 10a8 8 0 0 0 14.2 5L20 16m0 0h-5m5 0v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
