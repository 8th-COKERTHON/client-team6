import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { AuthStatus } from "./components/auth-status";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#12161b] px-6 py-12 text-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <p className="text-sm font-medium text-zinc-400">MME</p>
            <h1 className="mt-2 text-3xl font-semibold">Signed in</h1>
          </div>
          <AuthStatus />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <div className="mx-auto min-h-svh w-full max-w-md overflow-hidden bg-[#12161b]">
        <section className="relative min-h-svh px-[clamp(1rem,4vw,1.5rem)]">
          <div className="absolute inset-x-1/2 bottom-[-16svh] h-[clamp(42rem,116svh,58rem)] w-[clamp(23rem,122vw,33rem)] -translate-x-1/2">
            <Image
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              fill
              sizes="(max-width: 448px) 122vw, 33rem"
              src="/images/auth-arena-background.png"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#12161b_15.38%,rgba(18,22,27,0)_61.56%,#12161b_82.87%)]" />
          </div>

          <div className="relative z-10 flex flex-col items-center pt-[calc(env(safe-area-inset-top)+clamp(5rem,15svh,8.5rem))] text-center">
            <h1 className="text-[4rem] font-black leading-tight">MME</h1>
            <p className="mt-2 text-lg font-medium">
              My Misery Entertainment
            </p>
          </div>

          <div className="absolute inset-x-[clamp(1rem,4vw,1.5rem)] bottom-[calc(env(safe-area-inset-bottom)+clamp(3.75rem,9svh,4.75rem))] z-10 space-y-3">
            <Link
              className="flex h-[clamp(3rem,7svh,3.25rem)] w-full items-center justify-center rounded-2xl bg-[#ff0002] px-4 text-lg font-semibold text-white transition-colors hover:bg-[#d90002]"
              href="/signin"
            >
              로그인
            </Link>
            <Link
              className="flex h-[clamp(3rem,7svh,3.25rem)] w-full items-center justify-center rounded-2xl border border-white px-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              href="/signup"
            >
              회원가입
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 flex h-[calc(env(safe-area-inset-bottom)+2rem)] items-end justify-center pb-[max(env(safe-area-inset-bottom),0.5rem)]">
            <span className="h-1.5 w-[min(32vw,8.375rem)] rounded-full bg-white/85" />
          </div>
        </section>
      </div>
    </main>
  );
}
