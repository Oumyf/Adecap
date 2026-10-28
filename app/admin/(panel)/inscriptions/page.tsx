import Link from "next/link";
import { desc } from "drizzle-orm";
import { approveSchool, deleteSchool, deleteStudent } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/ActionButton";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { ageOf, fmtDate } from "@/lib/format";

export const metadata = { title: "Inscriptions" };

export default async function Inscriptions({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const { vue } = await searchParams;
  const tab = vue === "etudiants" ? "etudiants" : "etablissements";
  const [schools, students] = await Promise.all([
    db.query.schools.findMany({ orderBy: desc(schema.schools.createdAt), with: { students: { columns: { id: true } } } }),
    db.query.students.findMany({ orderBy: desc(schema.students.createdAt), with: { school: true } }),
  ]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Inscriptions</h1>
          <p>Établissements et profils d’élèves et d’étudiants inscrits depuis le site.</p>
        </div>
        <a className="btn btn-line btn-sm" href={`/admin/export/${tab}`}>
          Exporter en CSV (Excel)
        </a>
      </div>
      <nav className="chips-nav" aria-label="Vue">
        <Link className="fchip" href="/admin/inscriptions" aria-current={tab === "etablissements" ? "page" : undefined}>
          Établissements ({schools.length})
        </Link>
        <Link className="fchip" href="/admin/inscriptions?vue=etudiants" aria-current={tab === "etudiants" ? "page" : undefined}>
          Élèves et étudiants ({students.length})
        </Link>
      </nav>
      <div className="adm-card adm-scroll">
        {tab === "etablissements" ? (
          <table className="adm-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Établissement</th>
                <th>Référent</th>
                <th>Disciplines</th>
                <th>Équipes</th>
                <th>Élèves</th>
                <th>Statut</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontSize: ".78rem", whiteSpace: "nowrap" }}>{s.number}</td>
                  <td className="t">
                    {s.name}
                    <div className="muted" style={{ fontWeight: 500, fontSize: ".78rem" }}>
                      {s.type} · {s.city}, {s.region} · {fmtDate(s.createdAt)}
                    </div>
                  </td>
                  <td style={{ fontSize: ".82rem" }}>
                    {s.refName} · {s.refRole}
                    <div>
                      <a href={`mailto:${s.refEmail}`}>{s.refEmail}</a> · <a href={`https://wa.me/${s.refPhone.replace(/[^\d]/g, "")}`}>{s.refPhone}</a>
                    </div>
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{s.disciplines.join(", ")}</td>
                  <td>{s.teams}</td>
                  <td>{s.students.length}</td>
                  <td>{s.status === "APPROVED" ? <span className="status s-ok">Validé</span> : <span className="status s-warn">En attente</span>}</td>
                  <td>
                    <div className="acts">
                      {s.status !== "APPROVED" && <ActionButton action={approveSchool.bind(null, s.id)}>Valider</ActionButton>}
                      {can.delete(u.role) && (
                        <ActionButton className="ib danger" action={deleteSchool.bind(null, s.id)} confirm={`Supprimer ${s.name} ?`}>
                          Supprimer
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Âge</th>
                <th>Établissement</th>
                <th>Disciplines</th>
                <th>Contact</th>
                <th>Canaux</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const age = ageOf(s.birthDate);
                return (
                  <tr key={s.id}>
                    <td className="t">
                      {s.firstName} {s.lastName}
                      <div className="muted" style={{ fontWeight: 500, fontSize: ".78rem" }}>
                        {s.category} · {s.level} · {fmtDate(s.createdAt)}
                      </div>
                    </td>
                    <td>
                      {age}
                      {age < 18 && (
                        <div>
                          <span className="status s-info">{s.guardianConsent ? "Autorisation parentale" : "Mineur"}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: ".82rem" }}>{s.school?.name ?? (s.schoolOther ? `${s.schoolOther} (non inscrit)` : "—")}</td>
                    <td style={{ fontSize: ".82rem" }}>
                      {s.disciplines.join(", ")}
                      {s.position ? ` · ${s.position}` : ""}
                    </td>
                    <td style={{ fontSize: ".82rem" }}>
                      {s.phone}
                      {s.email && <div>{s.email}</div>}
                    </td>
                    <td style={{ fontSize: ".82rem" }}>{s.optIn ? s.channels.join(", ") : "Refuse les envois"}</td>
                    <td>
                      <div className="acts">
                        {can.delete(u.role) && (
                          <ActionButton className="ib danger" action={deleteStudent.bind(null, s.id)} confirm={`Supprimer le profil de ${s.firstName} ${s.lastName} ?`}>
                            Supprimer
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {(tab === "etablissements" ? schools : students).length === 0 && <p className="muted">Aucune inscription pour le moment.</p>}
      </div>
    </>
  );
}
