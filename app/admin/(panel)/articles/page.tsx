import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { deleteArticle, setArticleStatus } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/ActionButton";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fmtDate, STATUS_CLASS, STATUS_LABEL } from "@/lib/format";
import { publishDue } from "@/lib/queries";

export const metadata = { title: "Actualités" };

export default async function Articles({ searchParams }: { searchParams: Promise<{ ok?: string; statut?: string }> }) {
  const u = await requireUser();
  const sp = await searchParams;
  await publishDue();
  const filter = ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"].includes(sp.statut || "") ? (sp.statut as keyof typeof STATUS_LABEL) : undefined;
  const list = await db.query.articles.findMany({ where: filter ? eq(schema.articles.status, filter) : undefined, orderBy: desc(schema.articles.publishedAt), with: { talent: true } });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Actualités</h1>
          <p>Articles, communiqués et portraits des talents à suivre.</p>
        </div>
        <Link className="btn btn-ink btn-sm" href="/admin/articles/nouveau">
          Nouvel article
        </Link>
      </div>
      {sp.ok && <p className="adm-flash ok">Article enregistré.</p>}
      {!can.publish(u.role) && <p className="adm-flash ok">En tant que contributeur, vos articles sont enregistrés en brouillon. Un éditeur les relit et les publie.</p>}
      <nav className="chips-nav" aria-label="Filtrer par statut">
        <Link className="fchip" href="/admin/articles" aria-current={!filter ? "page" : undefined}>
          Tous
        </Link>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <Link key={k} className="fchip" href={`/admin/articles?statut=${k}`} aria-current={filter === k ? "page" : undefined}>
            {v}
          </Link>
        ))}
      </nav>
      <div className="adm-card adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td className="t">
                  <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                </td>
                <td>{a.category}</td>
                <td>
                  <span className={`status ${STATUS_CLASS[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                </td>
                <td style={{ whiteSpace: "nowrap", fontSize: ".8rem" }}>{fmtDate(a.publishedAt)}</td>
                <td>
                  <div className="acts">
                    <Link className="ib" href={`/admin/articles/${a.id}`}>
                      Modifier
                    </Link>
                    {a.status === "PUBLISHED" && (
                      <a className="ib" href={`/actualites/${a.slug}`} target="_blank" rel="noreferrer">
                        Voir
                      </a>
                    )}
                    {can.publish(u.role) && a.status !== "PUBLISHED" && <ActionButton action={setArticleStatus.bind(null, a.id, "PUBLISHED")}>Publier</ActionButton>}
                    {can.publish(u.role) && a.status !== "ARCHIVED" && <ActionButton action={setArticleStatus.bind(null, a.id, "ARCHIVED")}>Archiver</ActionButton>}
                    {can.delete(u.role) && (
                      <ActionButton className="ib danger" action={deleteArticle.bind(null, a.id)} confirm={`Supprimer définitivement « ${a.title} » ?`}>
                        Supprimer
                      </ActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="muted">Aucun article.</p>}
      </div>
    </>
  );
}
