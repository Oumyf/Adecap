import { desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Journal d’activité" };

export default async function Journal() {
  await requireUser();
  const logs = await db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.createdAt)).limit(300);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Journal d’activité</h1>
          <p>Les 300 dernières opérations, pour la traçabilité.</p>
        </div>
      </div>
      <div className="adm-card adm-log">
        {logs.map((l) => (
          <div key={l.id}>
            <time>{fmtDateTime(l.createdAt)}</time>
            <span>
              <b>{l.actor}</b> {l.action}
            </span>
          </div>
        ))}
        {!logs.length && <p className="muted">Aucune activité.</p>}
      </div>
    </>
  );
}
