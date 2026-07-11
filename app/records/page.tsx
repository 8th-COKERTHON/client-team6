import { BottomNavigation } from "@/components/bottom-navigation";
import {
  RecordChampionCard,
  toRecordChampion,
} from "@/components/records/record-champion-card";
import {
  RecordMatchCard,
  toRecordMatch,
} from "@/components/records/record-match-card";
import {
  RecordsHeader,
  RecordsSearchBox,
  RecordsSectionHeader,
} from "@/components/records/records-ui";
import { getHistoryHome } from "@/lib/backend-api";
import type { HistoryHomeResponse } from "@/lib/backend-types";
import { requireRecordsSession } from "./require-records-session";

type RecordsPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export const metadata = {
  title: "기록실 | MME",
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  await requireRecordsSession();
  const query = getFirstValue((await searchParams).query)?.trim() ?? "";
  const history = await loadHistory(query);
  const champions = history.championRecords.map(toRecordChampion);
  const matches = history.matchRecords.map(toRecordMatch);

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RecordsHeader />

        <section className="relative z-10 px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+7.625rem)]">
          <RecordsSearchBox query={query} />

          <section className="mt-6">
            <RecordsSectionHeader
              href={withQuery("/records/champions", query)}
              title="역대 챔피언 기록"
            />
            {champions.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {champions.slice(0, 2).map((champion, index) => (
                  <RecordChampionCard
                    champion={champion}
                    key={`${champion.scope}-${champion.episodeId}`}
                    priority={index === 0}
                  />
                ))}
              </div>
            ) : (
              <RecordsEmptyState />
            )}
          </section>

          <div className="my-6 h-px w-full bg-[#292e38]" />

          <section>
            <RecordsSectionHeader
              href={withQuery("/records/matches", query)}
              title="역대 매치 기록"
            />
            {matches.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {matches.slice(0, 3).map((record) => (
                  <RecordMatchCard key={record.matchId} record={record} />
                ))}
              </div>
            ) : (
              <RecordsEmptyState />
            )}
          </section>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

async function loadHistory(query: string) {
  try {
    return await getHistoryHome(query || undefined);
  } catch {
    return createEmptyHistory();
  }
}

function createEmptyHistory(): HistoryHomeResponse {
  return { championRecords: [], matchRecords: [] };
}

function RecordsEmptyState() {
  return (
    <p className="mt-4 rounded-xl bg-[#292e38] px-4 py-6 text-center text-sm font-medium text-[#b1b9c5]">
      표시할 기록이 없습니다.
    </p>
  );
}

function withQuery(path: string, query: string) {
  return query ? `${path}?query=${encodeURIComponent(query)}` : path;
}

function getFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
