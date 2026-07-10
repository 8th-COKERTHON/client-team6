import Link from "next/link";
import { RecordMatchCard } from "@/components/records/record-match-card";
import { HomeIndicator, RecordsTopBar } from "@/components/records/records-ui";
import {
  MATCH_HISTORY_RECORDS,
  type MatchEventType,
} from "../mock-data";
import { requireRecordsSession } from "../require-records-session";

type MatchRecordsPageProps = {
  searchParams: Promise<{ type?: string | string[] | undefined }>;
};

const FILTERS = [
  { href: "/records/matches?type=placement", label: "배치 매치", type: "PLACEMENT" },
  { href: "/records/matches?type=debut", label: "데뷔 매치", type: "DEBUT" },
] as const satisfies readonly {
  href: string;
  label: string;
  type: MatchEventType;
}[];

export const metadata = {
  title: "역대 매치 기록 | MME",
};

export default async function MatchRecordsPage({
  searchParams,
}: MatchRecordsPageProps) {
  await requireRecordsSession();

  const selectedType = getSelectedType((await searchParams).type);
  const records = MATCH_HISTORY_RECORDS.filter(
    (record) => record.eventType === selectedType,
  );

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="relative mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <RecordsTopBar title="역대 매치 기록" />

        <section className="px-4 pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3">
            {FILTERS.map((filter) => {
              const isActive = filter.type === selectedType;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "flex h-9 items-center justify-center rounded-full border px-4",
                    "text-sm font-semibold leading-[1.4] transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:outline-[#ff0002]",
                    isActive
                      ? "border-[#ff0002] bg-[#ff0002]/10 text-white"
                      : "border-[#363d48] bg-[#292e38]/70 text-white hover:border-[#87919e]",
                  ].join(" ")}
                  href={filter.href}
                  key={filter.type}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {records.map((record) => (
              <RecordMatchCard key={record.matchId} record={record} />
            ))}
          </div>
        </section>

        <HomeIndicator />
      </div>
    </main>
  );
}

function getSelectedType(value?: string | string[]) {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (normalizedValue?.toLowerCase() === "debut") {
    return "DEBUT";
  }

  return "PLACEMENT";
}
