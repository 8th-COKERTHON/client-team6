import Image from "next/image";
import type { ChampionRecord } from "@/app/records/mock-data";
import beltImage from "@/public/images/ranking/champion-belt-all-time.png";

export function RecordChampionCard({
  champion,
  priority = false,
}: {
  champion: ChampionRecord;
  priority?: boolean;
}) {
  return (
    <article className="relative flex min-h-[5.5625rem] w-full items-center justify-between overflow-hidden rounded-[20px] border border-[#ff0002]/30 bg-[#292e38] py-5 pl-5 pr-4">
      <div className="relative z-10 min-w-0 max-w-[66%]">
        <p className="truncate text-[13px] font-medium leading-[1.4] text-[#b1b9c5]">
          {champion.scopeLabel} ({champion.scopeEnglishLabel})
        </p>
        <h2 className="mt-1.5 truncate text-lg font-semibold leading-[1.4] text-white">
          {champion.title}
        </h2>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-[46px] w-[29%] min-w-[5.75rem] -translate-y-1/2 overflow-hidden"
      >
        <Image
          alt=""
          className="object-cover object-center"
          fill
          priority={priority}
          sizes="98px"
          src={beltImage}
        />
      </div>
    </article>
  );
}
