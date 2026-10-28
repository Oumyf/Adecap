import Link from "next/link";
import { crestOf, PHASES } from "@/lib/format";
import type { TalentAttribute } from "@/db/schema";

export function Crest({ name, className = "crest-s" }: { name?: string | null; className?: string }) {
  if (!name) return <span className={`${className} sym`} aria-hidden="true" />;
  const c = crestOf(name);
  return (
    <span className={className} style={{ background: c.color }} aria-hidden="true">
      {c.label}
    </span>
  );
}

export function Trophy() {
  return (
    <svg className="tro" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h8v4a4 4 0 0 1-8 0zM6 5H3v1a3 3 0 0 0 3 3M14 5h3v1a3 3 0 0 1-3 3M10 11v3M7 17h6l-1-3H8z" />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function Phases({ phase }: { phase: number }) {
  return (
    <ol className="phases" aria-label={`Avancement : ${PHASES[phase]}`}>
      {PHASES.map((p, i) => (
        <li key={p} className={i < phase ? "done" : i === phase ? "on" : ""} aria-current={i === phase ? "step" : undefined}>
          {p}
        </li>
      ))}
    </ol>
  );
}

export function PageHead({ crumb, eyebrow, title, lead, children }: { crumb: string; eyebrow?: string; title: React.ReactNode; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="band phead diag">
      <div className="wrap">
        <p className="crumbs">
          <Link href="/">Accueil</Link> / {crumb}
        </p>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}

export function SecHead({ eyebrow, title, link, style }: { eyebrow: string; title: string; link?: { href: string; label: string }; style?: React.CSSProperties }) {
  return (
    <div className="sec-head" style={style}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <span className="rule" />
      </div>
      {link && (
        <Link className="link-arrow" href={link.href}>
          {link.label} →
        </Link>
      )}
    </div>
  );
}

const ICONS: Record<TalentAttribute["icon"], React.ReactNode> = {
  run: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4.5" r="2" />
      <path d="M8 21l3-6 3 2v4M6 11l3-3 4 1 2 3 3 1M11 15l1-5" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  ),
  cap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <path d="M15 9l5-5M17 4h3v3" />
    </svg>
  ),
};

export function Attributes({ items }: { items: TalentAttribute[] }) {
  return (
    <div className="attrs">
      {items.map((a, i) => (
        <div className="attr" key={i}>
          <span className="ic" aria-hidden="true">
            {ICONS[a.icon] ?? ICONS.target}
          </span>
          <div>
            <b>{a.title}</b>
            <span>{a.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}
