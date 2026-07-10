export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#12161b] px-6 py-12">
      <section className="w-full max-w-sm">{children}</section>
    </main>
  );
}
