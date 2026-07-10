export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-svh bg-[#12161b] text-white">
      <section className="mx-auto min-h-svh w-full max-w-[375px] bg-[#12161b]">
        {children}
      </section>
    </main>
  );
}
