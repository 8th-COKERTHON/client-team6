import type { Metadata } from "next";
import { MockAppProvider } from "@/components/mock/mock-app-provider";

export const metadata: Metadata = {
  title: "Mock Flow",
  description: "API 연결 없이 확인하는 MME 메인 사용자 플로우",
};

export default function MockLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MockAppProvider>{children}</MockAppProvider>;
}
