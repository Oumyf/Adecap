import type { Metadata } from "next";
import Link from "next/link";
import { Art } from "@/components/content";
import { PageHead } from "@/components/ui";
import { PROGRAMS } from "@/lib/site";

export const metadata: Metadata = { title: "Programmes et projets", description: "Compétitions, football universitaire, culture, talents à suivre, ADECAP Studio et partenariats : les programmes d’ADECAP Entertainment." };

function stClass(s: string) {
  return s === "En cours" || s === "Permanent" ? "s-ok" : s === "Candidatures ouvertes" ? "s-info" : "s-warn";
}

export default async function Programmes({ searchParams }: { searchParams: Promise<{ pole?: string }> }) {
  const { pole } = await searchParams;
  const cats = [...new Set(PROGRAMS.map((p) => p.c))];
  const cur = pole && cats.includes(pole) ? pole : undefined;
  const list = PROGRAMS.filter((p) => !cur || p.c === cur);
  return (
    <>
      <PageHead crumb="Programmes et projets" title={<>Programmes<br />et projets</>} lead="Objectifs, bénéficiaires, zones d’intervention et résultats : chaque programme est suivi et rendu public." />
      <div className="sec">
        <div className="wrap">
          <nav className="filters" aria-label="Filtrer les programmes">
            <Link className="fchip" href="/programmes" aria-current={!cur ? "page" : undefined}>
              Tous
            </Link>
            {cats.map((c) => (
              <Link key={c} className="fchip" href={`/programmes?pole=${encodeURIComponent(c)}`} aria-current={cur === c ? "page" : undefined}>
                {c}
              </Link>
            ))}
          </nav>
          <div className="grid3">
            {list.map((p, i) => (
              <article className="card prog" key={p.slug} id={p.slug}>
                <div className="art">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.img ? <img src={p.img} alt="" loading="lazy" /> : <Art seed={i * 5 + 2} label={p.c} />}
                </div>
                <div className="card-b">
                  <div className="meta">
                    <span className="tag">{p.c}</span>
                    <span className={`status ${stClass(p.st)}`}>{p.st}</span>
                  </div>
                  <h3>{p.t}</h3>
                  <p>{p.ex}</p>
                  <dl>
                    <dt>Bénéficiaires</dt>
                    <dd>{p.ben}</dd>
                    <dt>Zone</dt>
                    <dd>{p.zone}</dd>
                  </dl>
                  <details className="prog-more">
                    <summary>Activités et résultats</summary>
                    <ul>
                      {p.acts.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                    <p>{p.res}</p>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
