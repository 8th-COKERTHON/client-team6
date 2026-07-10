import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { EntryForm } from "@/components/entries/entry-form";

export const metadata = {
  title: "에피소드 등록 | MME",
};

export default async function NewEntryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  return <EntryForm />;
}
