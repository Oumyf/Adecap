import Link from "next/link";
import { CompCard, IflBars, NewsCard, TalentSpot } from "@/components/content";
import { Arrow, Crest, Phases, SecHead } from "@/components/ui";
import { compTitle, PHASES } from "@/lib/format";
import { listCompetitions, listNews, liveTalents, registrationCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const TICKER = ["Sport", "Culture", "Jeunesse", "Communautés", "Partenariats"];

export default async function Home() {
  const [comps, news, talents, counts] = await Promise.all([listCompetitions(), listNews({ limit: 3 }), liveTalents(), registrationCounts()]);
  const ongoing = comps.filter((c) => c.status === "ONGOING");
  const upcoming = comps.filter((c) => c.status === "UPCOMING");
  const past = comps.filter((c) => c.status === "PAST");
  const titles = past.filter((c) => c.winner);
  const lastYear = Math.max(0, ...titles.map((c) => c.year));
  const champions = titles.filter((c) => c.year === lastYear);
  const ifl = comps.filter((c) => c.family === "IFL");
  const maxIfl = Math.max(0, ...ifl.map((c) => c.participants || 0));
  const lead = ongoing[0];
  const spot = talents[0];

  return (
    <>
      <div className="band hero">
        <div className="hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/match.jpg" alt="Duel pour le ballon lors d’un match organisé par ADECAP" />
        </div>
        <svg className="hero-lines" viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
          <path pathLength={1} d="M520 640 L1260 250" stroke="#E5A600" strokeWidth="9" />
          <path pathLength={1} d="M610 640 L1260 300" stroke="#E5A600" strokeWidth="2.2" />
          <path pathLength={1} d="M700 650 L1260 355" stroke="#3B78D8" strokeWidth="2.2" />
        </svg>
        <div className="wrap top-row">
          <div className="hero-copy">
            <span className="badge">
              <b>AUFL</b>Partenaire de l’African University Football League
            </span>
            <h1>
              Plus qu’un événement, <em>un impact.</em>
            </h1>
            <p className="lead">ADECAP Entertainment conçoit et organise des événements sportifs et culturels qui rassemblent les communautés, révèlent les talents de la jeunesse et ouvrent des opportunités de partenariat.</p>
            <div className="actions">
              <Link className="btn btn-gold" href="/inscription">
                S’inscrire à la saison <Arrow />
              </Link>
              <Link className="btn btn-line" href="/competitions">
                Voir les compétitions
              </Link>
            </div>
          </div>
          <aside className="board" aria-label="Saison en cours">
            <div className="board-top">
              <span>
                <span className="dot" />
                {lead ? "En cours" : "Saison"}
              </span>
              <span>Saison 2026-2027</span>
            </div>
            {lead && (
              <>
                <div className="bd-now">
                  <b>{lead.family}</b>
                  <div>
                    <strong>{lead.edition}</strong>
                    <small>
                      Période de {PHASES[lead.phase].toLowerCase()}
                      {ongoing.length > 1 && " · " + ongoing.slice(1).map((x) => `${x.name} ${x.edition}`).join(", ")}
                    </small>
                  </div>
                </div>
                <Phases phase={lead.phase} />
              </>
            )}
            {upcoming.length > 0 && (
              <div className="bd-next">
                <span className="bd-k">À venir en {upcoming[0].year}</span>
                {upcoming.map((x) => (
                  <div key={x.id}>
                    <b>{x.month}</b>
                    <span>{compTitle(x)}</span>
                    <small>
                      {x.participants} {x.unit}
                    </small>
                  </div>
                ))}
              </div>
            )}
            <Link className="board-more" href="/competitions">
              Historique, palmarès et calendrier →
            </Link>
          </aside>
        </div>
        <div className="ticker" aria-hidden="true">
          <div className="ticker-in">
            {[0, 1].map((k) => (
              <span key={k}>
                {[...TICKER, ...TICKER].map((t, i) => (
                  <span key={i} style={{ display: "contents" }}>
                    {t}
                    <i />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="wrap">
          <SecHead eyebrow="Compétitions · 2023 – 2027" title="Ça se joue sur le terrain" link={{ href: "/competitions", label: "Historique, palmarès et calendrier" }} />
          <div className="comp-grid">
            <div className="match-list">
              {upcoming.map((c) => (
                <CompCard key={c.id} c={c} />
              ))}
            </div>
            <aside className="comp-side">
              {champions.length > 0 && (
                <div className="champs diag">
                  <div className="k">
                    <span>Derniers champions</span>
                    <b>{lastYear}</b>
                  </div>
                  {champions.map((c) => (
                    <div className="row" key={c.id}>
                      <Crest name={c.winner} />
                      <div>
                        <b>{c.winner}</b>
                        <small>{compTitle(c)}</small>
                      </div>
                    </div>
                  ))}
                  <Link className="more" href="/competitions?onglet=palmares">
                    Tout le palmarès
                  </Link>
                </div>
              )}
              <div className="mini-ifl">
                <h4>
                  <b>IFL · universités engagées</b>
                  <span>
                    {ifl[0]?.year} – {ifl[ifl.length - 1]?.year}
                  </span>
                </h4>
                <IflBars list={comps} mini />
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="figures band">
        <div className="wrap">
          <div className="stats">
            <div>
              <b>{ifl.length}</b>
              <span>éditions de l’IFL depuis {ifl[0]?.year ?? 2023}</span>
            </div>
            <div>
              <b>{maxIfl}</b>
              <span>universités à la dernière édition de l’IFL</span>
            </div>
            <div>
              <b>{titles.length}</b>
              <span>titres décernés depuis 2023</span>
            </div>
            <div>
              <b>{upcoming.length}</b>
              <span>nouvelles compétitions à venir</span>
            </div>
          </div>
        </div>
      </div>

      {spot?.talent && (
        <div className="sec" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <SecHead eyebrow="Actualités · Talents à suivre" title="Ils écrivent la suite" link={{ href: "/actualites?categorie=Talents%20%C3%A0%20suivre", label: "Tous les talents" }} />
            <TalentSpot t={spot.talent} article={spot} compact />
          </div>
        </div>
      )}

      <div className="sec">
        <div className="wrap">
          <SecHead eyebrow="Ce que nous faisons" title="Quatre pôles, une même énergie" link={{ href: "/programmes", label: "Tous les programmes" }} />
          <div className="poles">
            {[
              ["01", "Événementiel sportif", "IFL, ASL, Super Coupes et tournois de quartier, de la logistique à la retransmission."],
              ["02", "Événementiel culturel", "Concerts, soirées de gala et festivals qui font vivre les quartiers et les campus."],
              ["03", "Jeunesse et talents", "Détection, accompagnement et mise en lumière des jeunes sportifs et artistes."],
              ["04", "ADECAP Studio", "Photo, vidéo et contenus pour faire rayonner chaque événement et ses partenaires."],
            ].map(([n, t, p]) => (
              <Link className="pole" href="/programmes" key={n}>
                <span className="n">{n}</span>
                <h3>{t}</h3>
                <p>{p}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SecHead eyebrow="Saison 2026-2027 · Inscriptions ouvertes" title="Inscrivez-vous en ligne, en quelques minutes" link={{ href: "/inscription", label: "Comment ça marche" }} />
          <div className="reg-duo">
            <Link className="duo diag" href="/inscription">
              <div className="duo-top">
                <span className="duo-k">Établissements</span>
                <span className="duo-n">
                  <b>{counts.schools}</b> déjà inscrits
                </span>
              </div>
              <h3>Inscrire mon établissement</h3>
              <p>Lycées, universités et écoles supérieures engagent leurs équipes directement en ligne, sans attendre notre passage.</p>
              <span className="duo-go">
                Commencer <Arrow />
              </span>
            </Link>
            <Link className="duo alt diag" href="/inscription?profil=etudiant">
              <div className="duo-top">
                <span className="duo-k">Élèves et étudiants</span>
                <span className="duo-n">
                  <b>{counts.students}</b> profils créés
                </span>
              </div>
              <h3>Créer mon profil sportif</h3>
              <p>Recevez le calendrier, les convocations et les résultats des compétitions par WhatsApp, SMS ou e-mail.</p>
              <span className="duo-go">
                Créer mon profil <Arrow />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="band aufl diag" style={{ background: "var(--band-2)" }}>
        <div className="wrap">
          <div className="aufl-mark" aria-hidden="true">
            <b>AUFL</b>
            <small>PARTENAIRE</small>
          </div>
          <div style={{ display: "grid", gap: ".9rem", position: "relative", zIndex: 1 }}>
            <p className="eyebrow">Partenariat · Mars 2027</p>
            <h2>ADECAP rejoint l’African University Football League</h2>
            <p className="lead">Une première édition avec 12 universités, des standards d’organisation communs et une vitrine pour les talents formés à l’université.</p>
          </div>
          <Link className="btn btn-gold" href="/partenariats" style={{ position: "relative", zIndex: 1 }}>
            Découvrir le partenariat
          </Link>
        </div>
      </div>

      <div className="sec">
        <div className="wrap">
          <SecHead eyebrow="ADECAP Studio" title="Au cœur de nos événements" link={{ href: "/mediatheque", label: "Ouvrir la médiathèque" }} />
          <div className="mosaic">
            {[
              ["/images/match.jpg", "Sport", "L’intensité du terrain", "Match de football organisé par ADECAP"],
              ["/images/tribunes.jpg", "Communautés", "Des tribunes qui vibrent", "Supporters dans les tribunes"],
              ["/images/ceremonie.jpg", "Partenariats", "Des moments qui comptent", "Cérémonie sur le terrain"],
            ].map(([src, k, t, alt]) => (
              <figure key={src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} loading="lazy" />
                <figcaption>
                  <span>{k}</span>
                  {t}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <div className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <SecHead eyebrow="Actualités" title="Dernières nouvelles" link={{ href: "/actualites", label: "Toutes les actualités" }} />
          <div className="grid3">
            {news.map((a) => (
              <NewsCard key={a.id} a={a} />
            ))}
          </div>
        </div>
      </div>

      <div className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="eyebrow">Ils nous accompagnent</p>
              <h2>Partenaires</h2>
              <span className="rule" />
            </div>
          </div>
          <div className="slots">
            <div className="slot main">
              <div>
                <b>African University Football League</b>
                <span>Partenaire de compétition</span>
              </div>
            </div>
            {["Sponsor principal", "Partenaire institutionnel", "Partenaire média", "Équipementier"].map((s) => (
              <div className="slot" key={s}>
                <div>
                  <b>{s}</b>
                  <span>Devenez partenaire</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="band cta diag">
        <div className="wrap">
          <div style={{ display: "grid", gap: "1.1rem", position: "relative", zIndex: 1 }}>
            <p className="eyebrow">Marques, institutions, clubs, médias</p>
            <h2>
              Associez votre nom à <em>nos prochains événements.</em>
            </h2>
          </div>
          <div className="actions">
            <Link className="btn btn-gold" href="/contact?objet=Partenariat">
              Proposer un partenariat
            </Link>
            <Link className="btn btn-line" href="/a-propos">
              Qui sommes-nous
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
