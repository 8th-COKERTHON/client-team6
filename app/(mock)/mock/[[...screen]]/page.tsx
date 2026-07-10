import { MockRouter } from "@/components/mock/mock-router";

type MockPageProps = {
  params: Promise<{ screen?: string[] }>;
};

export default async function MockPage({ params }: MockPageProps) {
  const { screen = [] } = await params;

  return <MockRouter segments={screen} />;
}
