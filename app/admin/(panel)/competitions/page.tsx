import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { deleteCompetition, quickCompetition } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/ActionButton";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { COMP_STATUS, compTitle, PHASES } from "@/lib/format";
import { listCompetitions } from "@/lib/queries";

export const metadata = { title: "Compétitions" };

export default async function AdminCompetitions({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const { ok } = await searchParams;
  const list = (await listCompetitions()).reverse();
  const alerts = await db.select({ id: schema.competitionAlerts.competitionId, n: count() }).from(schema.competitionAlerts).groupBy(schema.competitionAlerts.competitionId);
  const nAlerts = new Map(alerts.map((a) => [a.id, a.n]));
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Compétitions</h1>
          <p>Statut, avancement et vainqueur se mettent à jour directement sur l’accueil et la page Compétitions.</p>
        </div>
        <Link className="btn btn-ink btn-sm" href="/admin/competitions/nouveau">
          Nouvelle compétition
        </Link>
      </div>
      {ok && <p className="adm-flash ok">Compétition enregistrée.</p>}
      <div className="adm-card adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Compétition</th>
              <th>Année</th>
              <th>Statut · avancement · vainqueur</th>
              <th>Alertes</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td className="t">
                  <Link href={`/admin/competitions/${c.id}`}>{compTitle(c)}</Link>
                </td>
                <td>{c.year}</td>
                <td>
                  <form action={quickCompetition} className="quick">
                    <input type="hidden" name="id" value={c.id} />
                    <select name="status" defaultValue={c.status} aria-label={`Statut de ${compTitle(c)}`} className="cfield">
                      {Object.entries(COMP_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <select name="phase" defaultValue={c.phase} aria-label="Avancement" className="cfield" title="Avancement (compétitions en cours)">
                      {PHASES.map((p, i) => (
                        <option key={p} value={i}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <input name="winner" defaultValue={c.winner ?? ""} placeholder="Vainqueur" aria-label="Vainqueur" className="cfield" />
                    <button className="ib" type="submit">
                      Enregistrer
                    </button>
                  </form>
                </td>
                <td>{nAlerts.get(c.id) ?? 0}</td>
                <td>
                  <div className="acts">
                    <Link className="ib" href={`/admin/competitions/${c.id}`}>
                      Fiche complète
                    </Link>
                    <a className="ib" href={`/competitions/${c.slug}`} target="_blank" rel="noreferrer">
                      Voir
                    </a>
                    {can.delete(u.role) && (
                      <ActionButton className="ib danger" action={deleteCompetition.bind(null, c.id)} confirm={`Supprimer ${compTitle(c)} ${c.year} ?`}>
                        Supprimer
                      </ActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
