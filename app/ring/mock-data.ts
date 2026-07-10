import type { RingResponse } from "@/components/ring-screen";

export const MOCK_RING_DATA = {
  activeEvents: [
    {
      displayDate: "2026.07.10",
      eventId: 301,
      scoreReward: 200,
      title: "Placement Match",
      type: "PLACEMENT",
    },
  ],
  activeMatch: {
    currentRound: 1,
    episodeA: {
      content:
        "최종 면접 결과를 기다렸지만 아쉽게 탈락했다. 오랫동안 준비했던 만큼 허탈함과 자신감이 크게 흔들렸다.",
      episodeDate: "2026-07-10",
      episodeId: 101,
      title: "취업 최종 탈락",
    },
    episodeB: {
      content:
        "좋은 분위기라고 생각했던 소개팅 이후 갑자기 연락이 끊겼다. 이유를 알 수 없어 더 오래 신경 쓰였다.",
      episodeDate: "2026-07-10",
      episodeId: 102,
      title: "세 번째 소개팅 연락 두절",
    },
    matchId: 201,
    status: "IN_PROGRESS",
    totalRounds: 5,
  },
  activeQuestion: null,
  availableEpisodes: [
    {
      episodeDate: "2026-07-10",
      episodeId: 101,
      title: "취업 최종 탈락",
    },
    {
      episodeDate: "2026-07-10",
      episodeId: 102,
      title: "세 번째 소개팅 연락 두절",
    },
  ],
} satisfies RingResponse;
