"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveOnboardingEpisode } from "@/app/onboarding/actions";
import { startOnboardingPlacementAction } from "@/app/ring/actions";
import { MobileHomeIndicator } from "@/components/auth/auth-screen";
import { ActionButton } from "@/components/ui/action-button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";

type OnboardingStep = "welcome" | "episodes";

type EpisodeDraft = {
  content: string;
  date: string;
  episodeId?: number;
  title: string;
};

export type OnboardingInitialEpisode = EpisodeDraft;

const EPISODE_COUNT = 5;

export function OnboardingFlow({
  initialEpisodes = [],
}: {
  initialEpisodes?: OnboardingInitialEpisode[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(() =>
    initialEpisodes.length > 0 ? "episodes" : "welcome",
  );
  const [episodes, setEpisodes] = useState<EpisodeDraft[]>(() =>
    createInitialEpisodes(initialEpisodes),
  );
  const [activeIndex, setActiveIndex] = useState(() =>
    getInitialActiveIndex(initialEpisodes),
  );
  const [message, setMessage] = useState("");
  const [isSaving, startSavingTransition] = useTransition();

  const activeEpisode = episodes[activeIndex];
  const isActiveEpisodeSaved = Boolean(activeEpisode.episodeId);
  const isActiveEpisodeReady =
    isActiveEpisodeSaved || isEpisodeReady(activeEpisode);
  const isLastEpisode = activeIndex === EPISODE_COUNT - 1;

  function updateEpisode(field: keyof EpisodeDraft, value: string) {
    setMessage("");
    setEpisodes((currentEpisodes) =>
      currentEpisodes.map((episode, index) =>
        index === activeIndex
          ? { ...episode, [field]: value, episodeId: undefined }
          : episode,
      ),
    );
  }

  function handleBack() {
    if (activeIndex > 0) {
      setActiveIndex((currentIndex) => currentIndex - 1);
      return;
    }

    setStep("welcome");
  }

  function handlePrimaryAction() {
    if (step === "welcome") {
      setStep("episodes");
      return;
    }

    if (!isActiveEpisodeReady) {
      return;
    }

    if (activeEpisode.episodeId && !isLastEpisode) {
      setActiveIndex((currentIndex) => currentIndex + 1);
      return;
    }

    setMessage("");

    startSavingTransition(async () => {
      if (activeEpisode.episodeId && isLastEpisode) {
        await beginPlacement();
        return;
      }

      const result = await saveOnboardingEpisode({
        content: activeEpisode.content,
        date: activeEpisode.date,
        title: activeEpisode.title,
      });

      if (!result.success || !result.episodeId) {
        setMessage(result.message);
        return;
      }

      setEpisodes((currentEpisodes) =>
        currentEpisodes.map((episode, index) =>
          index === activeIndex
            ? { ...episode, episodeId: result.episodeId }
            : episode,
        ),
      );

      if (isLastEpisode) {
        await beginPlacement();
        return;
      }

      setActiveIndex((currentIndex) => currentIndex + 1);
    });
  }

  async function beginPlacement() {
    const result = await startOnboardingPlacementAction();

    if (!result.success || !result.progress?.sessionId) {
      setMessage(result.message);
      return;
    }

    router.replace(
      `/ring?sessionId=${result.progress.sessionId}&flow=onboarding`,
    );
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-[375px] flex-col bg-[#12161b] pt-[max(env(safe-area-inset-top),44px)]">
        {step === "welcome" ? (
          <WelcomeScreen onStart={handlePrimaryAction} />
        ) : (
          <EpisodeRegistrationScreen
            activeEpisode={activeEpisode}
            activeIndex={activeIndex}
            isPending={isSaving}
            isPrimaryActive={isActiveEpisodeReady}
            message={message}
            onBack={handleBack}
            onPrimaryAction={handlePrimaryAction}
            onSelectEpisode={setActiveIndex}
            onUpdateEpisode={updateEpisode}
          />
        )}
      </section>
    </main>
  );
}

type WelcomeScreenProps = {
  onStart: () => void;
};

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <>
      <div className="flex flex-1 items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+6.25rem)] text-center">
        <div className="w-full max-w-[343px]">
          <h1 className="text-xl font-semibold leading-[1.4] tracking-[-0.01em] text-white">
            <span className="block">환영합니다!</span>
            <span className="block">이제 당신의 링을 만들 차례예요</span>
          </h1>
          <p className="mt-4 text-sm font-medium leading-[1.6] tracking-[-0.01em] text-[#b1b9c5]">
            당신을 가장 힘들게 했던 에피소드 5가지를 등록해주세요.
            이 기억들이 서로 맞붙으며, 첫 올타임 챔피언(All-Time Champion)이
            탄생하게 됩니다.
          </p>
        </div>
      </div>

      <div className="px-4 pt-3.5">
        <ActionButton onClick={onStart}>시작하기</ActionButton>
        <MobileHomeIndicator />
      </div>
    </>
  );
}

type EpisodeRegistrationScreenProps = {
  activeEpisode: EpisodeDraft;
  activeIndex: number;
  isPending: boolean;
  isPrimaryActive: boolean;
  message: string;
  onBack: () => void;
  onPrimaryAction: () => void;
  onSelectEpisode: (index: number) => void;
  onUpdateEpisode: (field: keyof EpisodeDraft, value: string) => void;
};

function EpisodeRegistrationScreen({
  activeEpisode,
  activeIndex,
  isPending,
  isPrimaryActive,
  message,
  onBack,
  onPrimaryAction,
  onSelectEpisode,
  onUpdateEpisode,
}: EpisodeRegistrationScreenProps) {
  const isLastEpisode = activeIndex === EPISODE_COUNT - 1;
  const isSaved = Boolean(activeEpisode.episodeId);

  return (
    <>
      <OnboardingTopBar onBack={onBack} />

      <section className="flex-1 overflow-y-auto px-4 pt-6 pb-6">
        <EpisodeProgress
          activeIndex={activeIndex}
          onSelectEpisode={onSelectEpisode}
        />

        <div className="mt-8 flex flex-col gap-8">
          <TextInput
            disabled={isSaved || isPending}
            id="episode-title"
            label="제목 입력"
            maxLength={150}
            onChange={(event) => onUpdateEpisode("title", event.target.value)}
            placeholder="에피소드 제목을 입력해주세요."
            type="text"
            value={activeEpisode.title}
          />

          <TextArea
            disabled={isSaved || isPending}
            id="episode-content"
            label="내용"
            maxLength={5000}
            onChange={(event) => onUpdateEpisode("content", event.target.value)}
            placeholder="당신의 에피소드를 기록해주세요."
            rows={activeEpisode.content ? 3 : 1}
            value={activeEpisode.content}
          />

          <TextInput
            disabled={isSaved || isPending}
            id="episode-date"
            inputMode="numeric"
            label="날짜"
            onChange={(event) => onUpdateEpisode("date", event.target.value)}
            placeholder="YYYY.MM.DD"
            trailingIcon={
              <span className="text-[13px] font-medium leading-[1.4] text-white">
                선택
              </span>
            }
            type="text"
            value={activeEpisode.date}
          />

          {message ? (
            <p className="text-sm font-medium leading-[1.4] text-[#ff0002]" role="alert">
              {message}
            </p>
          ) : null}
        </div>
      </section>

      <div className="px-4 pt-3.5">
        <ActionButton
          disabled={isPending}
          isActive={isPrimaryActive}
          onClick={onPrimaryAction}
          type="button"
        >
          {isPending
            ? isLastEpisode
              ? "배치전 준비 중..."
              : "등록 중..."
            : isLastEpisode
              ? "등록 완료하고 배치전 시작하기"
              : "다음 에피소드 등록하기"}
        </ActionButton>
        <MobileHomeIndicator />
      </div>
    </>
  );
}

type OnboardingTopBarProps = {
  onBack: () => void;
};

function OnboardingTopBar({ onBack }: OnboardingTopBarProps) {
  return (
    <header className="relative flex h-[54px] items-center justify-between px-4">
      <button
        aria-label="이전"
        className="flex size-6 items-center justify-start text-white"
        onClick={onBack}
        type="button"
      >
        <span className="block size-3 rotate-45 border-b-2 border-l-2 border-white" />
      </button>
      <h1 className="text-lg font-semibold leading-[1.4] tracking-[-0.02em] text-white">
        에피소드 등록
      </h1>
      <span aria-hidden className="size-6" />
    </header>
  );
}

type EpisodeProgressProps = {
  activeIndex: number;
  onSelectEpisode: (index: number) => void;
};

function EpisodeProgress({ activeIndex, onSelectEpisode }: EpisodeProgressProps) {
  return (
    <div className="flex items-center justify-between px-1">
      {Array.from({ length: EPISODE_COUNT }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            aria-label={`${index + 1}번째 에피소드`}
            className={[
              "flex size-[50px] items-center justify-center rounded-full border text-lg font-semibold leading-[1.4] tracking-[-0.01em]",
              "transition-colors",
              isActive
                ? "border-[1.5px] border-[#ff0002] bg-[#ff0002]/10 text-white"
                : "border-[#363d48] bg-[#292e38]/70 text-[#b1b9c5]",
            ].join(" ")}
            key={index}
            onClick={() => onSelectEpisode(index)}
            type="button"
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}

function createEpisodeDraft(): EpisodeDraft {
  return {
    content: "",
    date: formatDateForDisplay(new Date()),
    title: "",
  };
}

function createInitialEpisodes(initialEpisodes: OnboardingInitialEpisode[]) {
  return Array.from({ length: EPISODE_COUNT }, (_, index) =>
    initialEpisodes[index]
      ? { ...initialEpisodes[index] }
      : createEpisodeDraft(),
  );
}

function getInitialActiveIndex(initialEpisodes: OnboardingInitialEpisode[]) {
  const firstIncompleteIndex = initialEpisodes.findIndex(
    (episode) => !episode.episodeId,
  );

  if (firstIncompleteIndex >= 0) {
    return firstIncompleteIndex;
  }

  return Math.min(initialEpisodes.length, EPISODE_COUNT - 1);
}

function isEpisodeReady(episode: EpisodeDraft) {
  return Boolean(
    episode.title.trim() && episode.content.trim() && episode.date.trim(),
  );
}

function formatDateForDisplay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}
