import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RingScreen, type RingScreenData } from "@/components/ring-screen";

type ApiResponse<T> = {
  code?: string;
  data?: T;
  message?: string;
  success?: boolean;
};

type RingScreenResult =
  | {
      data: RingScreenData;
      message?: never;
    }
  | {
      data?: never;
      message: string;
    };

export const metadata = {
  title: "링 | MME",
};

export default async function RingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  const result = await getRingScreen({
    accessToken: session.user.accessToken,
    tokenType: session.user.tokenType,
  });

  return <RingScreen data={result.data} errorMessage={result.message} />;
}

async function getRingScreen({
  accessToken,
  tokenType,
}: {
  accessToken?: string | null;
  tokenType?: string | null;
}): Promise<RingScreenResult> {
  if (!accessToken) {
    return {
      message: "로그인이 필요합니다.",
    };
  }

  const backendUrl = getBackendUrl("/api/v1/ring");

  if (!backendUrl) {
    return {
      message: "백엔드 URL이 설정되어 있지 않습니다.",
    };
  }

  try {
    const response = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `${tokenType || "Bearer"} ${accessToken}`,
      },
    });
    const body = await readApiResponse<RingScreenData>(response);

    if (!response.ok || body.success === false || !body.data) {
      return {
        message: body.message || "링 정보를 불러오지 못했습니다.",
      };
    }

    return {
      data: body.data,
    };
  } catch {
    return {
      message: "백엔드에 연결하지 못했습니다.",
    };
  }
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
