import { redirect } from "next/navigation";

export default function WantedPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = new URLSearchParams({ tab: "wanted" });
  if (typeof searchParams.q === "string" && searchParams.q.trim()) query.set("q", searchParams.q.trim());
  redirect(`/marketplace?${query}`);
}
