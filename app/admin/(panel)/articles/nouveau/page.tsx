import { asc } from "drizzle-orm";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Nouvel article" };

export default async function NewArticle({ searchParams }: { searchParams: Promise<{ talent?: string }> }) {
  const u = await requireUser();
  const { talent } = await searchParams;
  const talents = await db.select().from(schema.talents).orderBy(asc(schema.talents.lastName));
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Nouvel article</h1>
          <p>{talent ? "Rédigez le portrait du talent que vous venez d’ajouter." : "Article, communiqué ou portrait d’un talent à suivre."}</p>
        </div>
      </div>
      <ArticleForm talents={talents.map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))} canPublish={can.publish(u.role)} defaultTalent={talent} />
    </>
  );
}
