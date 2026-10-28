import type { Metadata } from "next";
import { MediaGrid } from "@/components/MediaGrid";
import { PageHead } from "@/components/ui";
import { MEDIA } from "@/lib/site";

export const metadata: Metadata = { title: "Médiathèque", description: "Photos ADECAP Studio des compétitions, des talents à suivre et des événements ADECAP." };

export default function Mediatheque() {
  return (
    <>
      <PageHead crumb="Médiathèque" title="Médiathèque" lead="Photos et affiches d’ADECAP Studio, classées par thème, et ressources pour la presse et les partenaires." />
      <div className="sec">
        <div className="wrap" style={{ display: "grid", gap: "4rem" }}>
          <MediaGrid items={MEDIA} />
          <div>
            <div className="sec-head">
              <div>
                <p className="eyebrow">Espace presse</p>
                <h2>Ressources</h2>
                <span className="rule" />
              </div>
            </div>
            <div className="docs">
              <div className="doc">
                <div className="doc-ic">JPG</div>
                <div>
                  <b>Logo officiel ADECAP Entertainment</b>
                  <span>Image · version couleur sur fond blanc</span>
                </div>
                <a className="btn btn-line btn-sm" href="/images/logo-adecap-officiel.jpg" download>
                  Télécharger
                </a>
              </div>
              <div className="doc">
                <div className="doc-ic">JPG</div>
                <div>
                  <b>Affiche « Talent à suivre » : Amadou Diop</b>
                  <span>Image · 853 × 1280</span>
                </div>
                <a className="btn btn-line btn-sm" href="/images/affiche-amadou-diop.jpg" download>
                  Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
