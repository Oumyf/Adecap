import type { Metadata } from "next";
import { Suspense } from "react";
import { Registration } from "@/components/forms/Registration";
import { CheckIcon, PageHead } from "@/components/ui";
import { registrationCounts, schoolOptions } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "S’inscrire à la saison", description: "Établissements et étudiants : inscrivez-vous en ligne aux compétitions ADECAP et recevez calendrier, convocations et résultats." };

export default async function Inscription() {
  const [schools, counts] = await Promise.all([schoolOptions(), registrationCounts()]);
  return (
    <>
      <PageHead crumb="S’inscrire" eyebrow="Saison 2026-2027 · Inscriptions ouvertes" title={<>Rejoindre<br />la saison ADECAP</>} lead="Établissements et étudiants s’inscrivent en ligne. Plus besoin d’attendre notre passage : vous recevez directement le calendrier, les convocations et les résultats.">
        <div className="reg-facts">
          <div>
            <b>3 min</b>
            <span>pour inscrire un établissement</span>
          </div>
          <div>
            <b>Gratuit</b>
            <span>pour les établissements et les étudiants</span>
          </div>
          <div>
            <b>3 canaux</b>
            <span>WhatsApp, SMS ou e-mail</span>
          </div>
        </div>
      </PageHead>
      <div className="sec">
        <div className="wrap">
          <div className="reg-layout">
            <div>
              <Suspense>
                <Registration schools={schools} />
              </Suspense>
            </div>
            <aside className="reg-side">
              <div className="side-card live diag">
                <h3>Déjà dans la saison</h3>
                <div className="live-n">
                  <div>
                    <b>{counts.schools}</b>
                    <span>établissements</span>
                  </div>
                  <div>
                    <b>{counts.students}</b>
                    <span>étudiants</span>
                  </div>
                </div>
              </div>
              <div className="side-card">
                <h3>Pourquoi s’inscrire en ligne</h3>
                <ul>
                  {[
                    "Engagez vos équipes sans attendre la visite d’un agent ADECAP.",
                    "Recevez convocations, horaires et changements de dernière minute.",
                    "Suivez les résultats et les classements de votre établissement.",
                    "Soyez repéré par la rubrique Talents à suivre.",
                  ].map((t) => (
                    <li key={t}>
                      <CheckIcon />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="side-card">
                <h3>Vos données</h3>
                <p className="small">Elles servent uniquement à l’organisation des compétitions et à l’envoi des informations que vous avez acceptées. Elles ne sont jamais cédées à des tiers et vous pouvez demander leur suppression à tout moment.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
