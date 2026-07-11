"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  startEpisodePlacementAction,
  startShowSessionAction,
} from "@/app/ring/actions";

export type ShowScheduleCardData = {
  completedMatches?: number;
  dateLabel: string;
  kind: string;
  matchCount?: number;
  remainingDays: number;
  sessionId?: number | null;
  showId: number;
  title: string;
  variant?: "fade" | "solid";
};

export function ShowScheduleCard({ show }: { show: ShowScheduleCardData }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasSession = Boolean(show.sessionId);

  function openShow() {
    setMessage("");

    if (show.sessionId) {
      router.push(`/ring?sessionId=${show.sessionId}&flow=show`);
      return;
    }

    startTransition(async () => {
      const result = await startShowSessionAction(show.showId);

      if (!result.success || !result.progress?.sessionId) {
        setMessage(result.message);
        return;
      }

      router.push(`/ring?sessionId=${result.progress.sessionId}&flow=show`);
    });
  }

  return (
    <div>
      <button
        aria-busy={isPending}
        className={[
          "flex min-h-[4.625rem] w-full items-start justify-between rounded-2xl",
          "px-5 py-3.5 text-left transition-colors disabled:cursor-wait disabled:opacity-60",
          show.variant === "fade"
            ? "bg-[linear-gradient(102deg,#292e38_0%,rgba(41,46,56,0.6)_100%)]"
            : "bg-[#292e38] hover:bg-[#313742]",
        ].join(" ")}
        disabled={isPending}
        onClick={openShow}
        type="button"
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex self-stretch py-1.5">
            <span aria-hidden className="size-2 rounded-full bg-[#ff0002]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold leading-[1.4] text-[#f0f0f2]">
              {show.title}
            </span>
            <span className="mt-1.5 flex min-w-0 items-center gap-2 text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
              <span className="shrink-0">{show.dateLabel}</span>
              <span aria-hidden className="shrink-0">|</span>
              <span className="truncate">
                {hasSession && show.matchCount
                  ? `${show.completedMatches ?? 0}/${show.matchCount} 매치`
                  : show.kind}
              </span>
            </span>
          </span>
        </span>
        <span className="ml-4 flex shrink-0 items-center justify-center rounded-full bg-[#363d48] px-3 py-1 text-xs font-semibold leading-[1.4] text-white">
          {hasSession ? "계속" : `D-${Math.max(show.remainingDays, 0)}`}
        </span>
      </button>
      {message ? (
        <p className="mt-2 px-1 text-xs font-medium text-[#ff5b5d]" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function EpisodePlacementCard({
  episodeId,
  title,
}: {
  episodeId: number;
  title: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function startPlacement() {
    setMessage("");
    startTransition(async () => {
      const result = await startEpisodePlacementAction(episodeId);

      if (!result.success || !result.progress?.sessionId) {
        setMessage(result.message);
        return;
      }

      router.push(
        `/ring?sessionId=${result.progress.sessionId}&flow=placement&episodeId=${episodeId}`,
      );
    });
  }

  return (
    <div>
      <button
        aria-busy={isPending}
        className="group mt-4 flex min-h-[5.5625rem] w-full items-center justify-between rounded-[20px] border border-[#ff0002]/50 bg-[#292e38] p-5 text-left disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        onClick={startPlacement}
        type="button"
      >
        <span className="min-w-0">
          <span className="block truncate text-lg font-semibold leading-[1.4] text-white">
            {title}
          </span>
          <span className="mt-1.5 block text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
            {isPending ? "매치를 준비하고 있어요." : "대기 중인 배치전을 시작하세요."}
          </span>
        </span>
        <span className="ml-4 shrink-0 text-sm font-semibold text-white">
          시작
        </span>
      </button>
      {message ? (
        <p className="mt-2 px-1 text-xs font-medium text-[#ff5b5d]" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
