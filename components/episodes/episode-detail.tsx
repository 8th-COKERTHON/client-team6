import Link from "next/link";
import type { EpisodeDetailResponse } from "@/lib/backend-types";

export function EpisodeDetail({ episode }: { episode: EpisodeDetailResponse }) {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="mx-auto min-h-svh w-full max-w-[375px] bg-[#12161b]">
        <header className="flex h-[calc(max(env(safe-area-inset-top),44px)+54px)] items-end justify-between px-4 pb-[9px]">
          <Link
            aria-label="랭킹으로 돌아가기"
            className="flex size-6 items-center justify-center text-white"
            href="/ranking"
          >
            <BackIcon />
          </Link>
          <h1 className="text-lg font-semibold leading-[1.4]">에피소드 상세</h1>
          <span aria-hidden className="size-6" />
        </header>

        <article className="px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-8">
          <p className="text-sm font-medium text-[#b1b9c5]">
            {formatDateLabel(episode.episodeDate)}
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-[1.35] text-white">
            {episode.title}
          </h2>

          <dl className="mt-8 grid grid-cols-2 gap-2">
            <DetailMetric label="점수" value={`${episode.titleScore}점`} />
            <DetailMetric label="상태" value={formatStatus(episode.status)} />
          </dl>

          <section aria-labelledby="episode-content-title" className="mt-10">
            <h3 className="text-sm font-semibold text-[#b1b9c5]" id="episode-content-title">
              내용
            </h3>
            <p className="mt-3 whitespace-pre-wrap break-words text-base font-medium leading-[1.75] text-[#f0f0f2]">
              {episode.content}
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#292e38] px-4 py-3.5">
      <dt className="text-xs font-medium text-[#b1b9c5]">{label}</dt>
      <dd className="mt-1.5 truncate text-base font-semibold text-white">{value}</dd>
    </div>
  );
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    AVAILABLE: "매치 가능",
    MATCHED: "배치 완료",
    PENDING: "배치 대기",
  };
  return labels[value.toUpperCase()] ?? value;
}

function BackIcon() {
  return (
    <svg aria-hidden fill="none" viewBox="0 0 24 24">
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
