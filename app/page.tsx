import { auth } from "@/auth";
import { GuestHome } from "@/components/home/guest-home";
import { SignedInHome } from "@/components/home/signed-in-home";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return <SignedInHome user={session.user} />;
  }

  return <GuestHome />;
}
