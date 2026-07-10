"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MockArenaBackground,
  MockHeader,
  MockPageFrame,
} from "@/components/mock/mock-shell";
import {
  getActiveSession,
  formatDateForDisplay,
  getSessionTypeLabel,
} from "@/lib/mock-flow";

export function MockHome() {
  const router = useRouter();
  const { reset, startMonthly, startWeekly, state } = useMockApp();
  const activeSession = getActiveSession(state);
  const eventDate = formatDateForDisplay(new Date());

  function resetFlow() {
    reset();
    router.replace("/mock/onboarding");
  }

  function startEvent(type: "weekly" | "monthly") {
    const didStart = type === "weekly" ? startWeekly() : startMonthly();

    if (didStart) {
      router.push("/mock/ring");
    }
  }

  return (
    <MockPageFrame withNavigation>
      <MockArenaBackground />
      <MockHeader onReset={resetFlow} />

      <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-6">
        <h1 className="text-base font-semibold leading-[1.4] text-white">
          {activeSession ? "진행 중인 매치" : "오늘의 에피소드 등록"}
        </h1>

        {activeSession ? (
          <Link
            className="mt-4 flex min-h-[88px] items-center justify-between rounded-[20px] border border-[#ff0002]/50 bg-[#292e38] p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
            href="/mock/ring"
          >
            <span className="min-w-0">
              <span className="block truncate text-lg font-semibold text-white">
                {getSessionTypeLabel(activeSession.type)}
              </span>
              <span className="mt-1 block text-[13px] font-medium text-[#b1b9c5]">
                {activeSession.currentMatchIndex + 1}/{activeSession.totalRounds} 매치
              </span>
            </span>
            <span className="ml-4 text-sm font-semibold text-white">계속하기</span>
          </Link>
        ) : (
          <Link
            className="group mt-4 flex min-h-[88px] items-center justify-between rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
            href="/mock/episodes/new"
          >
            <span className="min-w-0">
              <span className="block text-lg font-semibold text-white">
                지금 에피소드를 등록해 보세요.
              </span>
              <span className="mt-1.5 block text-[13px] font-medium text-[#b1b9c5]">
                바로 매칭을 시작할 수 있어요.
              </span>
            </span>
            <span className="ml-4 flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#ff0002] text-2xl font-light text-white transition-transform group-hover:rotate-90">
              +
            </span>
          </Link>
        )}

        <section className="mt-8" aria-labelledby="mock-event-title">
          <h2 className="text-base font-semibold text-white" id="mock-event-title">
            예정된 매치 일정
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            <EventButton
              dateLabel={eventDate}
              disabled={Boolean(activeSession)}
              kind="Weekly Show"
              label="Monday Night Rivals"
              onClick={() => startEvent("weekly")}
            />
            <EventButton
              dateLabel={eventDate}
              disabled={Boolean(activeSession)}
              kind="Monthly Show"
              label="Monthly Royal Rumble"
              onClick={() => startEvent("monthly")}
            />
          </div>
        </section>
      </section>
    </MockPageFrame>
  );
}

function EventButton({
  dateLabel,
  disabled,
  kind,
  label,
  onClick,
}: {
  dateLabel: string;
  disabled: boolean;
  kind: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex min-h-[74px] w-full items-start justify-between rounded-2xl bg-[#292e38] px-5 py-3.5 text-left transition-colors hover:bg-[#313742] disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="flex min-w-0 items-start gap-3">
        <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[#ff0002]" />
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-[#f0f0f2]">
            {label}
          </span>
          <span className="mt-1.5 block truncate text-[13px] font-medium text-[#b1b9c5]">
            {dateLabel} | {kind}
          </span>
        </span>
      </span>
      <span className="ml-4 shrink-0 rounded-full bg-[#363d48] px-3 py-1 text-xs font-semibold text-white">
        D-0
      </span>
    </button>
  );
}
