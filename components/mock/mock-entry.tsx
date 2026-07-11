"use client";

import { useState } from "react";
import { useMockApp } from "@/components/mock/mock-app-provider";
import {
  MockHeader,
  MockHomeIndicator,
  MockPageFrame,
} from "@/components/mock/mock-shell";
import { ActionButton, ActionButtonLink } from "@/components/ui/action-button";
import { TextArea } from "@/components/ui/text-area";
import { TextInput } from "@/components/ui/text-input";
import { formatDateForDisplay } from "@/lib/mock-flow";

export function MockEntry() {
  const { createEpisode } = useMockApp();
  const [content, setContent] = useState("");
  const [date, setDate] = useState(() => formatDateForDisplay(new Date()));
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const canSubmit = Boolean(title.trim() && content.trim() && date.trim());

  function submit() {
    if (!canSubmit) {
      return;
    }

    const didCreate = createEpisode({ content, date, title });

    if (!didCreate) {
      setMessage("에피소드를 등록할 수 없습니다. 진행 중인 매치를 먼저 확인해주세요.");
      return;
    }

    setIsComplete(true);
  }

  if (isComplete) {
    return (
      <MockPageFrame>
        <section className="flex min-h-svh flex-col pt-[max(env(safe-area-inset-top),44px)]">
          <div className="flex flex-1 items-center justify-center px-4 pb-20 text-center">
            <div className="flex w-full max-w-[343px] flex-col items-center">
              <div className="flex size-[120px] items-center justify-center rounded-full bg-[#ff0002] text-5xl font-light text-white">
                ✓
              </div>
              <h1 className="mt-8 text-xl font-semibold leading-[1.4] text-white">
                에피소드 등록이 완료되었습니다.
              </h1>
              <p className="mt-2 max-w-[300px] text-sm font-medium leading-[1.6] text-[#b1b9c5]">
                기존 에피소드 5개와 데뷔 매치(Debut Match)를 진행해 보세요.
              </p>
            </div>
          </div>
          <div className="px-4 pt-3.5">
            <ActionButtonLink href="/mock/ring">바로 매치 시작</ActionButtonLink>
            <MockHomeIndicator />
          </div>
        </section>
      </MockPageFrame>
    );
  }

  return (
    <MockPageFrame>
      <section className="flex min-h-svh flex-col">
        <MockHeader backHref="/mock/home" title="에피소드 등록" />
        <section className="flex-1 overflow-y-auto px-4 pb-6 pt-6">
          <div className="flex flex-col gap-8">
            <TextInput
              id="mock-entry-title"
              label="제목 입력"
              maxLength={150}
              onChange={(event) => {
                setTitle(event.target.value);
                setMessage("");
              }}
              placeholder="에피소드 제목을 입력해주세요."
              value={title}
            />

            <TextArea
              fieldClassName={content ? "min-h-[110px]" : undefined}
              id="mock-entry-content"
              label="내용"
              maxLength={1000}
              onChange={(event) => {
                setContent(event.target.value);
                setMessage("");
              }}
              placeholder="오늘의 에피소드를 기록해주세요."
              rows={content ? 3 : 1}
              value={content}
            />

            <TextInput
              id="mock-entry-date"
              inputMode="numeric"
              label="날짜"
              onChange={(event) => {
                setDate(event.target.value);
                setMessage("");
              }}
              placeholder="YYYY.MM.DD"
              value={date}
            />

            {message ? (
              <p className="text-sm font-medium leading-[1.5] text-[#ff5b5d]" role="alert">
                {message}
              </p>
            ) : null}
          </div>
        </section>

        <div className="px-4 pt-3.5">
          <ActionButton isActive={canSubmit} onClick={submit}>
            등록
          </ActionButton>
          <MockHomeIndicator />
        </div>
      </section>
    </MockPageFrame>
  );
}
