import { asc } from "drizzle-orm";
import { updateUserAction } from "@/app/actions/admin";
import { NewUserForm } from "@/components/admin/AccountForms";
import { requireUser, ROLE_LABEL } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Utilisateurs" };

export default async function Users() {
  const me = await requireUser(["ADMIN"]);
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.createdAt));
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Utilisateurs</h1>
          <p>Administrateur : accès complet. Éditeur : publie et gère compétitions, talents et inscriptions. Contributeur : rédige des brouillons.</p>
        </div>
      </div>
      <div className="adm-card adm-scroll">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Créé le</th>
              <th>Rôle et accès</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="t">{u.name}</td>
                <td>{u.email}</td>
                <td>{fmtDate(u.createdAt)}</td>
                <td>
                  {u.id === me.id ? (
                    <span className="muted">{ROLE_LABEL[u.role]} (vous)</span>
                  ) : (
                    <form action={updateUserAction} className="quick">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className="cfield" aria-label={`Rôle de ${u.name}`}>
                        {Object.entries(ROLE_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                      <label style={{ display: "flex", gap: ".35rem", alignItems: "center", fontSize: ".82rem", fontWeight: 600 }}>
                        <input type="checkbox" name="active" defaultChecked={u.active} /> Actif
                      </label>
                      <button className="ib" type="submit">
                        Enregistrer
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="adm-card">
        <h2>Ajouter un membre de l’équipe</h2>
        <NewUserForm />
      </div>
    </>
  );
}
