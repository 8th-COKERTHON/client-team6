"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  createEntry,
  suggestEntryTitle,
  type CreateEntryResult,
} from "@/app/episodes/new/actions";
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
  const [isSuggesting, startSuggestingTransition] = useTransition();
  const canSubmit = Boolean(content.trim() && date.trim());

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

  function generateTitle() {
    setMessage("");

    startSuggestingTransition(async () => {
      const result = await suggestEntryTitle(content);

      if (!result.success || !result.title) {
        setMessage(result.message);
        return;
      }

      setTitle(result.title);
    });
  }

  function submitEntry() {
    if (!canSubmit || isSaving) {
      return;
    }

    setMessage("");

    startSavingTransition(async () => {
      let finalTitle = title.trim();

      if (!finalTitle) {
        const suggestion = await suggestEntryTitle(content);

        if (!suggestion.success || !suggestion.title) {
          setMessage(suggestion.message);
          return;
        }

        finalTitle = suggestion.title;
        setTitle(finalTitle);
      }

      const result = await createEntry({
        content,
        date,
        title: finalTitle,
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

            <div className="flex w-full flex-col gap-2">
              <FieldLabel htmlFor="entry-title" icon={<SparkleIcon />}>
                AI 제목 생성
              </FieldLabel>
              <TextInput
                aria-label="AI 제목 생성"
                disabled={isSaving}
                id="entry-title"
                maxLength={150}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="내용 입력 후 AI 제목이 생성돼요."
                trailingIcon={
                  <RefreshTitleButton
                    disabled={!content.trim() || isSaving}
                    isPending={isSuggesting}
                    onClick={generateTitle}
                  />
                }
                type="text"
                value={title}
              />
            </div>

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
                className="text-sm font-medium leading-[1.4] tracking-[-0.01em] text-[#ff0002]"
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
  const canStartMatch = completion.canStartMatch === true;

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-[375px] flex-col bg-[#12161b] pt-[max(env(safe-area-inset-top),44px)]">
        <div className="flex flex-1 items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+6.25rem)] text-center">
          <div className="flex w-full max-w-[343px] flex-col items-center">
            <div className="flex size-[120px] items-center justify-center rounded-full bg-[#ff0002] text-white">
              <CheckIcon />
            </div>
            <h1 className="mt-8 text-xl font-semibold leading-[1.4] tracking-[-0.01em] text-white">
              에피소드 등록이 완료되었습니다.
            </h1>
            <p className="mt-2 max-w-[292px] text-sm font-medium leading-[1.6] tracking-[-0.01em] text-[#b1b9c5]">
              {canStartMatch
                ? "랜덤으로 뽑힌 기존 에피소드 5개와 데뷔 매치(Debut Match)를 진행해 보세요."
                : "등록한 에피소드는 홈과 기록실에서 다시 확인할 수 있어요."}
            </p>
          </div>
        </div>

        <div className="px-4 pt-3.5">
          <ActionButtonLink href={canStartMatch ? "/ring" : "/"}>
            {canStartMatch ? "바로 매치 시작" : "홈으로 이동"}
          </ActionButtonLink>
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

function FieldLabel({
  children,
  htmlFor,
  icon,
}: {
  children: string;
  htmlFor: string;
  icon?: React.ReactNode;
}) {
  return (
    <label
      className="flex items-center gap-1 text-sm font-medium leading-[1.4] tracking-[-0.01em] text-white"
      htmlFor={htmlFor}
    >
      {icon ? <span className="flex size-5 items-center justify-center">{icon}</span> : null}
      {children}
    </label>
  );
}

function RefreshTitleButton({
  disabled,
  isPending,
  onClick,
}: {
  disabled: boolean;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label="AI 제목 생성"
      className="flex size-5 items-center justify-center text-white disabled:text-[#87919e]"
      disabled={disabled || isPending}
      onClick={onClick}
      type="button"
    >
      <RefreshIcon />
    </button>
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
  const inputValue = toDateInputValue(date);

  return (
    <label className="relative flex h-5 cursor-pointer items-center text-[13px] font-medium leading-[1.4] text-white">
      선택
      <input
        aria-label="날짜 선택"
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={disabled}
        onChange={(event) => {
          if (event.target.value) {
            onChange(formatDateInputValue(event.target.value));
          }
        }}
        type="date"
        value={inputValue}
      />
    </label>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1.5 8.05 5 11.5 6.05 8.05 7.1 7 10.5 5.95 7.1 2.5 6.05 5.95 5 7 1.5Z"
        fill="currentColor"
      />
      <path
        d="M12 9 12.55 10.8 14.35 11.35 12.55 11.9 12 13.7 11.45 11.9 9.65 11.35 11.45 10.8 12 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.2 10.1a6.2 6.2 0 0 1-10.7 4.25M3.8 9.9A6.2 6.2 0 0 1 14.5 5.65"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M14.8 2.8v3.1h-3.1M5.2 17.2v-3.1h3.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
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

function formatDateForDisplay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function formatDateInputValue(value: string) {
  return value.replaceAll("-", ".");
}

function toDateInputValue(value: string) {
  const match = value.trim().match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);

  if (!match) {
    return "";
  }

  const [, year, month, day] = match;

  return `${year}-${month}-${day}`;
}
