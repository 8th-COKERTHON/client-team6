"use server";

import { revalidatePath } from "next/cache";
import {
  createEpisode,
  getBackendErrorMessage,
  suggestEpisodeTitle,
} from "@/lib/backend-api";

export type SaveOnboardingEpisodeInput = {
  content: string;
  date: string;
  title: string;
};

export type SaveOnboardingEpisodeResult = {
  episodeId?: number;
  message: string;
  success: boolean;
};

export type SuggestOnboardingEpisodeTitleResult = {
  message: string;
  success: boolean;
  title?: string;
};

export async function suggestOnboardingEpisodeTitle(
  content: string,
): Promise<SuggestOnboardingEpisodeTitleResult> {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return { message: "내용을 먼저 입력해주세요.", success: false };
  }

  if (normalizedContent.length > 5000) {
    return { message: "내용은 5000자 이하로 입력해주세요.", success: false };
  }

  try {
    const data = await suggestEpisodeTitle(normalizedContent);

    if (!data.title?.trim()) {
      return { message: "AI 제목을 생성하지 못했습니다.", success: false };
    }

    return { message: "", success: true, title: data.title };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "AI 제목을 생성하지 못했습니다."),
      success: false,
    };
  }
}

export async function saveOnboardingEpisode({
  content,
  date,
  title,
}: SaveOnboardingEpisodeInput): Promise<SaveOnboardingEpisodeResult> {
  const normalizedTitle = title.trim();
  const normalizedContent = content.trim();
  const normalizedDate = normalizeEpisodeDate(date);

  if (!normalizedContent) {
    return { message: "내용을 입력해주세요.", success: false };
  }

  if (normalizedContent.length > 5000) {
    return { message: "내용은 5000자 이하로 입력해주세요.", success: false };
  }

  if (!normalizedTitle) {
    return { message: "제목을 입력해주세요.", success: false };
  }

  if (normalizedTitle.length > 150) {
    return { message: "제목은 150자 이하로 입력해주세요.", success: false };
  }

  if (!normalizedDate) {
    return {
      message: "날짜는 YYYY.MM.DD 형식으로 입력해주세요.",
      success: false,
    };
  }

  try {
    const data = await createEpisode({
      content: normalizedContent,
      episodeDate: normalizedDate,
      title: normalizedTitle,
    });

    revalidatePath("/");
    revalidatePath("/onboarding");

    return {
      episodeId: data.episodeId,
      message: "",
      success: true,
    };
  } catch (error) {
    return {
      message: getBackendErrorMessage(error, "에피소드를 등록하지 못했습니다."),
      success: false,
    };
  }
}

function normalizeEpisodeDate(value: string) {
  const match = value.trim().match(/^(\d{4})[.-](\d{2})[.-](\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValidDate =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isValidDate ? `${year}-${month}-${day}` : null;
}
