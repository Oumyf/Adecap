const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function fmtDate(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getUTCDate()} ${MOIS[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
}

export function fmtDateTime(d: Date) {
  return `${fmtDate(d)} · ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function paragraphs(body: string) {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

const CREST_C = ["#0B1F45", "#164A9B", "#8A6500", "#0E6E5C", "#9A3A24", "#4B3B8F", "#2F5D8A"];
export function crestOf(name: string) {
  const w = name.replace(/[’']/g, " ").split(/[\s-]+/).filter(Boolean);
  const ab = w.length === 1 ? w[0].slice(0, 4) : w.slice(0, 3).map((x) => x[0]).join("");
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return { label: ab.toUpperCase(), color: CREST_C[h % CREST_C.length] };
}

export function ageOf(d: Date) {
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
}

export const STATUS_LABEL = { DRAFT: "Brouillon", SCHEDULED: "Programmé", PUBLISHED: "Publié", ARCHIVED: "Archivé" } as const;
export const STATUS_CLASS = { DRAFT: "s-mute", SCHEDULED: "s-info", PUBLISHED: "s-ok", ARCHIVED: "s-warn" } as const;
export const COMP_STATUS = { PAST: "Passé", ONGOING: "En cours", UPCOMING: "À venir" } as const;
export const PHASES = ["Lancement", "En compétition", "Finale", "Champion"];

export const CATEGORIES = ["Talents à suivre", "Compétitions", "Partenariats", "Culture", "Jeunesse", "ADECAP Studio", "Vie associative", "Communiqués"];

export function compTitle(c: { name: string; edition: string }) {
  return c.name + (/^(Nouvelle|Édition)/.test(c.edition) ? "" : " · " + c.edition);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?[\d\s.-]{8,}$/;
