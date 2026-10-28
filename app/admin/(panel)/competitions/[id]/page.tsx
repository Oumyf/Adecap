import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CompetitionForm } from "@/components/admin/CompetitionForm";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { compTitle } from "@/lib/format";

export const metadata = { title: "Modifier la compétition" };

export default async function EditCompetition({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const c = await db.query.competitions.findFirst({ where: eq(schema.competitions.id, id) });
  if (!c) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>
            {compTitle(c)} · {c.year}
          </h1>
          <p>Fiche complète de la compétition.</p>
        </div>
      </div>
      <CompetitionForm c={c} />
    </>
  );
}
