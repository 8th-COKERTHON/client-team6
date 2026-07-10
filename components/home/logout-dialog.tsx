"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/components/home/actions";

export function LogoutDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        aria-label="로그아웃"
        className="flex size-6 items-center justify-center transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff0002]"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <LogOutIcon />
      </button>

      {isOpen ? (
        <div
          aria-labelledby="logout-dialog-title"
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-[37px] backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
          role="dialog"
        >
          <div
            className="flex w-full max-w-[300px] flex-col items-center gap-6 rounded-[20px] bg-white px-4 pt-6 pb-5 shadow-[0_0_10px_rgba(0,0,0,0.08)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              className="w-full text-center text-base font-semibold leading-[1.4] tracking-[-0.01em] text-[#060a0c]"
              id="logout-dialog-title"
            >
              로그아웃 하시나요?
            </h2>

            <div className="flex w-full justify-center gap-2">
              <form action={logout}>
                <LogoutSubmitButton />
              </form>
              <button
                className="flex h-10 w-[130px] items-center justify-center rounded-full bg-[#292e38] px-2.5 text-center text-sm font-semibold leading-[1.4] tracking-[-0.025em] text-white transition-colors hover:bg-[#363d48] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
                onClick={() => setIsOpen(false)}
                ref={cancelButtonRef}
                type="button"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex h-10 w-[130px] items-center justify-center rounded-full border border-[#b1b9c5] px-2.5 text-center text-sm font-semibold leading-[1.4] tracking-[-0.025em] text-[#1b1e27] transition-colors hover:bg-[#f0f0f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "처리 중" : "로그아웃"}
    </button>
  );
}

function LogOutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 8V5.5A1.5 1.5 0 0 0 12.5 4h-7A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h7A1.5 1.5 0 0 0 14 18.5V16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M10 12h9M16 8.5l3.5 3.5-3.5 3.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
