import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GuestHome } from "@/components/home/guest-home";
import { SignedInHome } from "@/components/home/signed-in-home";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return <GuestHome />;
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  return <SignedInHome user={session.user} />;
}
