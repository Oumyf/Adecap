import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { can, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Modifier l’article" };

const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const a = await db.query.articles.findFirst({ where: eq(schema.articles.id, id) });
  if (!a) notFound();
  const talents = await db.select().from(schema.talents).orderBy(asc(schema.talents.lastName));
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Modifier l’article</h1>
          <p>{a.title}</p>
        </div>
      </div>
      <ArticleForm
        a={{ ...a, publishedAt: local(a.publishedAt) }}
        talents={talents.map((t) => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))}
        canPublish={can.publish(u.role)}
      />
    </>
  );
}
