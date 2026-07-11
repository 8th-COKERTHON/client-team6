import {
  RecordChampionCard,
  toRecordChampion,
} from "@/components/records/record-champion-card";
import {
  HomeIndicator,
  RecordsSearchBox,
  RecordsTopBar,
} from "@/components/records/records-ui";
import { getChampionHistory } from "@/lib/backend-api";
import { requireRecordsSession } from "../require-records-session";

type ChampionRecordsPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export const metadata = {
  title: "역대 챔피언 기록 | MME",
};

export default async function ChampionRecordsPage({
  searchParams,
}: ChampionRecordsPageProps) {
  await requireRecordsSession();
  const query = getFirstValue((await searchParams).query)?.trim() ?? "";
  const records = await loadChampions(query);

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RecordsTopBar title="역대 챔피언 기록" />

        <section className="px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6">
          <RecordsSearchBox action="/records/champions" query={query} />
          {records.length > 0 ? (
            <div className="mt-6 flex flex-col gap-3">
              {records.map((champion, index) => (
                <RecordChampionCard
                  champion={champion}
                  key={`${champion.scope}-${champion.episodeId}-${index}`}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm font-medium text-[#b1b9c5]">
              표시할 챔피언 기록이 없습니다.
            </p>
          )}
        </section>

        <HomeIndicator />
      </div>
    </main>
  );
}

async function loadChampions(query: string) {
  try {
    const records = await getChampionHistory(query || undefined, 50);
    return records.map(toRecordChampion);
  } catch {
    return [];
  }
}

function getFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
