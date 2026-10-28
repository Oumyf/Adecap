import { notFound, redirect } from "next/navigation";
import { getTalent } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Lien court vers le portrait d’un talent : /talents/amadou-diop
export default async function TalentRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const r = await getTalent((await params).slug);
  if (!r) notFound();
  redirect(`/actualites/${r.article.slug}`);
}
