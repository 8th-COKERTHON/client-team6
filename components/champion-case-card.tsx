export type ChampionCaseCardProps = {
  className?: string;
  description: string;
  rankLabel: string;
  title: string;
};

export function ChampionCaseCard({
  className,
  description,
  rankLabel,
  title,
}: ChampionCaseCardProps) {
  return (
    <article
      className={[
        "flex w-full items-center gap-4 rounded-2xl bg-[#292e38]/80",
        "px-[clamp(1rem,4.8vw,1.25rem)] py-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
