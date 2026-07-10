import Link from "next/link";
import type { ReactNode } from "react";

type AuthTopBarProps = {
  title: string;
};

type AuthContentProps = {
  children: ReactNode;
  className?: string;
};

type AuthBottomActionProps = {
  children: ReactNode;
};

type MobileHomeIndicatorProps = {
  className?: string;
};

export function AuthTopBar({ title }: AuthTopBarProps) {
  return (
    <header className="relative flex h-[54px] items-center justify-between px-4">
      <Link
        aria-label="뒤로가기"
        className="flex size-6 items-center justify-start text-white"
        href="/"
      >
        <span className="block size-3 rotate-45 border-b-2 border-l-2 border-white" />
      </Link>
      <h1 className="text-lg font-semibold leading-[1.4] tracking-[-0.02em] text-white">
        {title}
      </h1>
      <span aria-hidden className="size-6" />
    </header>
  );
}

export function AuthContent({ children, className }: AuthContentProps) {
  return (
    <div
      className={["px-4 pt-6", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

export function AuthBottomAction({ children }: AuthBottomActionProps) {
  return (
    <div className="mt-auto px-4 pt-3.5">
      {children}
      <MobileHomeIndicator />
    </div>
  );
}

export function MobileHomeIndicator({ className }: MobileHomeIndicatorProps) {
  return (
    <div
      className={[
        "flex h-[calc(env(safe-area-inset-bottom)+34px)] items-end justify-center pb-[max(env(safe-area-inset-bottom),8px)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="h-[5px] w-[134px] rounded-full bg-white/85" />
    </div>
  );
}

export function PasswordHiddenIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.1 2.5 17.5 16.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 5.35A7.7 7.7 0 0 1 10 5.13c4.05 0 6.45 3.58 7.1 4.75a.85.85 0 0 1 0 .82 13 13 0 0 1-2.25 2.86M12.2 12.35a3 3 0 0 1-4.08-4.08"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.45 13.1a7.7 7.7 0 0 1-.45.02c-4.05 0-6.45-3.58-7.1-4.75a.85.85 0 0 1 0-.82 12.3 12.3 0 0 1 2.65-3.17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
