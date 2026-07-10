import { BottomNavigation } from "@/components/bottom-navigation";
import { RecordChampionCard } from "@/components/records/record-champion-card";
import { RecordMatchCard } from "@/components/records/record-match-card";
import {
  RecordsHeader,
  RecordsSearchBox,
  RecordsSectionHeader,
} from "@/components/records/records-ui";
import { CHAMPION_RECORDS, MATCH_HISTORY_RECORDS } from "./mock-data";
import { requireRecordsSession } from "./require-records-session";

export const metadata = {
  title: "기록실 | MME",
};

export default async function RecordsPage() {
  await requireRecordsSession();

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RecordsHeader />

        <section className="relative z-10 px-4 pt-[calc(env(safe-area-inset-top)+7.625rem)] pb-[calc(8.5rem+env(safe-area-inset-bottom))]">
          <RecordsSearchBox />

          <section className="mt-6">
            <RecordsSectionHeader href="/records/champions" title="역대 챔피언 기록" />
            <div className="mt-4 flex flex-col gap-3">
              {CHAMPION_RECORDS.slice(0, 2).map((champion, index) => (
                <RecordChampionCard
                  champion={champion}
                  key={champion.episodeId}
                  priority={index === 0}
                />
              ))}
            </div>
          </section>

          <div className="my-6 h-px w-full bg-[#292e38]" />

          <section>
            <RecordsSectionHeader href="/records/matches" title="역대 매치 기록" />
            <div className="mt-4 flex flex-col gap-3">
              {MATCH_HISTORY_RECORDS.slice(0, 3).map((record) => (
                <RecordMatchCard key={record.matchId} record={record} />
              ))}
            </div>
          </section>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}
