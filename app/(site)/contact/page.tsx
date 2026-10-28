import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHead } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Contacter ADECAP Entertainment : partenariats, presse, bénévolat et informations." };

export default function Contact() {
  return (
    <>
      <PageHead crumb="Contact" title="Parlons de votre projet" lead="Une question, un partenariat, une demande presse : chaque message est transmis à la bonne personne." />
      <div className="sec">
        <div className="wrap contact-grid">
          <div className="coords">
            <div className="coord">
              <span className="label">Adresse</span>
              <span className="val">{SITE.address}</span>
            </div>
            <div className="coord">
              <span className="label">E-mail</span>
              <span className="val">
                <a className="sel" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
              </span>
            </div>
            <div className="coord">
              <span className="label">Téléphone</span>
              <span className="val">
                <a className="sel" href={`tel:${SITE.phone.replace(/\s/g, "")}`}>
                  {SITE.phone}
                </a>
              </span>
            </div>
            <div className="coord" style={{ border: 0 }}>
              <span className="label">Réseaux sociaux</span>
              <div className="social">
                {SITE.socials.map((s) => (
                  <a className="social-l" key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label} <span>{s.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Suspense>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
