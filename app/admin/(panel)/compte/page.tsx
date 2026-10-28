import { PasswordForm } from "@/components/admin/AccountForms";
import { requireUser, ROLE_LABEL } from "@/lib/auth";

export const metadata = { title: "Mon compte" };

export default async function Account() {
  const u = await requireUser();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Mon compte</h1>
          <p>
            {u.name} · {u.email} · {ROLE_LABEL[u.role]}
          </p>
        </div>
      </div>
      <div className="adm-card">
        <h2>Mot de passe</h2>
        <PasswordForm />
      </div>
    </>
  );
}
