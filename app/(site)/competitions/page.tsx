import type { Metadata } from "next";
import Link from "next/link";
import { CompCard, HistCard, IflBars, NowCard, WinnerCell } from "@/components/content";
import { Crest, PageHead, SecHead } from "@/components/ui";
import { COMP_STATUS, compTitle } from "@/lib/format";
import { listCompetitions } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compétitions 2023 – 2027", description: "L’histoire des compétitions ADECAP : IFL, Tournoi des Élites, Super Coupes, ASL, et en 2027 le Tournoi des Alumni, l’AUFL et la CFL." };

const TABS = [
  ["avenir", "À venir"],
  ["palmares", "Palmarès"],
  ["historique", "Historique"],
  ["ifl", "L’IFL"],
] as const;

const YEARS: Record<number, string> = { 2023: "Naissance", 2024: "Consolidation", 2025: "Diversification", 2026: "Expansion", 2027: "Nouveaux horizons" };

export default async function Competitions({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const { onglet } = await searchParams;
  const tab = TABS.some(([k]) => k === onglet) ? onglet! : "avenir";
  const comps = await listCompetitions();
  const past = comps.filter((c) => c.status === "PAST");
  const ongoing = comps.filter((c) => c.status === "ONGOING");
  const upcoming = comps.filter((c) => c.status === "UPCOMING");
  const ifl = comps.filter((c) => c.family === "IFL");
  const iflN = ifl.filter((c) => c.participants);
  const years = [...new Set(comps.map((c) => c.year))].sort();
  const lastYear = years[years.length - 1];

  return (
    <>
      <PageHead crumb="Compétitions" eyebrow={`${years[0]} — ${lastYear} · Passé, présent, futur`} title={<>L’histoire de<br />nos compétitions</>} lead="Des quartiers aux universités, puis aux entreprises : ADECAP construit depuis 2023 un écosystème de compétitions sportives.">
        <div className="kf" aria-label="Chiffres clés">
          <div>
            <b>{ifl.length}</b>
            <span>éditions de l’IFL, de {ifl[0]?.year} à {ifl[ifl.length - 1]?.year}</span>
          </div>
          {iflN.length > 1 && (
            <div>
              <b>
                {iflN[0].participants}
                <i>→</i>
                {iflN[iflN.length - 1].participants}
              </b>
              <span>universités à l’IFL, de la {iflN[0].edition} à la {iflN[iflN.length - 1].edition}</span>
            </div>
          )}
          {keyFigures(comps).map((c) => (
            <div key={c.id}>
              <b>{c.participants}</b>
              <span>
                {c.unit}
                {c.status === "UPCOMING" ? " prévues" : ""} · {c.name} {c.year}
              </span>
            </div>
          ))}
        </div>
      </PageHead>

      <div className="sec">
        <div className="wrap">
          {ongoing.length > 0 && (
            <>
              <SecHead eyebrow="L’aventure continue" title="En cours" />
              <div className="now-grid">
                {ongoing.map((c) => (
                  <NowCard key={c.id} c={c} />
                ))}
              </div>
            </>
          )}
          <nav className="tabs" aria-label="Compétitions">
            {TABS.map(([k, l]) => (
              <Link key={k} href={`/competitions?onglet=${k}`} scroll={false} aria-current={tab === k ? "page" : undefined} className="tab">
                {l}
              </Link>
            ))}
          </nav>

          {tab === "avenir" && (
            <div className="match-list">
              {upcoming.length ? upcoming.map((c) => <CompCard key={c.id} c={c} />) : <div className="empty">Aucune compétition annoncée pour le moment.</div>}
            </div>
          )}

          {tab === "palmares" && <Palmares past={past} />}

          {tab === "historique" && (
            <>
              <SecHead eyebrow="L’expansion d’ADECAP" title="De 16 universités à un écosystème de compétitions" style={{ marginBottom: "1.6rem" }} />
              <div className="path">
                {[
                  ["Quartiers", "Tournoi des Élites, 2023"],
                  ["Universités", "IFL, 2023"],
                  ["Compétitions spéciales", "Super Coupes, 2024-2025"],
                  ["TL221", "ASL TL221, 2025"],
                  ["Entreprises", "CFL, 2027"],
                ].map(([a, b]) => (
                  <div key={a}>
                    <b>{a}</b>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <div className="timeline">
                {years.map((y) => (
                  <div key={y} className={`tl ${y < lastYear ? "past" : "next"}`}>
                    <b>{y}</b>
                    <span>{YEARS[y] ?? ""}</span>
                    <ul>
                      {comps
                        .filter((c) => c.year === y)
                        .map((c) => (
                          <li key={c.id}>
                            {compTitle(c)}
                            {c.status !== "PAST" && <em> · {COMP_STATUS[c.status].toLowerCase()}</em>}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="legend">
                <span>
                  <i style={{ background: "var(--ink)" }} />
                  Passé
                </span>
                <span>
                  <i style={{ background: "var(--royal)" }} />
                  En cours
                </span>
                <span>
                  <i style={{ background: "var(--gold)" }} />À venir
                </span>
              </div>
              <SecHead eyebrow="Fiches compétitions" title="Chaque édition, en détail" style={{ marginBottom: "1.6rem" }} />
              <div className="hist">
                {past.map((c) => (
                  <HistCard key={c.id} c={c} />
                ))}
              </div>
            </>
          )}

          {tab === "ifl" && (
            <>
              <div className="ifl">
                <div>
                  <SecHead eyebrow={`IFL · ${ifl[0]?.year} – ${ifl[ifl.length - 1]?.year}`} title="Une compétition qui grandit" style={{ marginBottom: "1.6rem" }} />
                  <IflBars list={comps} />
                </div>
                <div className="ifl-side">
                  {iflN.length > 1 && (
                    <span className="big">
                      {iflN[0].participants} → {iflN[iflN.length - 1].participants}
                    </span>
                  )}
                  <p>universités engagées entre la première et la dernière édition. Les éditions 2024 et 2025 comptaient 24 universités annoncées.</p>
                  <div className="titles">
                    <h4>Champions de l’IFL</h4>
                    {ifl
                      .filter((c) => c.status === "PAST")
                      .map((c) => (
                        <div className="row" key={c.id}>
                          <Crest name={c.winner} />
                          <div>
                            <b>{c.winner || "À déterminer"}</b>
                            <small>
                              {c.year} · {c.edition}
                            </small>
                          </div>
                          <span />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {(() => {
                const last = [...ifl].reverse().find((c) => c.teams.length);
                return last ? (
                  <div style={{ marginTop: "3rem" }}>
                    <p className="eyebrow" style={{ marginBottom: "1rem" }}>
                      Les {last.teams.length} universités de la {last.edition} ({last.year})
                    </p>
                    <div className="chips">
                      {last.teams.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          )}
          <p className="data-note">Données transmises par ADECAP. Lieux et photos à compléter.</p>
        </div>
      </div>
    </>
  );
}

/** Un chiffre par famille de compétition (hors IFL), la plus récente ; quatre au maximum. */
function keyFigures(comps: Awaited<ReturnType<typeof listCompetitions>>) {
  const byFam = new Map<string, (typeof comps)[number]>();
  for (const c of comps) if (c.family !== "IFL" && (c.participants ?? 0) > 2) byFam.set(c.family, c);
  let list = [...byFam.values()];
  if (list.length > 4) list = list.filter((c) => c.family !== "Alumni");
  return list.slice(0, 4);
}

function Palmares({ past }: { past: Awaited<ReturnType<typeof listCompetitions>> }) {
  const rows = [...past].sort((a, b) => b.year - a.year || a.sortOrder - b.sortOrder);
  const wins = new Map<string, typeof past>();
  for (const c of past) if (c.winner) wins.set(c.winner, [...(wins.get(c.winner) || []), c]);
  const tops = [...wins.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  return (
    <div className="palm-wrap">
      <div className="standing full">
        <h4>
          <b>Les champions ADECAP</b>
          <span>{past.filter((c) => c.winner).length} titres depuis 2023</span>
        </h4>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Année</th>
                <th className="l">Compétition</th>
                <th className="l">Vainqueur</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className={c.winner ? "" : "tbd"}>
                  <td className="yr">{c.year}</td>
                  <td className="cp">
                    <Link href={`/competitions/${c.slug}`}>{compTitle(c)}</Link>
                    <small>{c.finalists.length ? `Finale ${c.finalists.join(" – ")}` : `${c.participants ?? "—"} ${c.unit}`}</small>
                  </td>
                  <td className="ws">
                    <WinnerCell c={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="titles">
        <h4>Titres par vainqueur</h4>
        {tops.map(([w, l]) => (
          <div className="row" key={w}>
            <Crest name={w} />
            <div>
              <b>{w}</b>
              <small>{l.map((c) => `${c.name} ${c.year}`).join(" · ")}</small>
            </div>
            <span className="cups" aria-label={`${l.length} titre${l.length > 1 ? "s" : ""}`}>
              {l.map((c) => (
                <i key={c.id} />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
