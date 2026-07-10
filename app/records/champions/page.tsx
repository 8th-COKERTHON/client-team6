import { RecordChampionCard } from "@/components/records/record-champion-card";
import { HomeIndicator, RecordsTopBar } from "@/components/records/records-ui";
import { CHAMPION_RECORDS } from "../mock-data";
import { requireRecordsSession } from "../require-records-session";

export const metadata = {
  title: "역대 챔피언 기록 | MME",
};

export default async function ChampionRecordsPage() {
  await requireRecordsSession();

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RecordsTopBar title="역대 챔피언 기록" />

        <section className="px-4 pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-3">
            {CHAMPION_RECORDS.map((champion, index) => (
              <RecordChampionCard
                champion={champion}
                key={champion.episodeId}
                priority={index === 0}
              />
            ))}
          </div>
        </section>

        <HomeIndicator />
      </div>
    </main>
  );
}
