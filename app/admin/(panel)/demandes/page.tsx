import { asc, desc } from "drizzle-orm";
import { deleteMessage, toggleMessage } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/ActionButton";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Demandes reçues" };

export default async function Demandes() {
  const u = await requireUser();
  const [msgs, subs, alerts] = await Promise.all([
    db.select().from(schema.contactMessages).orderBy(asc(schema.contactMessages.handled), desc(schema.contactMessages.createdAt)),
    db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt)),
    db.query.competitionAlerts.findMany({ with: { competition: true }, orderBy: desc(schema.competitionAlerts.createdAt) }),
  ]);
  const exportable = u.role !== "CONTRIBUTOR";
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Demandes reçues</h1>
          <p>Messages du formulaire de contact : partenariats, presse, bénévolat et questions.</p>
        </div>
        {exportable && (
          <a className="btn btn-line btn-sm" href="/admin/export/demandes">
            Exporter en CSV
          </a>
        )}
      </div>
      <div style={{ display: "grid", gap: ".8rem" }}>
        {msgs.map((m) => (
          <div key={m.id} className={`adm-msg adm-card${m.handled ? " done" : ""}`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <b style={{ color: "var(--ink)" }}>
                {m.name}
                {m.organization ? `, ${m.organization}` : ""}
              </b>
              <span className="meta" style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <span className={`status ${m.type === "Partenariat" ? "s-live" : "s-info"}`}>{m.type}</span>
                <span style={{ fontSize: ".8rem" }}>{fmtDateTime(m.createdAt)}</span>
              </span>
            </div>
            <span className="muted" style={{ fontSize: ".78rem", fontWeight: 600 }}>
              {m.reference} · <a href={`mailto:${m.email}?subject=${encodeURIComponent("ADECAP · " + m.reference)}`}>{m.email}</a>
              {m.phone ? ` · ${m.phone}` : ""}
            </span>
            <p>{m.message}</p>
            <div className="acts" style={{ justifyContent: "flex-start" }}>
              <a className="ib" href={`mailto:${m.email}?subject=${encodeURIComponent("ADECAP · " + m.reference)}`}>
                Répondre
              </a>
              <ActionButton action={toggleMessage.bind(null, m.id)}>{m.handled ? "Marquer à traiter" : "Marquer comme traitée"}</ActionButton>
              {can.delete(u.role) && (
                <ActionButton className="ib danger" action={deleteMessage.bind(null, m.id)} confirm="Supprimer cette demande ?">
                  Supprimer
                </ActionButton>
              )}
            </div>
          </div>
        ))}
        {!msgs.length && <div className="adm-card muted">Aucune demande pour le moment.</div>}
      </div>
      <div className="adm-card" id="abonnes">
        <div className="adm-head" style={{ marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Abonnés et alertes</h2>
          {exportable && (
            <a className="ib" href="/admin/export/abonnes">
              Exporter en CSV
            </a>
          )}
        </div>
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="t">{s.email}</td>
                  <td>Agenda par e-mail</td>
                  <td>{fmtDate(s.createdAt)}</td>
                </tr>
              ))}
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td className="t">{a.contact}</td>
                  <td>
                    Alerte · {a.competition.name} {a.competition.edition}
                  </td>
                  <td>{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!subs.length && !alerts.length && <p className="muted">Aucun abonné pour le moment.</p>}
        </div>
      </div>
    </>
  );
}
