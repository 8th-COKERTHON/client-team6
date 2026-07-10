"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

type ApiResponse<T> = {
  code?: string;
  data?: T;
  message?: string;
  success?: boolean;
};

type CreateEpisodeResponse = {
  availableEpisodeCount?: number;
  canStartMatch?: boolean;
  createdAt?: string;
  currentTitle?: string;
  episodeId?: number;
  status?: string;
  titleScore?: number;
};

type TitleSuggestionResponse = {
  title?: string;
};

export type CreateEntryInput = {
  content: string;
  date: string;
  title: string;
};

export type CreateEntryResult = {
  availableEpisodeCount?: number;
  canStartMatch?: boolean;
  episodeId?: number;
  message: string;
  success: boolean;
};

export type SuggestEntryTitleResult = {
  message: string;
  success: boolean;
  title?: string;
};

export async function suggestEntryTitle(
  content: string,
): Promise<SuggestEntryTitleResult> {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return {
      message: "내용을 먼저 입력해주세요.",
      success: false,
    };
  }

  if (normalizedContent.length > 5000) {
    return {
      message: "내용은 5000자 이하로 입력해주세요.",
      success: false,
    };
  }

  const request = await createBackendRequest("/api/v1/episodes/title-suggestions");

  if (!request.success) {
    return request;
  }

  try {
    const response = await fetch(request.url, {
      body: JSON.stringify({ content: normalizedContent }),
      headers: request.headers,
      method: "POST",
    });
    const data = await readApiResponse<TitleSuggestionResponse>(response);

    if (!response.ok || data.success === false || !data.data?.title) {
      return {
        message: data.message || "AI 제목을 생성하지 못했습니다.",
        success: false,
      };
    }

    return {
      message: "",
      success: true,
      title: data.data.title,
    };
  } catch {
    return {
      message: "백엔드에 연결하지 못했습니다.",
      success: false,
    };
  }
}

export async function createEntry({
  content,
  date,
  title,
}: CreateEntryInput): Promise<CreateEntryResult> {
  const normalizedContent = content.trim();
  const normalizedDate = normalizeEpisodeDate(date);
  const normalizedTitle = title.trim();

  if (!normalizedContent) {
    return {
      message: "내용을 입력해주세요.",
      success: false,
    };
  }

  if (normalizedContent.length > 5000) {
    return {
      message: "내용은 5000자 이하로 입력해주세요.",
      success: false,
    };
  }

  if (!normalizedTitle) {
    return {
      message: "제목을 입력하거나 AI 제목을 생성해주세요.",
      success: false,
    };
  }

  if (normalizedTitle.length > 150) {
    return {
      message: "제목은 150자 이하로 입력해주세요.",
      success: false,
    };
  }

  if (!normalizedDate) {
    return {
      message: "날짜는 YYYY.MM.DD 형식으로 입력해주세요.",
      success: false,
    };
  }

  const request = await createBackendRequest("/api/v1/episodes");

  if (!request.success) {
    return request;
  }

  try {
    const response = await fetch(request.url, {
      body: JSON.stringify({
        content: normalizedContent,
        episodeDate: normalizedDate,
        title: normalizedTitle,
      }),
      headers: request.headers,
      method: "POST",
    });
    const data = await readApiResponse<CreateEpisodeResponse>(response);

    if (!response.ok || data.success === false || !data.data?.episodeId) {
      return {
        message: data.message || "에피소드를 등록하지 못했습니다.",
        success: false,
      };
    }

    revalidatePath("/");
    revalidatePath("/episodes/new");
    revalidatePath("/ring");

    return {
      availableEpisodeCount: data.data.availableEpisodeCount,
      canStartMatch: data.data.canStartMatch,
      episodeId: data.data.episodeId,
      message: "",
      success: true,
    };
  } catch {
    return {
      message: "백엔드에 연결하지 못했습니다.",
      success: false,
    };
  }
}

async function createBackendRequest(path: string) {
  const session = await auth();
  const accessToken = session?.user?.accessToken;
  const backendUrl = getBackendUrl(path);

  if (!session?.user || !accessToken) {
    return {
      message: "로그인이 필요합니다.",
      success: false as const,
    };
  }

  if (!backendUrl) {
    return {
      message: "백엔드 URL이 설정되어 있지 않습니다.",
      success: false as const,
    };
  }

  const tokenType = session.user.tokenType || "Bearer";

  return {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
      "Content-Type": "application/json",
    },
    success: true as const,
    url: backendUrl,
  };
}

async function readApiResponse<T>(response: Response) {
  return (await response.json().catch(() => ({}))) as ApiResponse<T>;
}

function getBackendUrl(path: string) {
  if (!process.env.AUTH_BACKEND_URL) {
    return null;
  }

  return new URL(path, process.env.AUTH_BACKEND_URL).toString();
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
