import Link from "next/link";
import { desc } from "drizzle-orm";
import { deleteTalent } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/ActionButton";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { STATUS_CLASS, STATUS_LABEL } from "@/lib/format";

export const metadata = { title: "Talents à suivre" };

export default async function Talents({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const { ok } = await searchParams;
  const list = await db.query.talents.findMany({ orderBy: desc(schema.talents.createdAt), with: { articles: true } });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Talents à suivre</h1>
          <p>Chaque talent apparaît dans la rubrique Actualités dès que son portrait est publié.</p>
        </div>
        <Link className="btn btn-gold btn-sm" href="/admin/talents/nouveau">
          Nouveau talent
        </Link>
      </div>
      {ok && <p className="adm-flash ok">Talent enregistré.</p>}
      <div className="adm-card adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th />
              <th>Joueur</th>
              <th>Poste</th>
              <th>Formation</th>
              <th>Portrait</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => {
              const art = t.articles[0];
              return (
                <tr key={t.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="adm-thumb" src={t.thumbUrl || t.photoUrl} alt="" />
                  </td>
                  <td className="t">
                    <Link href={`/admin/talents/${t.id}`}>
                      {t.firstName} {t.lastName}
                    </Link>
                  </td>
                  <td>{t.position}</td>
                  <td>{t.school}</td>
                  <td>{art ? <span className={`status ${STATUS_CLASS[art.status]}`}>{STATUS_LABEL[art.status]}</span> : <span className="status s-warn">À rédiger</span>}</td>
                  <td>
                    <div className="acts">
                      <Link className="ib" href={`/admin/talents/${t.id}`}>
                        Modifier
                      </Link>
                      {art ? (
                        <Link className="ib" href={`/admin/articles/${art.id}`}>
                          Portrait
                        </Link>
                      ) : (
                        <Link className="ib" href={`/admin/articles/nouveau?talent=${t.id}`}>
                          Rédiger le portrait
                        </Link>
                      )}
                      {can.delete(u.role) && (
                        <ActionButton className="ib danger" action={deleteTalent.bind(null, t.id)} confirm={`Supprimer ${t.firstName} ${t.lastName} ? Son portrait restera publié comme article simple.`}>
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
        {!list.length && <p className="muted">Aucun talent pour le moment.</p>}
      </div>
    </>
  );
}
