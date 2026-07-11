import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ChampionHistoryItemResponse } from "@/lib/backend-types";
import allTimeBeltImage from "@/public/images/ranking/champion-belt-all-time.png";
import annualBeltImage from "@/public/images/ranking/champion-belt-annual.png";
import monthlyBeltImage from "@/public/images/ranking/champion-belt-monthly.png";

type ChampionScope = "all-time" | "annual" | "monthly";

export type RecordChampionCardData = {
  episodeId: number;
  scope: ChampionScope | null;
  scopeEnglishLabel?: string;
  scopeLabel: string;
  score: number;
  title: string;
};

const BELT_IMAGES = {
  "all-time": allTimeBeltImage,
  annual: annualBeltImage,
  monthly: monthlyBeltImage,
} satisfies Record<ChampionScope, StaticImageData>;

export function RecordChampionCard({
  champion,
  priority = false,
}: {
  champion: RecordChampionCardData;
  priority?: boolean;
}) {
  return (
    <Link
      className="relative flex min-h-[5.5625rem] w-full items-center justify-between overflow-hidden rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] py-5 pl-5 pr-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
      href={`/episodes/${champion.episodeId}`}
    >
      <div className="relative z-10 min-w-0 max-w-[66%]">
        <p className="truncate text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
          {champion.scopeLabel}
          {champion.scopeEnglishLabel
            ? ` (${champion.scopeEnglishLabel})`
            : ""}
        </p>
        <h2 className="mt-1.5 truncate text-lg font-semibold leading-[1.4] text-white">
          {champion.title}
        </h2>
        <p className="mt-1 text-xs font-semibold text-[#ff5b5d]">
          {champion.score}점
        </p>
      </div>
      {champion.scope ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-[46px] w-[29%] min-w-[5.75rem] -translate-y-1/2 overflow-hidden"
        >
          <Image
            alt=""
            className="object-contain object-center"
            fill
            priority={priority}
            sizes="98px"
            src={BELT_IMAGES[champion.scope]}
          />
        </div>
      ) : null}
    </Link>
  );
}

export function toRecordChampion(
  champion: ChampionHistoryItemResponse,
): RecordChampionCardData {
  const scope = getChampionScope(champion.championTitle);
  const labels: Record<ChampionScope, [string, string]> = {
    "all-time": ["올타임 챔피언", "All-Time Champion"],
    annual: ["연간 챔피언", "Annual Champion"],
    monthly: ["월간 챔피언", "Monthly Champion"],
  };

  return {
    episodeId: champion.episodeId,
    scope,
    scopeEnglishLabel: scope ? labels[scope][1] : undefined,
    scopeLabel: scope ? labels[scope][0] : champion.championTitle,
    score: champion.titleScore,
    title: champion.episodeTitle,
  };
}

function getChampionScope(value: string): ChampionScope | null {
  const normalized = value.toUpperCase();
  if (normalized.includes("MONTH") || value.includes("월간")) return "monthly";
  if (
    normalized.includes("ANNUAL") ||
    normalized.includes("YEAR") ||
    value.includes("연간")
  ) {
    return "annual";
  }
  if (normalized.includes("ALL") || value.includes("올타임")) {
    return "all-time";
  }
  return null;
}
