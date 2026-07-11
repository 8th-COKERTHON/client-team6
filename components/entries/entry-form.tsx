"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createEntry, type CreateEntryResult } from "@/app/episodes/new/actions";
import { startEpisodePlacementAction } from "@/app/ring/actions";
import { MobileHomeIndicator } from "@/components/auth/auth-screen";
import { ActionButton, ActionButtonLink } from "@/components/ui/action-button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";

type EntryCompletion = Pick<
  CreateEntryResult,
  "availableEpisodeCount" | "canStartMatch" | "episodeId"
>;

export function EntryForm() {
  const [completion, setCompletion] = useState<EntryCompletion | null>(null);
  const [content, setContent] = useState("");
  const [date, setDate] = useState(() => formatDateForDisplay(new Date()));
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, startSavingTransition] = useTransition();
  const canSubmit = Boolean(title.trim() && content.trim() && date.trim());

  function handleContentChange(value: string) {
    setContent(value);
    setMessage("");
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setMessage("");
  }

  function handleDateChange(value: string) {
    setDate(value);
    setMessage("");
  }

  function submitEntry() {
    if (!canSubmit || isSaving) {
      return;
    }

    setMessage("");

    startSavingTransition(async () => {
      const result = await createEntry({
        content,
        date,
        title,
      });

      if (!result.success || !result.episodeId) {
        setMessage(result.message);
        return;
      }

      setCompletion({
        availableEpisodeCount: result.availableEpisodeCount,
        canStartMatch: result.canStartMatch,
        episodeId: result.episodeId,
      });
    });
  }

  if (completion) {
    return <EntryCompleteScreen completion={completion} />;
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-[375px] flex-col bg-[#12161b] pt-[max(env(safe-area-inset-top),44px)]">
        <EntryTopBar />

        <section className="flex-1 overflow-y-auto px-4 pt-6 pb-6">
          <div className="flex flex-col gap-8">
            <TextInput
              disabled={isSaving}
              id="entry-title"
              label="제목 입력"
              maxLength={150}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="에피소드 제목을 입력해주세요."
              type="text"
              value={title}
            />

            <TextArea
              disabled={isSaving}
              fieldClassName={content ? "min-h-[110px]" : "min-h-[52px]"}
              id="entry-content"
              label="내용"
              maxLength={5000}
              onChange={(event) => handleContentChange(event.target.value)}
              placeholder="오늘의 에피소드를 기록해주세요."
              rows={content ? 3 : 1}
              textareaClassName={content ? "min-h-[78px]" : "min-h-6"}
              value={content}
            />

            <TextInput
              disabled={isSaving}
              id="entry-date"
              inputMode="numeric"
              label="날짜"
              onChange={(event) => handleDateChange(event.target.value)}
              placeholder="YYYY.MM.DD"
              trailingIcon={
                <DatePickerButton
                  date={date}
                  disabled={isSaving}
                  onChange={handleDateChange}
                />
              }
              type="text"
              value={date}
            />

            {message ? (
              <p
                className="text-sm font-medium leading-[1.4] text-[#ff0002]"
                role="alert"
              >
                {message}
              </p>
            ) : null}
          </div>
        </section>

        <div className="px-4 pt-3.5">
          <ActionButton
            disabled={isSaving}
            isActive={canSubmit}
            onClick={submitEntry}
            type="button"
          >
            {isSaving ? "등록 중..." : "등록"}
          </ActionButton>
          <MobileHomeIndicator />
        </div>
      </section>
    </main>
  );
}

