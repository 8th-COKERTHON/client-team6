"use server";

import { revalidatePath } from "next/cache";
import { auth, update } from "@/auth";

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

type MemberMeResponse = {
  email?: string;
  memberId?: number;
  name?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
};

type TitleSuggestionResponse = {
  title?: string;
};

export type SaveOnboardingEpisodeInput = {
  completeOnboarding?: boolean;
  content: string;
  date: string;
  title: string;
};

export type SaveOnboardingEpisodeResult = {
  completed?: boolean;
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
    return {
      message: "내용을 먼저 입력해주세요.",
      success: false,
    };
  }

  const request = await createBackendRequest("/api/v1/episodes/title-suggestions");

  if (!request.success) {
    return request;
  }

  try {
    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ content: normalizedContent }),
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

export async function saveOnboardingEpisode({
  completeOnboarding = false,
  content,
  date,
  title,
}: SaveOnboardingEpisodeInput): Promise<SaveOnboardingEpisodeResult> {
  const normalizedTitle = title.trim();
  const normalizedContent = content.trim();
  const normalizedDate = normalizeEpisodeDate(date);

  if (!normalizedTitle) {
    return {
      message: "제목을 입력해주세요.",
      success: false,
    };
  }

  if (!normalizedDate) {
    return {
      message: "날짜는 YYYY.MM.DD 형식으로 입력해주세요.",
      success: false,
    };
  }

  const createRequest = await createBackendRequest("/api/v1/episodes");

  if (!createRequest.success) {
    return createRequest;
  }

  try {
    const response = await fetch(createRequest.url, {
      method: "POST",
      headers: createRequest.headers,
      body: JSON.stringify({
        content: normalizedContent,
        episodeDate: normalizedDate,
        title: normalizedTitle,
      }),
    });
    const data = await readApiResponse<CreateEpisodeResponse>(response);

    if (!response.ok || data.success === false || !data.data?.episodeId) {
      return {
        message: data.message || "에피소드를 등록하지 못했습니다.",
        success: false,
      };
    }

    if (completeOnboarding) {
      const completed = await completeOnboardingRequest();

      if (!completed.success) {
        return completed;
      }
    }

    revalidatePath("/");
    revalidatePath("/onboarding");

    return {
      completed: completeOnboarding,
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

async function completeOnboardingRequest(): Promise<SaveOnboardingEpisodeResult> {
  const request = await createBackendRequest("/api/v1/members/me/onboarding/complete");

  if (!request.success) {
    return request;
  }

  try {
    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
    });
    const data = await readApiResponse<MemberMeResponse>(response);

    if (!response.ok || data.success === false) {
      return {
        message: data.message || "온보딩 완료 처리에 실패했습니다.",
        success: false,
      };
    }

    await update({
      user: {
        onboardingCompleted: data.data?.onboardingCompleted ?? true,
        onboardingCompletedAt:
          data.data?.onboardingCompletedAt ?? new Date().toISOString(),
      },
    });

    return {
      completed: true,
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
