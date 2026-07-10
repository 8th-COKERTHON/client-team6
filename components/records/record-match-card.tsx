import type {
  MatchEpisodeSnapshot,
  MatchHistoryRecord,
} from "@/app/records/mock-data";

export function RecordMatchCard({ record }: { record: MatchHistoryRecord }) {
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
    <div className={["min-w-0", isRight ? "text-right" : "text-left"].join(" ")}>
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
    </div>
  );
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  return `${year}.${month}.${day}`;
}
