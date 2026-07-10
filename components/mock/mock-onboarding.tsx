"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MockHomeIndicator,
  MockPageFrame,
} from "@/components/mock/mock-shell";
import { ActionButton } from "@/components/ui/action-button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";
import { isDraftReady, suggestMockTitle } from "@/lib/mock-flow";

const EPISODE_COUNT = 5;

export function MockOnboarding() {
  const router = useRouter();
  const {
    completeOnboarding,
    fillOnboardingSamples,
    state,
    updateOnboarding,
  } = useMockApp();
  const [hasStarted, setHasStarted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState("");
  const activeDraft = state.onboardingDrafts[activeIndex];
  const isLastEpisode = activeIndex === EPISODE_COUNT - 1;
  const isCurrentReady = activeDraft ? isDraftReady(activeDraft) : false;

  function fillSamplesAndStart() {
    fillOnboardingSamples();
    setHasStarted(true);
    setMessage("");
  }

  function updateDraft(
    field: "content" | "date" | "title",
    value: string,
  ) {
    updateOnboarding(activeIndex, { [field]: value });
    setMessage("");
  }

  function generateTitle() {
    if (!activeDraft?.content.trim()) {
      setMessage("내용을 먼저 입력해주세요.");
      return;
    }

    updateDraft("title", suggestMockTitle(activeDraft.content));
  }

  function moveNext() {
    if (!activeDraft || !isCurrentReady) {
      setMessage("제목과 날짜를 입력해주세요.");
      return;
    }

    if (!isLastEpisode) {
      setActiveIndex((current) => current + 1);
      setMessage("");
      return;
    }

    const incompleteIndex = state.onboardingDrafts.findIndex(
      (draft) => !isDraftReady(draft),
    );

    if (incompleteIndex >= 0) {
      setActiveIndex(incompleteIndex);
      setMessage(`${incompleteIndex + 1}번 에피소드를 완성해주세요.`);
      return;
    }

    if (completeOnboarding()) {
      router.replace("/mock/ring");
    }
  }

  if (!hasStarted) {
    return (
      <MockPageFrame>
        <section className="flex min-h-svh flex-col pt-[max(env(safe-area-inset-top),44px)]">
          <div className="flex flex-1 items-center justify-center px-4 pb-20 text-center">
            <div className="w-full max-w-[343px]">
              <span className="inline-flex rounded-full bg-[#292e38] px-3 py-1 text-xs font-semibold text-[#ff5b5d]">
                API-FREE MOCK
              </span>
              <h1 className="mt-5 text-xl font-semibold leading-[1.4] text-white">
                당신의 첫 5개 에피소드로
                <span className="block">10개의 리그전을 시작합니다</span>
              </h1>
              <p className="mt-4 text-sm font-medium leading-[1.6] text-[#b1b9c5]">
                다섯 에피소드가 한 번씩 모두 맞붙고, 선택 결과는 점수와
                랭킹에 바로 반영됩니다.
              </p>
            </div>
          </div>

          <div className="px-4 pt-3.5">
            <ActionButton onClick={() => setHasStarted(true)}>
              직접 등록하기
            </ActionButton>
            <button
              className="mt-3 h-11 w-full text-sm font-semibold text-[#b1b9c5] transition-colors hover:text-white"
              onClick={fillSamplesAndStart}
              type="button"
            >
              샘플 5개로 빠르게 시작
            </button>
            <MockHomeIndicator />
          </div>
        </section>
      </MockPageFrame>
    );
  }

  return (
    <MockPageFrame>
      <section className="flex min-h-svh flex-col pt-[max(env(safe-area-inset-top),44px)]">
        <header className="flex h-[54px] items-center justify-between px-4">
          <button
            aria-label="이전"
            className="flex size-6 items-center justify-start text-white"
            onClick={() => {
              if (activeIndex === 0) {
                setHasStarted(false);
              } else {
                setActiveIndex((current) => current - 1);
              }
              setMessage("");
            }}
            type="button"
          >
            <span className="block size-3 rotate-45 border-b-2 border-l-2 border-white" />
          </button>
          <h1 className="text-lg font-semibold leading-[1.4] text-white">
            에피소드 등록
          </h1>
          <button
            className="text-xs font-semibold text-[#b1b9c5]"
            onClick={fillOnboardingSamples}
            type="button"
          >
            샘플 채우기
          </button>
        </header>

        <section className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
          <div className="flex items-center justify-between px-1">
            {state.onboardingDrafts.map((draft, index) => {
              const isActive = index === activeIndex;
              const isComplete = isDraftReady(draft);

              return (
                <button
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${index + 1}번째 에피소드`}
                  className={[
                    "flex size-[50px] items-center justify-center rounded-full border text-lg font-semibold transition-colors",
                    isActive
                      ? "border-[#ff0002] bg-[#ff0002]/10 text-white"
                      : isComplete
                        ? "border-[#ff0002]/50 bg-[#292e38] text-[#ff5b5d]"
                        : "border-[#363d48] bg-[#292e38]/70 text-[#b1b9c5]",
                  ].join(" ")}
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setMessage("");
                  }}
                  type="button"
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {activeDraft ? (
            <div className="mt-8 flex flex-col gap-8">
              <TextArea
                fieldClassName={activeDraft.content ? "min-h-[110px]" : undefined}
                id={`mock-onboarding-content-${activeIndex}`}
                label="내용"
                maxLength={1000}
                onChange={(event) => updateDraft("content", event.target.value)}
                placeholder="당신의 에피소드를 기록해주세요."
                rows={activeDraft.content ? 3 : 1}
                value={activeDraft.content}
              />

              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium leading-[1.4] text-white"
                  htmlFor={`mock-onboarding-title-${activeIndex}`}
                >
                  제목
                </label>
                <TextInput
                  id={`mock-onboarding-title-${activeIndex}`}
                  maxLength={150}
                  onChange={(event) => updateDraft("title", event.target.value)}
                  placeholder="내용을 바탕으로 제목을 만들어보세요."
                  trailingIcon={
                    <button
                      aria-label="제목 자동 생성"
                      className="text-xs font-semibold text-white disabled:text-[#87919e]"
                      disabled={!activeDraft.content.trim()}
                      onClick={generateTitle}
                      type="button"
                    >
                      자동 생성
                    </button>
                  }
                  value={activeDraft.title}
                />
              </div>

              <TextInput
                id={`mock-onboarding-date-${activeIndex}`}
                inputMode="numeric"
                label="날짜"
                onChange={(event) => updateDraft("date", event.target.value)}
                placeholder="YYYY.MM.DD"
                value={activeDraft.date}
              />

              {message ? (
                <p className="text-sm font-medium text-[#ff5b5d]" role="alert">
                  {message}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <div className="px-4 pt-3.5">
          <ActionButton isActive={isCurrentReady} onClick={moveNext}>
            {isLastEpisode ? "10개 리그전 시작" : "다음 에피소드"}
          </ActionButton>
          <MockHomeIndicator />
        </div>
      </section>
    </MockPageFrame>
  );
}
