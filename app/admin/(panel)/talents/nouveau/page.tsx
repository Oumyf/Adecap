import { TalentForm } from "@/components/admin/TalentForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Nouveau talent" };

export default async function NewTalent() {
  await requireUser(["ADMIN", "EDITOR"]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Nouveau talent à suivre</h1>
          <p>Reprenez les informations de l’affiche : poste, formation, objectif et les trois atouts.</p>
        </div>
      </div>
      <TalentForm />
    </>
  );
}
