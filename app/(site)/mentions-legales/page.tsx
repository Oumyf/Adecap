import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Mentions() {
  return (
    <>
      <PageHead crumb="Mentions légales" title="Mentions légales" />
      <div className="sec">
        <div className="wrap prose legal-page">
          <h2>Éditeur du site</h2>
          <p>ADECAP Entertainment, {SITE.address}. Contact : {SITE.email}, {SITE.phone}.</p>
          <p>Directeur de la publication, forme juridique et numéros d’immatriculation : à compléter par ADECAP.</p>
          <h2>Hébergement</h2>
          <p>Render Services, Inc., San Francisco, États-Unis (render.com).</p>
          <h2>Propriété intellectuelle</h2>
          <p>Le logo, les photos ADECAP Studio, les affiches et les textes de ce site sont la propriété d’ADECAP Entertainment. Toute reproduction sans autorisation est interdite.</p>
        </div>
      </div>
    </>
  );
}
