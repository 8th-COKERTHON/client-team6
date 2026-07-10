"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  createDebutSession,
  createInitialMockState,
  createMonthlySession,
  createOnboardingLeague,
  createWeeklySession,
  fillSampleOnboardingDrafts,
  MOCK_STORAGE_KEY,
  resolveCurrentMatch,
  restoreMockState,
  updateOnboardingDraft,
  type MockEpisodeDraft,
  type MockFlowState,
} from "@/lib/mock-flow";

type MockAppContextValue = {
  completeOnboarding: () => boolean;
  createEpisode: (draft: MockEpisodeDraft) => boolean;
  fillOnboardingSamples: () => void;
  isHydrated: boolean;
  reset: () => void;
  resolveMatch: (winnerEpisodeId: number) => boolean;
  startMonthly: () => boolean;
  startWeekly: () => boolean;
  state: MockFlowState;
  updateOnboarding: (
    index: number,
    patch: Partial<MockEpisodeDraft>,
  ) => void;
};

const MockAppContext = createContext<MockAppContextValue | null>(null);

export function MockAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockFlowState>(readInitialState);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  }, [isHydrated, state]);

  const updateOnboarding = useCallback(
    (index: number, patch: Partial<MockEpisodeDraft>) => {
      setState((current) => updateOnboardingDraft(current, index, patch));
    },
    [],
  );

  const fillOnboardingSamples = useCallback(() => {
    setState((current) => fillSampleOnboardingDrafts(current));
  }, []);

  const completeOnboarding = useCallback(() => {
    const nextState = createOnboardingLeague(state);

    if (nextState === state) {
      return false;
    }

    setState(nextState);
    return true;
  }, [state]);

  const createEpisode = useCallback(
    (draft: MockEpisodeDraft) => {
      const nextState = createDebutSession(state, draft);

      if (nextState === state) {
        return false;
      }

      setState(nextState);
      return true;
    },
    [state],
  );

  const startWeekly = useCallback(() => {
    const nextState = createWeeklySession(state);

    if (nextState === state) {
      return false;
    }

    setState(nextState);
    return true;
  }, [state]);

  const startMonthly = useCallback(() => {
    const nextState = createMonthlySession(state);

    if (nextState === state) {
      return false;
    }

    setState(nextState);
    return true;
  }, [state]);

  const resolveMatch = useCallback(
    (winnerEpisodeId: number) => {
      const nextState = resolveCurrentMatch(state, winnerEpisodeId);

      if (nextState === state) {
        return false;
      }

      setState(nextState);
      return nextState.activeSessionId === null;
    },
    [state],
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(MOCK_STORAGE_KEY);
    setState(createInitialMockState());
  }, []);

  const value = useMemo<MockAppContextValue>(
    () => ({
      completeOnboarding,
      createEpisode,
      fillOnboardingSamples,
      isHydrated,
      reset,
      resolveMatch,
      startMonthly,
      startWeekly,
      state,
      updateOnboarding,
    }),
    [
      completeOnboarding,
      createEpisode,
      fillOnboardingSamples,
      isHydrated,
      reset,
      resolveMatch,
      startMonthly,
      startWeekly,
      state,
      updateOnboarding,
    ],
  );

  return (
    <MockAppContext.Provider value={value}>
      {children}
    </MockAppContext.Provider>
  );
}

export function useMockApp() {
  const context = useContext(MockAppContext);

  if (!context) {
    throw new Error("useMockApp must be used inside MockAppProvider");
  }

  return context;
}

function readInitialState() {
  if (typeof window === "undefined") {
    return createInitialMockState();
  }

  return restoreMockState(window.localStorage.getItem(MOCK_STORAGE_KEY));
}

function subscribeToHydration() {
  return () => undefined;
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}
