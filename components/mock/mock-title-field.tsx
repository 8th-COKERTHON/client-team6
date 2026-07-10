"use client";

import { TextInput } from "@/components/ui/text-input";

export function MockTitleField({
  canGenerate,
  id,
  onChange,
  onGenerate,
  value,
}: {
  canGenerate: boolean;
  id: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="flex items-center gap-1 text-sm font-medium leading-[1.4] text-white"
        htmlFor={id}
      >
        <SparkleIcon />
        AI 제목 생성
      </label>
      <TextInput
        id={id}
        maxLength={150}
        onChange={(event) => onChange(event.target.value)}
        placeholder="내용 입력 후 AI 제목이 생성돼요."
        trailingIcon={
          <button
            aria-label="AI 제목 생성"
            className="flex size-6 items-center justify-center text-white disabled:text-[#87919e]"
            disabled={!canGenerate}
            onClick={onGenerate}
            type="button"
          >
            <RefreshIcon />
          </button>
        }
        value={value}
      />
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 1.5 8.05 5 11.5 6.05 8.05 7.1 7 10.5 5.95 7.1 2.5 6.05 5.95 5 7 1.5Z"
        fill="currentColor"
      />
      <path
        d="M12 9 12.55 10.8 14.35 11.35 12.55 11.9 12 13.7 11.45 11.9 9.65 11.35 11.45 10.8 12 9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16.2 10.1a6.2 6.2 0 0 1-10.7 4.25M3.8 9.9A6.2 6.2 0 0 1 14.5 5.65"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M14.8 2.8v3.1h-3.1M5.2 17.2v-3.1h3.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
