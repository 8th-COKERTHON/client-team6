import Image, { type StaticImageData } from "next/image";
import defaultBadgeImage from "@/public/images/ranking/rank-badge-default.png";
import firstBadgeImage from "@/public/images/ranking/rank-badge-first.png";
import secondBadgeImage from "@/public/images/ranking/rank-badge-second.png";
import thirdBadgeImage from "@/public/images/ranking/rank-badge-third.png";

export type RankingEntry = {
  rank: number;
  score: number;
  title: string;
};

const TOP_BADGES: Partial<Record<number, StaticImageData>> = {
  1: firstBadgeImage,
  2: secondBadgeImage,
  3: thirdBadgeImage,
};

export function RankingListCard({ entry }: { entry: RankingEntry }) {
  const badgeImage = getBadgeImage(entry.rank);
  const isPodiumRank = entry.rank <= 3;

  return (
    <article className="flex min-h-[3.875rem] w-full items-center justify-between gap-4 px-4 py-4">
      <div className="flex min-w-0 items-center gap-4">
        <span className="relative flex h-[30px] w-[26px] shrink-0 items-center justify-center">
          <Image
            alt=""
            className="object-fill"
            fill
            sizes="26px"
            src={badgeImage}
          />
          <span
            className={[
              "relative z-10 font-semibold leading-none text-white",
              isPodiumRank ? "text-xs" : "text-base",
            ].join(" ")}
            style={{ textShadow: "0 0 4px rgba(0, 0, 0, 0.25)" }}
          >
            {entry.rank}
          </span>
        </span>
        <h2 className="truncate text-base font-semibold leading-[1.4] text-[#f0f0f2]">
          {entry.title}
        </h2>
      </div>
      <p className="shrink-0 text-base leading-[1.4] text-[#f0f0f2]">
        <span className="font-semibold">{entry.score}</span>
        <span className="font-medium"> 점</span>
      </p>
    </article>
  );
}

function getBadgeImage(rank: number) {
  return TOP_BADGES[rank] ?? defaultBadgeImage;
}
