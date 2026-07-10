"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

type BottomNavigationIconName = "home" | "ring" | "ranking" | "records";

export type BottomNavigationItem = {
  href: string;
  icon: BottomNavigationIconName;
  label: string;
};

export type BottomNavigationProps = {
  className?: string;
  items?: readonly BottomNavigationItem[];
};

const DEFAULT_ITEMS = [
  { href: "/", icon: "home", label: "홈" },
  { href: "/ring", icon: "ring", label: "링" },
  { href: "/ranking", icon: "ranking", label: "랭킹" },
  { href: "/records", icon: "records", label: "기록실" },
] as const satisfies readonly BottomNavigationItem[];

const ICONS = {
  home: HomeIcon,
  ring: RingIcon,
  ranking: RankingIcon,
  records: RecordsIcon,
} satisfies Record<BottomNavigationIconName, (props: SVGProps<SVGSVGElement>) => React.ReactNode>;

export function BottomNavigation({
  className,
  items = DEFAULT_ITEMS,
}: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="하단 네비게이션"
      className={[
        "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[375px]",
        "rounded-t-[24px] border-t border-[#87919e] bg-[#12161b]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-[72px] w-full items-center justify-between rounded-t-[24px] px-5 pb-1 pt-3">
        {items.map((item) => {
          const isActive = isItemActive(pathname, item.href);
          const Icon = ICONS[item.icon];

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex min-w-[54px] flex-col items-center gap-1.5 px-[18px] py-1.5",
                "text-center text-xs leading-[1.4] tracking-[-0.01em]",
                "transition-colors focus-visible:outline focus-visible:outline-2",
                "focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]",
                isActive
                  ? "font-bold text-[#ff0002]"
                  : "font-medium text-[#b1b9c5] hover:text-white",
              ].join(" ")}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="size-[21px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[calc(34px+env(safe-area-inset-bottom))] w-full" />
    </nav>
  );
}

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.5 9.25 10.5 3.5l7 5.75v7.25a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V9.25Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M8.25 18v-5.25h4.5V18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function RingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.5 2.75 17 5.35v4.85c0 4.05-2.64 6.55-6.5 8.05C6.64 16.75 4 14.25 4 10.2V5.35l6.5-2.6Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function RankingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 3.25h7v3.5c0 2.25-1.25 4.25-3.5 4.25S7 9 7 6.75v-3.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M7 5.25H4.5v1.1C4.5 8.4 5.72 9.7 7.55 10M14 5.25h2.5v1.1c0 2.05-1.22 3.35-3.05 3.65M10.5 11v3.25M7.75 17.75h5.5M8.5 14.25h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function RecordsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3.5 4.75h5.25c1 0 1.75.72 1.75 1.65v11.1c0-.93-.75-1.65-1.75-1.65H3.5V4.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M17.5 4.75h-5.25c-1 0-1.75.72-1.75 1.65v11.1c0-.93.75-1.65 1.75-1.65h5.25V4.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
