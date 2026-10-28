import Link from "next/link";
import type { Article, Competition, Talent } from "@/db/schema";
import { COMP_STATUS, compTitle, fmtDate } from "@/lib/format";
import { Attributes, Crest, Phases, Trophy } from "./ui";
import { PosterButton } from "./PosterButton";
import { RemindButton } from "./RemindButton";

/* ---------- Visuel de remplacement (diagonales de la charte) ---------- */
export function Art({ seed, label }: { seed: number; label?: string }) {
  const W = 400, H = 250, o = (seed * 37) % 120;
  const a = ["#0B1F45", "#0F2856", "#13306A"][seed % 3], b = ["#164A9B", "#1B4FA6", "#0F3B80"][seed % 3];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`g${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#g${seed})`} />
      <path d={`M${40 + o} ${H + 10}L${W + 20} ${60 - o / 3}`} stroke="#E5A600" strokeWidth="9" />
      <path d={`M${110 + o} ${H + 10}L${W + 20} ${100 - o / 3}`} stroke="#E5A600" strokeWidth="2" />
      <path d={`M${170 + o} ${H + 10}L${W + 20} ${135 - o / 3}`} stroke="#3B78D8" strokeWidth="2" />
      <path d="M60 70 L86 20 L102 20 L128 70" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
      {label && (
        <text x="22" y={H - 24} fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="34" fill="rgba(255,255,255,.16)">
          {label}
        </text>
      )}
    </svg>
  );
}

function seedOf(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 97;
}

/* ---------- Actualités ---------- */
export function NewsCard({ a }: { a: Article }) {
  return (
    <article className="card click">
      <Link href={`/actualites/${a.slug}`} className="card-link" aria-label={a.title} />
      <div className="art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {a.coverUrl ? <img src={a.coverUrl} alt="" loading="lazy" /> : <Art seed={seedOf(a.slug)} label={a.category.split(" ")[0]} />}
        {a.talentId && <span className="ribbon">Talent à suivre</span>}
      </div>
      <div className="card-b">
        <div className="meta">
          <span className="tag">{a.category}</span>
          <span>{fmtDate(a.publishedAt)}</span>
        </div>
        <h3>{a.title}</h3>
        <p>{a.excerpt}</p>
      </div>
    </article>
  );
}

/* ---------- Talents à suivre ---------- */
export function TalentSpot({ t, article, compact }: { t: Talent; article: Article; compact?: boolean }) {
  const name = `${t.firstName} ${t.lastName}`;
  return (
    <article className={`spot${compact ? " compact" : ""}`} aria-label={`Talent à suivre : ${name}`}>
      <div className="spot-ph">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.photoUrl} alt={`${name}, ${t.position.toLowerCase()}`} loading="lazy" />
        {t.number != null && (
          <span className="num" aria-hidden="true">
            {t.number}
          </span>
        )}
      </div>
      <div className="spot-b">
        <span className="brush">
          <span>Talent à suivre</span>
        </span>
        <h2 className="spot-name">
          {t.firstName}
          <em>{t.lastName}</em>
        </h2>
        <p className="spot-acc">{t.hook}</p>
        <Attributes items={t.attributes} />
        <div className="spot-f">
          <Link className="btn btn-gold btn-sm" href={`/actualites/${article.slug}`}>
            Lire le portrait
          </Link>
          {t.posterUrl && (
            <PosterButton src={t.posterUrl} alt={`Affiche « Talent à suivre » : ${name}`}>
              Voir l’affiche
            </PosterButton>
          )}
          <span className="spot-tag">
            {t.slogan}
            <small>
              {t.competition} · {t.signature}
            </small>
          </span>
        </div>
      </div>
    </article>
  );
}

/* ---------- Compétitions ---------- */
export function CompCard({ c }: { c: Competition }) {
  return (
    <article className="cc">
      <div className="cc-date">
        <b>{c.month || c.year}</b>
        <span>{c.year}</span>
      </div>
      <div className="cc-b">
        <div className="meta">
          <span className="status st-up">{COMP_STATUS[c.status]}</span>
          <span>{c.family === "Alumni" ? "Nouvelle compétition" : c.family}</span>
        </div>
        <h3>
          <Link href={`/competitions/${c.slug}`}>{compTitle(c)}</Link>
        </h3>
        <p>{c.about}</p>
      </div>
      <div className="cc-r">
        {c.participants != null && (
          <span className="n">
            {c.participants}
            <small>{c.unit}</small>
          </span>
        )}
        <RemindButton competitionId={c.id} name={compTitle(c)} />
      </div>
    </article>
  );
}

export function NowCard({ c }: { c: Competition }) {
  return (
    <div className="last now">
      <div className="k">
        <span>
          <span className="dot" />
          {COMP_STATUS[c.status]} · {c.year}
        </span>
        <b>{["Lancement", "En compétition", "Finale", "Champion"][c.phase]}</b>
      </div>
      <h3>
        {c.name}
        <small>{c.edition}</small>
      </h3>
      <p>{c.about}</p>
      <Phases phase={c.phase} />
    </div>
  );
}

export function IflBars({ list, mini }: { list: Competition[]; mini?: boolean }) {
  const ifl = list.filter((c) => c.family === "IFL");
  const max = Math.max(1, ...ifl.map((c) => c.participants || 0));
  return (
    <>
      <div className="bars" role="img" aria-label={`Universités par édition de l’IFL : ${ifl.map((c) => `${c.year} ${c.participants ?? "en cours"}`).join(", ")}`}>
        {ifl.map((c) =>
          c.participants ? (
            <div className="bar" key={c.id}>
              <b>{c.participants}</b>
              <i style={{ ["--h" as string]: `${Math.round((c.participants / max) * (mini ? 78 : 82))}%` }} />
            </div>
          ) : (
            <div className="bar open" key={c.id}>
              <b>En cours</b>
              <i style={{ ["--h" as string]: mini ? "30%" : "34%" }} />
            </div>
          ),
        )}
      </div>
      <div className="bar-x">
        {ifl.map((c) => (
          <div key={c.id}>
            <b>{c.year}</b>
            {!mini && <span>{c.edition}</span>}
            <span className={c.winner ? "w" : ""}>{c.status === "PAST" ? c.winner || "À déterminer" : COMP_STATUS[c.status]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function HistCard({ c }: { c: Competition }) {
  return (
    <Link className="hc" href={`/competitions/${c.slug}`}>
      <div className="hc-top">
        <div className="k">
          <span>
            {c.year} · {c.discipline === "À compléter" ? c.family : c.discipline}
          </span>
          <b>{COMP_STATUS[c.status]}</b>
        </div>
        <h3>{compTitle(c)}</h3>
      </div>
      <div className="hc-b">
        <div className={`hc-w${c.winner ? "" : " tbd"}`}>
          <Crest name={c.winner} />
          <div>
            <small>Vainqueur</small>
            {c.winner || "À déterminer"}
          </div>
        </div>
        <div className="hc-f">
          <span>{c.finalists.length ? c.finalists.join(" vs ") : `${c.participants ?? "—"} ${c.unit}`}</span>
          <b>Voir la fiche →</b>
        </div>
      </div>
    </Link>
  );
}

export function WinnerCell({ c }: { c: Competition }) {
  return c.winner ? (
    <>
      <Crest name={c.winner} />
      <Trophy />
      {c.winner}
    </>
  ) : (
    <>À déterminer</>
  );
}
