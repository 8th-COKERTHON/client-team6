import {
  RecordMatchCard,
  toRecordMatch,
} from "@/components/records/record-match-card";
import {
  HomeIndicator,
  RecordsSearchBox,
  RecordsTopBar,
} from "@/components/records/records-ui";
import { getMatchHistory } from "@/lib/backend-api";
import { requireRecordsSession } from "../require-records-session";

type MatchRecordsPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export const metadata = {
  title: "역대 매치 기록 | MME",
};

export default async function MatchRecordsPage({
  searchParams,
}: MatchRecordsPageProps) {
  await requireRecordsSession();
  const query = getFirstValue((await searchParams).query)?.trim() ?? "";
  const records = await loadMatches(query);

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RecordsTopBar title="역대 매치 기록" />

        <section className="px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-6">
          <RecordsSearchBox action="/records/matches" query={query} />
          {records.length > 0 ? (
            <div className="mt-6 flex flex-col gap-3">
              {records.map((record) => (
                <RecordMatchCard key={record.matchId} record={record} />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm font-medium text-[#b1b9c5]">
              표시할 매치 기록이 없습니다.
            </p>
          )}
        </section>

        <HomeIndicator />
      </div>
    </main>
  );
}

async function loadMatches(query: string) {
  try {
    const records = await getMatchHistory(query || undefined, 50);
    return records.map(toRecordMatch);
  } catch {
    return [];
  }
}

function getFirstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
