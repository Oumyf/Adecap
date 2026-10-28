import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TalentForm } from "@/components/admin/TalentForm";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata = { title: "Modifier le talent" };

export default async function EditTalent({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["ADMIN", "EDITOR"]);
  const { id } = await params;
  const t = await db.query.talents.findFirst({ where: eq(schema.talents.id, id) });
  if (!t) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>
            {t.firstName} {t.lastName}
          </h1>
          <p>Modifier la fiche du talent.</p>
        </div>
      </div>
      <TalentForm t={t} />
    </>
  );
}
