import { CompetitionForm } from "@/components/admin/CompetitionForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Nouvelle compétition" };

export default async function NewCompetition() {
  await requireUser(["ADMIN", "EDITOR"]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Nouvelle compétition</h1>
          <p>Ajoutez une édition : elle apparaît dans le calendrier, l’historique et, une fois terminée, le palmarès.</p>
        </div>
      </div>
      <CompetitionForm />
    </>
  );
}
