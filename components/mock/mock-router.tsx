"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MockEntry } from "@/components/mock/mock-entry";
import { MockHome } from "@/components/mock/mock-home";
import { MockOnboarding } from "@/components/mock/mock-onboarding";
import { MockRanking } from "@/components/mock/mock-ranking";
import { MockResults } from "@/components/mock/mock-results";
import { MockRing } from "@/components/mock/mock-ring";
import { MockLoadingScreen } from "@/components/mock/mock-shell";
import { useMockApp } from "@/components/mock/mock-app-provider";

const KNOWN_ROUTES = new Set([
  "home",
  "onboarding",
  "episodes/new",
  "ranking",
  "results",
  "ring",
]);

export function MockRouter({ segments }: { segments: string[] }) {
  const router = useRouter();
  const { isHydrated, state } = useMockApp();
  const route = segments.join("/");
  const redirectTarget = isHydrated ? getRedirectTarget(route, state) : null;

  useEffect(() => {
    if (redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, router]);

  if (!isHydrated || redirectTarget) {
    return <MockLoadingScreen />;
  }

  switch (route) {
    case "onboarding":
      return <MockOnboarding />;
    case "home":
      return <MockHome />;
    case "episodes/new":
      return <MockEntry />;
    case "ring":
      return <MockRing />;
    case "results":
      return <MockResults />;
    case "ranking":
      return <MockRanking />;
    default:
      return <MockLoadingScreen />;
  }
}

function getRedirectTarget(
  route: string,
  state: ReturnType<typeof useMockApp>["state"],
) {
  if (!route) {
    return state.onboardingComplete ? "/mock/home" : "/mock/onboarding";
  }

  if (!KNOWN_ROUTES.has(route)) {
    return "/mock";
  }

  if (!state.onboardingComplete) {
    return route === "onboarding" ? null : "/mock/onboarding";
  }

  if (route === "onboarding") {
    return "/mock/home";
  }

  if (route === "ring" && state.activeSessionId === null) {
    return state.lastCompletedSessionId === null
      ? "/mock/home"
      : "/mock/results";
  }

  if (route === "results" && state.lastCompletedSessionId === null) {
    return "/mock/home";
  }

  return null;
}
