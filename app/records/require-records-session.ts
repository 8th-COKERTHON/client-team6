import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireRecordsSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.onboardingCompleted === false) {
    redirect("/onboarding");
  }

  return session;
}
