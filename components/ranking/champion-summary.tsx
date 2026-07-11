import Image, { type StaticImageData } from "next/image";
import allTimeBeltImage from "@/public/images/ranking/champion-belt-all-time.png";
import annualBeltImage from "@/public/images/ranking/champion-belt-annual.png";
import monthlyBeltImage from "@/public/images/ranking/champion-belt-monthly.png";

export type ChampionScope = "all-time" | "annual" | "monthly";

export type RankingChampion = {
  englishLabel: string;
  label: string;
  scope: ChampionScope;
  title: string;
};

const BELT_IMAGES = {
  "all-time": allTimeBeltImage,
  annual: annualBeltImage,
  monthly: monthlyBeltImage,
} satisfies Record<ChampionScope, StaticImageData>;

export function ChampionSummary({
  champions,
}: {
  champions: readonly RankingChampion[];
}) {
  const allTimeChampion = champions.find(
    (champion) => champion.scope === "all-time",
  );
  const compactChampions = champions.filter(
    (champion) => champion.scope !== "all-time",
  );

  return (
    <section aria-label="챔피언 요약" className="mt-6 flex flex-col gap-3">
      {allTimeChampion ? (
        <ChampionCard champion={allTimeChampion} priority variant="featured" />
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {compactChampions.map((champion) => (
          <ChampionCard champion={champion} key={champion.scope} />
        ))}
      </div>
    </section>
  );
}

function ChampionCard({
  champion,
  priority = false,
  variant = "compact",
}: {
  champion: RankingChampion;
  priority?: boolean;
  variant?: "compact" | "featured";
}) {
  const isFeatured = variant === "featured";

  return (
    <article
      className={[
        "relative overflow-hidden rounded-[20px] border border-[#ff0002]/30 bg-[#292e38]",
        isFeatured
          ? "flex min-h-[5.5625rem] items-center justify-between py-5 pl-5 pr-4"
          : "min-h-[6.6875rem] p-5",
      ].join(" ")}
    >
      <div
        className={[
          "relative z-10 min-w-0",
          isFeatured ? "max-w-[66%]" : "max-w-full",
        ].join(" ")}
      >
        <p
          className={[
            "font-medium leading-[1.4] text-[#b1b9c5]",
            isFeatured ? "truncate text-[13px]" : "text-[13px]",
          ].join(" ")}
        >
          <span>{champion.label}</span>{" "}
          <span className={isFeatured ? "" : "block"}>
            ({champion.englishLabel})
          </span>
        </p>
        <h2 className="mt-1.5 truncate text-lg font-semibold leading-[1.4] text-white">
          {champion.title}
        </h2>
      </div>

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute overflow-hidden",
          isFeatured
            ? "right-4 top-1/2 h-[46px] w-[29%] min-w-[5.75rem] -translate-y-1/2"
            : "right-[5px] top-[5px] h-[30px] w-[38%] max-w-[4rem]",
        ].join(" ")}
      >
        <Image
          alt=""
          className={isFeatured ? "object-cover object-center" : "object-contain"}
          fill
          priority={priority}
          sizes={isFeatured ? "98px" : "64px"}
          src={BELT_IMAGES[champion.scope]}
        />
      </div>
    </article>
  );
}
