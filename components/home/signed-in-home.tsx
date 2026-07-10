import { AuthStatus } from "@/components/auth-status";

type SignedInHomeUser = {
  email?: string | null;
  name?: string | null;
};

type SignedInHomeProps = {
  user: SignedInHomeUser;
};

export function SignedInHome({ user }: SignedInHomeProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#12161b] px-6 py-12 text-white">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <p className="text-sm font-medium text-zinc-400">MME</p>
          <h1 className="mt-2 text-3xl font-semibold">Signed in</h1>
        </div>
        <AuthStatus user={user} />
      </div>
    </main>
  );
}
