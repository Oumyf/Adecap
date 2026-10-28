import type { Metadata } from "next";
import { PageHead, SecHead } from "@/components/ui";
import { TEAM } from "@/lib/site";

export const metadata: Metadata = { title: "À propos", description: "ADECAP Entertainment, structure sénégalaise basée à Guédiawaye, dédiée à l’événementiel sportif et culturel, à la jeunesse et aux compétitions." };

const PILLARS = [
  ["Passion", "L’envie de faire vibrer les tribunes et les scènes.", "var(--ink)"],
  ["Jeunesse", "Les jeunes au centre de chaque projet.", "var(--accent)"],
  ["Excellence", "Une organisation professionnelle, du terrain à l’écran.", "var(--ink)"],
  ["Partenariat", "Des collaborations durables avec marques et institutions.", "var(--accent)"],
  ["Impact", "Des retombées mesurables pour les communautés.", "var(--or)"],
];

export default function About() {
  return (
    <>
      <PageHead crumb="À propos" title={<>Une marque<br />qui rassemble</>} lead="ADECAP Entertainment est une structure sénégalaise dédiée à l’événementiel sportif et culturel, à la jeunesse et aux compétitions." />
      <div className="sec">
        <div className="wrap" style={{ display: "grid", gap: "5.5rem" }}>
          <div className="intro">
            <div style={{ display: "grid", gap: "1.4rem" }}>
              <p className="eyebrow">Notre mission</p>
              <p className="big">Rassembler les communautés. Valoriser les talents. Créer des opportunités de partenariat.</p>
              <span className="rule" />
              <p className="muted">Basée à Guédiawaye, ADECAP conçoit des événements où le sport et la culture deviennent des leviers d’inclusion, de visibilité et de développement pour la jeunesse sénégalaise. Depuis 2023, elle organise l’IFL, le Tournoi des Élites, les Super Coupes et l’ASL, et ouvre en 2027 ses compétitions aux anciens, à l’AUFL et aux entreprises.</p>
            </div>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ceremonie.jpg" alt="Cérémonie organisée par ADECAP sur un terrain de football" />
            </figure>
          </div>
          <div>
            <SecHead eyebrow="Plateforme de marque" title="Cinq piliers" />
            <div className="pillars">
              {PILLARS.map(([t, p, c], i) => (
                <div className="pillar" key={t} style={{ ["--c" as string]: c }}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
            <div className="tone">
              <span>Ton</span>
              <b>Énergique · Accessible · Crédible</b>
            </div>
          </div>
          <div>
            <SecHead eyebrow="Méthode" title="Comment nous travaillons" />
            <div className="steps">
              {[
                ["Concevoir", "Concept, budget, plan de visibilité et dossier partenaires."],
                ["Organiser", "Logistique, sécurité, accueil des équipes et du public."],
                ["Valoriser", "Couverture ADECAP Studio, réseaux sociaux et relations presse."],
                ["Mesurer", "Bilan d’audience et d’impact remis à chaque partenaire."],
              ].map(([t, p], i) => (
                <div className="step" key={t}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SecHead eyebrow="Gouvernance" title="Organisation" />
            <div className="gov">
              <div className="gov-row">
                <b>Direction générale</b>
                <p>Stratégie, représentation institutionnelle et relations partenaires.</p>
              </div>
              <div className="gov-row">
                <b>Pôles opérationnels</b>
                <p>Sport, culture, jeunesse et ADECAP Studio, chacun piloté par un responsable.</p>
              </div>
              <div className="gov-row">
                <b>Comité partenaires</b>
                <p>Suivi des engagements, des contreparties et des bilans d’impact.</p>
              </div>
            </div>
          </div>
          <div>
            <SecHead eyebrow="Équipe" title="Les responsables" />
            <div className="team">
              {TEAM.map((r) => (
                <div className="person" key={r}>
                  <div className="avatar" aria-hidden="true" />
                  <div>
                    <b>{r}</b>
                    <span>Nom et portrait à renseigner</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