function EntryCompleteScreen({
  completion,
}: {
  completion: EntryCompletion;
}) {
  const router = useRouter();
  const canStartMatch = completion.canStartMatch === true;
  const [message, setMessage] = useState("");
  const [isStarting, startTransition] = useTransition();

  function startPlacement() {
    if (!completion.episodeId) {
      setMessage("에피소드 정보가 올바르지 않습니다.");
      return;
    }

    setMessage("");
    startTransition(async () => {
      const result = await startEpisodePlacementAction(completion.episodeId!);

      if (!result.success || !result.progress?.sessionId) {
        setMessage(result.message);
        return;
      }

      router.push(
        `/ring?sessionId=${result.progress.sessionId}&flow=placement&episodeId=${completion.episodeId}`,
      );
    });
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-[375px] flex-col bg-[#12161b] pt-[max(env(safe-area-inset-top),44px)]">
        <div className="flex flex-1 items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+6.25rem)] text-center">
          <div className="flex w-full max-w-[343px] flex-col items-center">
            <div className="flex size-[120px] items-center justify-center rounded-full bg-[#ff0002] text-white">
              <CheckIcon />
            </div>
            <h1 className="mt-8 text-xl font-semibold leading-[1.4] text-white">
              에피소드 등록이 완료되었습니다.
            </h1>
            <p className="mt-2 max-w-[292px] text-sm font-medium leading-[1.6] text-[#b1b9c5]">
              {canStartMatch
                ? "랜덤으로 뽑힌 기존 에피소드 5개와 데뷔 매치(Debut Match)를 진행해 보세요."
                : "등록한 에피소드는 홈과 기록실에서 다시 확인할 수 있어요."}
            </p>
            {message ? (
              <p className="mt-4 text-sm font-medium text-[#ff5b5d]" role="alert">
                {message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-4 pt-3.5">
          {canStartMatch ? (
            <>
              <ActionButton disabled={isStarting} onClick={startPlacement}>
                {isStarting ? "매치 준비 중..." : "바로 매치 시작"}
              </ActionButton>
              <Link
                className="mt-3 flex h-10 items-center justify-center text-sm font-semibold text-[#b1b9c5]"
                href="/"
              >
                나중에 하기
              </Link>
            </>
          ) : (
            <ActionButtonLink href="/">홈으로 이동</ActionButtonLink>
          )}
          <MobileHomeIndicator />
        </div>
      </section>
    </main>
  );
}

function EntryTopBar() {
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
        에피소드 등록
      </h1>
      <span aria-hidden="true" className="size-6" />
    </header>
  );
}

function DatePickerButton({
  date,
  disabled,
  onChange,
}: {
  date: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parseDisplayDate(date) ?? new Date()),
  );
  const selectedDate = parseDisplayDate(date);
  const calendarDays = getCalendarDays(visibleMonth);
  const today = new Date();
  const monthLabel = `${visibleMonth.getFullYear()}년 ${visibleMonth.getMonth() + 1}월`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        pickerRef.current &&
        event.target instanceof Node &&
        !pickerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function togglePicker() {
    if (disabled) {
      return;
    }

    setVisibleMonth(startOfMonth(parseDisplayDate(date) ?? new Date()));
    setIsOpen((current) => !current);
  }

  function selectDate(nextDate: Date) {
    onChange(formatDateForDisplay(nextDate));
    setVisibleMonth(startOfMonth(nextDate));
    setIsOpen(false);
  }

  function selectToday() {
    selectDate(new Date());
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="날짜 선택"
        className={[
          "flex size-7 items-center justify-center rounded-lg text-white transition-colors",
          "hover:bg-white/10 focus-visible:outline focus-visible:outline-2",
          "focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]",
          "disabled:cursor-not-allowed disabled:text-[#87919e]",
        ].join(" ")}
        disabled={disabled}
        onClick={togglePicker}
        title="날짜 선택"
        type="button"
      >
        <CalendarIcon />
      </button>

      {isOpen ? (
        <div
          aria-label="날짜 선택"
          className={[
            "absolute right-0 top-10 z-50 w-[19.5rem] overflow-hidden rounded-xl",
            "border border-[#3b424d] bg-[#1a1f27] text-white shadow-[0_18px_44px_rgba(0,0,0,0.42)]",
          ].join(" ")}
          role="dialog"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
            <button
              aria-label="이전 달"
              className="flex size-8 items-center justify-center rounded-lg text-[#b1b9c5] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
              type="button"
            >
              <ChevronLeftIcon />
            </button>
            <p className="text-sm font-semibold leading-[1.4] tracking-[-0.01em]">
              {monthLabel}
            </p>
            <button
              aria-label="다음 달"
              className="flex size-8 items-center justify-center rounded-lg text-[#b1b9c5] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              type="button"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="px-3 pb-3 pt-2">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#87919e]">
              {WEEKDAY_LABELS.map((label) => (
                <span className="flex h-7 items-center justify-center" key={label}>
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = selectedDate
                  ? isSameCalendarDate(day, selectedDate)
                  : false;
                const isToday = isSameCalendarDate(day, today);
                const dayTone = isSelected
                  ? "bg-[#ff0002] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
                  : isToday
                    ? "border border-[#ff0002] text-white"
                    : isCurrentMonth
                      ? "border border-transparent text-[#f0f0f2] hover:bg-white/10"
                      : "border border-transparent text-[#606a78] hover:bg-white/10 hover:text-[#b1b9c5]";

                return (
                  <button
                    aria-pressed={isSelected}
                    className={[
                      "flex aspect-square items-center justify-center rounded-lg text-sm font-semibold",
                      "leading-none transition-colors focus-visible:outline focus-visible:outline-2",
                      "focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]",
                      dayTone,
                    ].join(" ")}
                    key={formatDateKey(day)}
                    onClick={() => selectDate(day)}
                    type="button"
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <button
                className="rounded-lg px-3 py-2 text-[13px] font-semibold leading-[1.4] text-[#b1b9c5] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                닫기
              </button>
              <button
                className="rounded-lg bg-[#292e38] px-3 py-2 text-[13px] font-semibold leading-[1.4] text-white transition-colors hover:bg-[#363d48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
                onClick={selectToday}
                type="button"
              >
                오늘
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 3.2v2.4M14.5 3.2v2.4M3.6 7.4h12.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M4.5 4.4h11a1.6 1.6 0 0 1 1.6 1.6v9.2a1.6 1.6 0 0 1-1.6 1.6h-11a1.6 1.6 0 0 1-1.6-1.6V6a1.6 1.6 0 0 1 1.6-1.6Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M6.2 10.4h.05M10 10.4h.05M13.8 10.4h.05M6.2 13.7h.05M10 13.7h.05"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.1"
      />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m10 3.5-4.5 4.5 4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m6 3.5 4.5 4.5-4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-14"
      fill="none"
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m17 29 7 7 16-17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </svg>
  );
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDateForDisplay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function parseDisplayDate(value: string) {
  const match = value.trim().match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  const isValidDate =
    parsedDate.getFullYear() === Number(year) &&
    parsedDate.getMonth() === Number(month) - 1 &&
    parsedDate.getDate() === Number(day);

  return isValidDate ? parsedDate : null;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const firstVisibleDay = new Date(firstDay);
  firstVisibleDay.setDate(firstVisibleDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });
}

function isSameCalendarDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
