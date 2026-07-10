import Image from "next/image";
import Link from "next/link";
import { ActionButtonLink } from "@/components/ui/action-button";

export function GuestHome() {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="mx-auto min-h-svh w-full max-w-[375px] overflow-hidden bg-[#12161b]">
        <section className="relative min-h-svh px-4">
          <GuestHomeBackground />
          <GuestHomeBrand />
          <GuestHomeActions />
          <HomeIndicator />
        </section>
      </div>
    </main>
  );
}

function GuestHomeBackground() {
  return (
    <div className="absolute inset-x-1/2 bottom-[-6.5rem] h-[58.375rem] w-[32.5625rem] -translate-x-1/2">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        fill
        priority
        sizes="521px"
        src="/images/auth-arena-background.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#12161b_15.38%,rgba(18,22,27,0)_61.56%,#12161b_82.87%)]" />
    </div>
  );
}

function GuestHomeBrand() {
  return (
    <div className="relative z-10 flex flex-col items-center pt-[calc(env(safe-area-inset-top)+7.5rem)] text-center">
      <div className="flex flex-col items-center justify-center">
        <Image
          alt="MME"
          className="size-12 rounded-[11.2px] object-cover"
          height={48}
          priority
          src="/icons/mme-icon-192.png"
          width={48}
        />
        <h1 className="text-[3.75rem] font-black leading-[1.4] tracking-[0.05em] text-white">
          MME
        </h1>
      </div>
      <p className="text-lg font-normal leading-[1.4] text-white">
        My Misery Entertainment
      </p>
    </div>
  );
}

function GuestHomeActions() {
  return (
    <div className="absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.625rem)] z-10 space-y-3">
      <ActionButtonLink href="/signin">로그인</ActionButtonLink>
      <Link
        className="flex h-[3.25rem] w-full items-center justify-center rounded-[14px] border border-[#b1b9c5] px-4 text-lg font-semibold leading-[1.4] text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff0002]"
        href="/signup"
      >
        회원가입
      </Link>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex h-[calc(env(safe-area-inset-bottom)+2.125rem)] items-end justify-center pb-[max(env(safe-area-inset-bottom),0.5rem)]">
      <span className="h-[5px] w-[8.375rem] rounded-full bg-white/85" />
    </div>
  );
}
