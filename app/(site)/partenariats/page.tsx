import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, SecHead } from "@/components/ui";

export const metadata: Metadata = { title: "Partenariats", description: "Le partenariat ADECAP – African University Football League et les offres pour les marques, institutions et médias." };

export default function Partenariats() {
  return (
    <>
      <PageHead crumb="Partenariats" eyebrow="African University Football League" title={<>Un partenariat<br />continental</>} lead="Le partenariat avec l’AUFL inscrit les universités accompagnées par ADECAP dans un circuit africain et aligne nos compétitions sur des standards partagés." />
      <div className="band" style={{ background: "var(--band-2)" }}>
        <div className="wrap" style={{ paddingBlock: "3.5rem" }}>
          <div className="obj">
            {[
              ["Qualifier les universités", "Les compétitions universitaires ADECAP deviennent une voie d’accès aux phases continentales."],
              ["Élever les standards", "Cahier d’organisation commun : terrains, arbitrage, sécurité, médical."],
              ["Former les encadrants", "Accès aux formations de la ligue pour entraîneurs, arbitres et dirigeants."],
              ["Rendre visibles les talents", "Diffusion par ADECAP Studio, rubrique Talents à suivre et mise en relation avec les clubs."],
            ].map(([t, p], i) => (
              <div key={t}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="sec">
        <div className="wrap" style={{ display: "grid", gap: "5rem" }}>
          <div>
            <SecHead eyebrow="Feuille de route" title="Étapes" />
            <div className="steps">
              {[
                ["OCT. 2026", "Signature", "Accord-cadre et désignation des référents."],
                ["2026 – 2027", "Préparation", "Sélection des universités et cahier d’organisation commun."],
                ["MARS 2027", "AUFL · 1ère édition", "Douze universités engagées."],
                ["ENSUITE", "Rendez-vous continental", "Participation aux phases de l’AUFL."],
              ].map(([n, t, p]) => (
                <div className="step" key={t}>
                  <span className="n">{n}</span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SecHead eyebrow="Réseau" title="Devenir partenaire d’ADECAP" />
            <div className="grid3">
              {[
                ["Marques", "Sponsoring et activation", "Visibilité terrain, contenus co-produits, activations auprès d’un public jeune."],
                ["Institutions", "Projets d’intérêt général", "Programmes jeunesse, inclusion et cohésion sociale par le sport et la culture."],
                ["Médias", "Diffusion et contenus", "Accès aux images ADECAP Studio, retransmissions et interviews."],
              ].map(([k, t, p]) => (
                <div className="card" key={k}>
                  <div className="card-b">
                    <span className="tag">{k}</span>
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="band cta diag">
        <div className="wrap">
          <div style={{ display: "grid", gap: "1.1rem", position: "relative", zIndex: 1 }}>
            <p className="eyebrow">Rejoindre le réseau</p>
            <h2>
              Plus qu’un sponsoring, <em>un impact.</em>
            </h2>
          </div>
          <div className="actions">
            <Link className="btn btn-gold" href="/contact?objet=Partenariat">
              Demander le dossier partenaire
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
