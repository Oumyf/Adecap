import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Confidentialite() {
  return (
    <>
      <PageHead crumb="Confidentialité" title="Politique de confidentialité" />
      <div className="sec">
        <div className="wrap prose legal-page">
          <h2>Données collectées</h2>
          <p>Le site collecte uniquement les informations saisies dans les formulaires : demandes de contact, inscriptions d’établissements, profils d’élèves et d’étudiants, alertes de compétitions et inscriptions à l’agenda.</p>
          <h2>Utilisation</h2>
          <p>Ces données servent à traiter les demandes, à organiser les compétitions et à envoyer les informations que vous avez acceptées (calendrier, convocations, résultats). Elles ne sont jamais vendues ni cédées à des tiers.</p>
          <h2>Mineurs</h2>
          <p>L’inscription d’un élève de moins de 18 ans nécessite l’autorisation d’un parent ou d’un tuteur légal.</p>
          <h2>Conservation et droits</h2>
          <p>Les demandes de contact sont conservées 12 mois. Les profils sont conservés pendant la saison sportive puis supprimés sur demande. Pour accéder à vos données, les corriger ou les supprimer, écrivez à {SITE.email}.</p>
          <h2>Cookies</h2>
          <p>Le site n’utilise aucun cookie publicitaire. Un cookie technique est utilisé uniquement pour la connexion de l’équipe ADECAP à l’espace d’administration, et votre choix de thème clair ou sombre est mémorisé dans votre navigateur.</p>
        </div>
      </div>
    </>
  );
}
