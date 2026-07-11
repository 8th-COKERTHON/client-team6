import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import appIcon from "@/public/icons/mme-icon-192.png";

export function RecordsHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 flex h-[calc(env(safe-area-inset-top)+6.125rem)] items-end justify-between px-4 pb-[1.125rem]">
      <Link
        aria-label="홈"
        className="relative flex size-9 items-center justify-center overflow-hidden rounded-[8.4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        href="/"
      >
        <Image
          alt="MME"
          className="h-full w-full object-cover"
          priority
          src={appIcon}
        />
      </Link>
      <span aria-hidden="true" className="size-6" />
    </header>
  );
}

export function RecordsTopBar({ title }: { title: string }) {
  return (
    <header className="relative z-20 flex h-[calc(env(safe-area-inset-top)+6.125rem)] items-end justify-between px-4 pb-[1.125rem]">
      <Link
        aria-label="기록실로 돌아가기"
        className="flex size-6 items-center justify-center text-white transition-colors hover:text-[#ff0002] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        href="/records"
      >
        <BackIcon />
      </Link>
      <h1 className="text-lg font-semibold leading-[1.4] text-white">{title}</h1>
      <span aria-hidden="true" className="size-6" />
    </header>
  );
}

export function RecordsSearchBox({
  action = "/records",
  query = "",
}: {
  action?: string;
  query?: string;
}) {
  return (
    <form
      action={action}
      className="flex h-[3.25rem] w-full items-center justify-between rounded-xl bg-[#292e38] px-4 text-[#b1b9c5]"
      role="search"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <SearchIcon className="size-6 shrink-0" />
        <label className="sr-only" htmlFor={`records-query-${action}`}>
          기록실 검색
        </label>
        <input
          className="min-w-0 flex-1 bg-transparent text-base font-medium leading-[1.4] text-white outline-none placeholder:text-[#b1b9c5]"
          defaultValue={query}
          id={`records-query-${action}`}
          name="query"
          placeholder="제목이나 내용으로 검색해보세요."
          type="search"
        />
      </div>
      <button
        aria-label="기록실 검색"
        className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-full text-[#b1b9c5] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
        type="button"
      >
        <RefreshIcon className="size-5" />
      </button>
    </form>
  );
}

export function RecordsSectionHeader({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <div className="flex h-[1.375rem] items-center justify-between">
      <h2 className="text-base font-semibold leading-[1.4] text-white">{title}</h2>
      <Link
        className="flex items-center text-[13px] font-medium leading-[1.4] text-[#b1b9c5] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
        href={href}
      >
        전체보기
        <ChevronRightIcon className="size-5" />
      </Link>
    </div>
  );
}

export function HomeIndicator() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto h-[calc(34px+env(safe-area-inset-bottom))] w-full max-w-[375px] bg-[#12161b]" />
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

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m20 20-4.2-4.2m2.2-5.3a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function RefreshIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 11a8.1 8.1 0 0 0-14.1-4.9L4 8m0 0h5M4 8V3m0 10a8.1 8.1 0 0 0 14.1 4.9L20 16m0 0h-5m5 0v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m8 5 5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}
