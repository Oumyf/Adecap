import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { logout } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireUser, ROLE_LABEL } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Administration", template: "%s · Administration ADECAP" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const [[msgs], [pending]] = await Promise.all([
    db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.handled, false)),
    db.select({ n: count() }).from(schema.schools).where(eq(schema.schools.status, "PENDING")),
  ]);
  return (
    <div className="adm">
      <aside className="adm-side">
        <a className="logo" href="/" title="Voir le site">
          <span className="mark" aria-hidden="true" />
          <span className="wm">
            <b>ADECAP</b>
            <small>ADMINISTRATION</small>
          </span>
        </a>
        <AdminNav role={u.role} counts={{ messages: msgs.n, schools: pending.n }} />
        <div className="adm-user">
          <span>
            <b>{u.name}</b>
            {ROLE_LABEL[u.role]}
          </span>
          <a href="/admin/compte">Mon compte</a>
          <form action={logout}>
            <button type="submit" style={{ width: "100%" }}>
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
