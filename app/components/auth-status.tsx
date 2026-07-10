import { auth } from "@/auth";

export async function AuthStatus() {
  const session = await auth();
  const user = session?.user;

  return (
    <section className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <h2 className="mb-3 font-semibold text-zinc-950 dark:text-zinc-50">
        Auth check
      </h2>
      {user ? (
        <dl className="space-y-2">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Name
            </dt>
            <dd>{user.name || "Not provided"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Email
            </dt>
            <dd>{user.email || "Not provided"}</dd>
          </div>
        </dl>
      ) : (
        <p>Not signed in.</p>
      )}
    </section>
  );
}
