import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RingScreen } from "@/components/ring-screen";
import { MOCK_RING_DATA } from "./mock-data";

export const metadata = {
  title: "링 | MME",
};

export default async function RingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  return <RingScreen data={MOCK_RING_DATA} />;
}
