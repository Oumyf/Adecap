import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { NewsCard, TalentSpot } from "@/components/content";
import { SearchBar } from "@/components/SearchBar";
import { PageHead } from "@/components/ui";
import { listNews, newsCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Actualités et talents à suivre", description: "Articles, communiqués, comptes rendus et portraits des talents à suivre révélés par les compétitions ADECAP." };

const TALENTS = "Talents à suivre";

export default async function Actualites({ searchParams }: { searchParams: Promise<{ categorie?: string; q?: string }> }) {
  const sp = await searchParams;
  const cats = await newsCategories();
  const cat = sp.categorie && cats.includes(sp.categorie) ? sp.categorie : undefined;
  const q = (sp.q || "").trim().slice(0, 80);
  const list = await listNews({ category: cat, q: q || undefined });

  // Talent mis en avant : le plus récent correspondant à la recherche, sur « Toutes » ou « Talents à suivre ».
  const spot = !cat || cat === TALENTS ? list.find((a) => a.talent) : undefined;
  const others = list.filter((a) => a !== spot);
  const href = (c?: string) => {
    const p = new URLSearchParams();
    if (c) p.set("categorie", c);
    if (q) p.set("q", q);
    return `/actualites${p.size ? "?" + p : ""}`;
  };

  return (
    <>
      <PageHead crumb="Actualités" title="Actualités" lead="Articles, communiqués, comptes rendus et portraits des talents à suivre, publiés par l’équipe éditoriale." />
      <div className="sec">
        <div className="wrap">
          <div className="filters news-filters">
            <Suspense>
              <SearchBar />
            </Suspense>
            <nav className="chips-nav" aria-label="Catégories">
              <Link className="fchip" href={href()} aria-current={!cat ? "page" : undefined}>
                Toutes
              </Link>
              {cats.map((c) => (
                <Link key={c} className="fchip" href={href(c)} aria-current={cat === c ? "page" : undefined}>
                  {c}
                </Link>
              ))}
            </nav>
          </div>
          {q && (
            <p className="search-note" role="status">
              {list.length} résultat{list.length > 1 ? "s" : ""} pour « {q} »
              {cat ? ` dans ${cat}` : ""}. <Link href={href(cat)}>Effacer la recherche</Link>
            </p>
          )}
          {spot?.talent && <TalentSpot t={spot.talent} article={spot} />}
          <div className="grid3">
            {others.map((a) => (
              <NewsCard key={a.id} a={a} />
            ))}
            {!list.length && <div className="empty">{q ? `Aucun article ni talent ne correspond à « ${q} ».` : "Aucun article publié dans cette catégorie pour le moment."}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
