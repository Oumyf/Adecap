import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crest, Phases, Trophy } from "@/components/ui";
import { RemindButton } from "@/components/RemindButton";
import { COMP_STATUS, compTitle } from "@/lib/format";
import { getCompetition } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCompetition((await params).slug);
  return c ? { title: `${compTitle(c)} · ${c.year}`, description: c.about } : {};
}

export default async function CompetitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const c = await getCompetition((await params).slug);
  if (!c) notFound();
  const win = (c.winner || "").toLowerCase();
  return (
    <>
      <div className="band phead diag">
        <div className="wrap">
          <p className="crumbs">
            <Link href="/">Accueil</Link> / <Link href="/competitions">Compétitions</Link> / {c.name}
          </p>
          <p className="eyebrow">
            {c.year} · {c.edition} · {COMP_STATUS[c.status]}
          </p>
          <h1>{c.name}</h1>
          <p className="lead">{c.about}</p>
        </div>
      </div>
      <div className="sec">
        <div className="wrap comp-detail">
          <div className="cd-main">
            {c.status === "ONGOING" && (
              <div className="last now">
                <div className="k">
                  <span>
                    <span className="dot" />
                    Avancement
                  </span>
                </div>
                <Phases phase={c.phase} />
              </div>
            )}
            {c.finalists.length === 2 && (
              <div className="vsrow">
                {c.finalists.map((x, i) => (
                  <div key={x} style={{ display: "contents" }}>
                    {i === 1 && <i>VS</i>}
                    <div className={x === c.winner ? "win" : ""}>
                      <Crest name={x} />
                      <b>{x}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {c.teams.length > 0 && (
              <div>
                <p className="eyebrow" style={{ marginBottom: "1rem" }}>
                  Participants ({c.teams.length})
                </p>
                <div className="chips">
                  {c.teams.map((t) => (
                    <span key={t} className={t.toLowerCase() === win ? "win" : ""}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="eyebrow">En images</p>
              <p className="muted">Les photos ADECAP Studio de cette édition seront publiées dans la médiathèque.</p>
            </div>
            <Link className="link-arrow" href="/competitions?onglet=historique">
              ← Toutes les compétitions
            </Link>
          </div>
          <aside className="cd-side">
            <dl className="facts">
              <div>
                <dt>Année</dt>
                <dd>{c.year}</dd>
              </div>
              <div>
                <dt>Édition</dt>
                <dd>{c.edition}</dd>
              </div>
              <div>
                <dt>Participants</dt>
                <dd>{c.participants ? `${c.participants} ${c.unit}` : "À compléter"}</dd>
              </div>
              <div>
                <dt>Discipline</dt>
                <dd>{c.discipline}</dd>
              </div>
              <div>
                <dt>Lieu</dt>
                <dd>{c.venue || "À compléter"}</dd>
              </div>
              <div>
                <dt>{c.status === "UPCOMING" ? "Période" : "Vainqueur"}</dt>
                <dd>
                  {c.status === "UPCOMING" ? (
                    `${c.month ?? ""} ${c.year}`
                  ) : c.winner ? (
                    <>
                      <Trophy />
                      {c.winner}
                    </>
                  ) : (
                    "À déterminer"
                  )}
                </dd>
              </div>
            </dl>
            {c.status !== "PAST" && (
              <div className="cd-alert">
                <p>Recevez une alerte à l’ouverture des inscriptions et à la publication du calendrier.</p>
                <RemindButton competitionId={c.id} name={compTitle(c)} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
