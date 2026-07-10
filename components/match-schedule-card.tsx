import Link from "next/link";

export type MatchScheduleCardProps = {
  className?: string;
  href: string;
  kind: string;
  title: string;
  dateLabel: string;
  variant?: "solid" | "fade";
};

export function MatchScheduleCard({
  className,
  dateLabel,
  href,
  kind,
  title,
  variant = "fade",
}: MatchScheduleCardProps) {
  return (
    <Link
      className={[
        "group flex w-full items-center justify-between rounded-2xl",
        "px-[clamp(1rem,5.8%,1.25rem)] py-[clamp(0.875rem,2.8vw,1rem)]",
        "text-left transition-transform hover:-translate-y-0.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        "focus-visible:outline-[#ff0002]",
        variant === "solid"
          ? "bg-[#292e38]"
          : "bg-[linear-gradient(102deg,#292e38_0%,rgba(41,46,56,0.6)_100%)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      href={href}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="mt-[0.1875rem] size-2 shrink-0 self-start rounded-full bg-[#ff0002]"
        />
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="truncate text-base font-semibold leading-[1.4] tracking-[-0.01em] text-[#f0f0f2]">
            {title}
          </span>
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium leading-[1.4] tracking-[-0.01em] text-[#b1b9c5]">
            <span className="shrink-0">{dateLabel}</span>
            <span aria-hidden="true" className="shrink-0 text-[#87919e]">
              |
            </span>
            <span className="truncate">{kind}</span>
          </span>
        </span>
      </span>
      <ChevronRightIcon className="ml-3 size-6 shrink-0 text-[#87919e] transition-colors group-hover:text-white" />
    </Link>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
