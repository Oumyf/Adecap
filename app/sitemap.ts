import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { listCompetitions, listNews } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, comps] = await Promise.all([listNews(), listCompetitions()]);
  const pages = ["", "/competitions", "/actualites", "/a-propos", "/programmes", "/partenariats", "/mediatheque", "/contact", "/inscription"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const })),
    ...news.map((a) => ({ url: `${SITE.url}/actualites/${a.slug}`, lastModified: a.updatedAt })),
    ...comps.map((c) => ({ url: `${SITE.url}/competitions/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
