import Link from "next/link";
import type { MatchHistoryItemResponse } from "@/lib/backend-types";

export type MatchEpisodeSnapshot = {
  episodeDate: string;
  episodeId: number;
  title: string;
};

export type RecordMatchCardData = {
  episodeA: MatchEpisodeSnapshot;
  episodeB: MatchEpisodeSnapshot;
  matchId: number;
  winnerEpisodeId: number;
};

export function RecordMatchCard({ record }: { record: RecordMatchCardData }) {
  return (
    <article className="grid min-h-[4.625rem] w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 rounded-2xl bg-[linear-gradient(102deg,#292e38_0%,rgba(41,46,56,0.6)_100%)] px-5 py-3.5">
      <MatchEpisodeSide
        episode={record.episodeA}
        isWinner={record.winnerEpisodeId === record.episodeA.episodeId}
      />
      <span className="shrink-0 text-base font-semibold leading-[1.4] text-[#f0f0f2]">
        VS
      </span>
      <MatchEpisodeSide
        align="right"
        episode={record.episodeB}
        isWinner={record.winnerEpisodeId === record.episodeB.episodeId}
      />
    </article>
  );
}

export function toRecordMatch(
  record: MatchHistoryItemResponse,
): RecordMatchCardData {
  return {
    episodeA: {
      episodeDate: record.episodeADate,
      episodeId: record.episodeAId,
      title: record.episodeATitle,
    },
    episodeB: {
      episodeDate: record.episodeBDate,
      episodeId: record.episodeBId,
      title: record.episodeBTitle,
    },
    matchId: record.matchId,
    winnerEpisodeId: record.winnerEpisodeId,
  };
}

function MatchEpisodeSide({
  align = "left",
  episode,
  isWinner,
}: {
  align?: "left" | "right";
  episode: MatchEpisodeSnapshot;
  isWinner: boolean;
}) {
  const isRight = align === "right";

  return (
    <Link
      className={[
        "min-w-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff0002]",
        isRight ? "text-right" : "text-left",
      ].join(" ")}
      href={`/episodes/${episode.episodeId}`}
    >
      <h2 className="truncate text-base font-semibold leading-[1.4] text-[#f0f0f2]">
        {episode.title}
      </h2>
      <p
        className={[
          "mt-1.5 flex min-w-0 items-center gap-1.5 text-[13px] font-medium leading-[1.4] text-[#b1b9c5]",
          isRight ? "justify-end" : "justify-start",
        ].join(" ")}
      >
        <span className="truncate">{formatDateLabel(episode.episodeDate)}</span>
        <span
          className={[
            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            isWinner ? "bg-[#ff0002] text-white" : "bg-[#363d48] text-[#b1b9c5]",
          ].join(" ")}
        >
          {isWinner ? "승" : "패"}
        </span>
      </p>
    </Link>
  );
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}
