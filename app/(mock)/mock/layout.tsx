import { MockAppProvider } from "@/components/mock/mock-app-provider";

export default function MockLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MockAppProvider>{children}</MockAppProvider>;
}
