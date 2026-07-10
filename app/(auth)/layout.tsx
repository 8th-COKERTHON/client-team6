export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-sm">{children}</section>
    </main>
  );
}
