import Link from "next/link";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "./forms/NewsletterForm";

export function Footer() {
  return (
    <footer className="band diag">
      <div className="wrap">
        <div className="foot">
          <div>
            <Link className="logo" href="/">
              <span className="mark" aria-hidden="true" />
              <span className="wm">
                <b>ADECAP</b>
                <small>ENTERTAINMENT</small>
              </span>
            </Link>
            <p>Sport · Culture · Événements · Impact</p>
            <p className="sig">{SITE.tagline}</p>
            <NewsletterForm />
          </div>
          <div>
            <h4>La structure</h4>
            <Link href="/a-propos">À propos</Link>
            <Link href="/programmes">Programmes</Link>
            <Link href="/partenariats">Partenariats</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>
            <h4>Suivre</h4>
            <Link href="/inscription">S’inscrire</Link>
            <Link href="/competitions">Compétitions</Link>
            <Link href="/actualites">Actualités</Link>
            <Link href="/actualites?categorie=Talents%20%C3%A0%20suivre">Talents à suivre</Link>
            <Link href="/mediatheque">Médiathèque</Link>
          </div>
          <div>
            <h4>Informations</h4>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Politique de confidentialité</Link>
            <Link href="/admin">Espace équipe</Link>
          </div>
        </div>
        <div className="legal">
          <span>© {new Date().getFullYear()} ADECAP Entertainment · Guédiawaye, Dakar</span>
          <span>{SITE.email}</span>
        </div>
        <div className="wordmark" aria-hidden="true">
          ADECAP
        </div>
      </div>
    </footer>
  );
}
