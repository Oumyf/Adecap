import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { requireUser, ROLE_LABEL } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const u = await requireUser();
  const { refus } = await searchParams;
  const n = async (q: Promise<{ n: number }[]>) => (await q)[0].n;
  const [published, drafts, talents, schools, students, messages, subs, alerts, logs] = await Promise.all([
    n(db.select({ n: count() }).from(schema.articles).where(eq(schema.articles.status, "PUBLISHED"))),
    n(db.select({ n: count() }).from(schema.articles).where(eq(schema.articles.status, "DRAFT"))),
    n(db.select({ n: count() }).from(schema.talents)),
    n(db.select({ n: count() }).from(schema.schools)),
    n(db.select({ n: count() }).from(schema.students)),
    n(db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.handled, false))),
    n(db.select({ n: count() }).from(schema.subscribers)),
    n(db.select({ n: count() }).from(schema.competitionAlerts)),
    db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.createdAt)).limit(8),
  ]);
  const kpis = [
    ["Articles publiés", published, `${drafts} brouillon${drafts > 1 ? "s" : ""}`, "/admin/articles"],
    ["Talents à suivre", talents, "portraits", "/admin/talents"],
    ["Établissements", schools, "inscrits", "/admin/inscriptions"],
    ["Élèves et étudiants", students, "profils", "/admin/inscriptions?vue=etudiants"],
    ["Demandes à traiter", messages, "formulaire de contact", "/admin/demandes"],
    ["Abonnés", subs + alerts, `${subs} agenda · ${alerts} alertes`, "/admin/demandes#abonnes"],
  ] as const;
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Bonjour {u.name.split(" ")[0]}</h1>
          <p>Connecté en tant que {ROLE_LABEL[u.role].toLowerCase()}.</p>
        </div>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <Link className="btn btn-ink btn-sm" href="/admin/articles/nouveau">
            Nouvel article
          </Link>
          {u.role !== "CONTRIBUTOR" && (
            <Link className="btn btn-gold btn-sm" href="/admin/talents/nouveau">
              Nouveau talent à suivre
            </Link>
          )}
          <Link className="btn btn-line btn-sm" href="/">
            Voir le site
          </Link>
        </div>
      </div>
      {refus && <p className="adm-flash ko">Votre rôle ne permet pas d’accéder à cette page.</p>}
      <div className="adm-kpis">
        {kpis.map(([l, v, sub, href]) => (
          <Link key={l} href={href} className="adm-kpi">
            <span>{l}</span>
            <b>{v}</b>
            <small>{sub}</small>
          </Link>
        ))}
      </div>
      <div className="adm-card">
        <h2>Activité récente</h2>
        <div className="adm-log">
          {logs.map((l) => (
            <div key={l.id}>
              <time>{fmtDateTime(l.createdAt)}</time>
              <span>
                <b>{l.actor}</b> {l.action}
              </span>
            </div>
          ))}
          {!logs.length && <p className="muted">Aucune activité pour le moment.</p>}
        </div>
      </div>
    </>
  );
}
