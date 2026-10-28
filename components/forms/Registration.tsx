"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { registerSchool, registerStudent, type FormState } from "@/app/actions/public";
import { EMAIL_RE, PHONE_RE } from "@/lib/format";
import { REGIONS } from "@/lib/site";

type School = { id: string; name: string; city: string };
type Errors = Record<string, string>;

const E_DISC = ["Football masculin", "Football féminin", "Basketball", "Athlétisme", "Lutte", "Arts et culture"];
const E_COMP = ["IFL (universités)", "AUFL (universités)", "ASL", "Tournoi des Alumni", "CFL (entreprises)", "Événements culturels"];
const S_DISC = ["Football", "Basketball", "Athlétisme", "Lutte", "Handball", "Volleyball", "Arts et culture"];
const LEVELS = ["Seconde", "Première", "Terminale", "Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "BTS / formation pro"];

function age(v: string) {
  const d = new Date(v + "T00:00:00");
  if (isNaN(d.getTime())) return -1;
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--;
  return a;
}

function Stepper({ labels, i }: { labels: string[]; i: number }) {
  return (
    <div className="stepper" style={{ ["--n" as string]: labels.length }}>
      {labels.map((l, k) => (
        <div key={l} className={`stp ${k < i ? "done" : k === i ? "cur" : ""}`}>
          <i />
          <span>
            <em>{String(k + 1).padStart(2, "0")}</em>
            <b>{l}</b>
          </span>
        </div>
      ))}
    </div>
  );
}

function F({ name, label, err, children, hidden }: { name: string; label?: React.ReactNode; err?: string; children: React.ReactNode; hidden?: boolean }) {
  return (
    <div className={`field${err ? " bad" : ""}`} hidden={hidden}>
      {label && (typeof label === "string" ? <label htmlFor={name}>{label}</label> : label)}
      {children}
      <span className="err" role={err ? "alert" : undefined}>
        {err}
      </span>
    </div>
  );
}

function Picks({ name, options, checked = [] }: { name: string; options: string[]; checked?: string[] }) {
  return (
    <div className="picks">
      {options.map((o) => (
        <label key={o}>
          <input type="checkbox" name={name} value={o} defaultChecked={checked.includes(o)} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

const vals = (f: HTMLFormElement, n: string) => [...f.querySelectorAll<HTMLInputElement>(`input[name="${n}"]:checked`)].map((x) => x.value);
const val = (f: HTMLFormElement, n: string) => ((f.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "").trim();

export function Registration({ schools }: { schools: School[] }) {
  const params = useSearchParams();
  const [mode, setMode] = useState<"ecole" | "etudiant">(params.get("profil") === "etudiant" ? "etudiant" : "ecole");
  return (
    <>
      <div className="reg-choice" role="tablist" aria-label="Type d’inscription">
        <button className="choice" type="button" role="tab" aria-selected={mode === "ecole"} onClick={() => setMode("ecole")}>
          <span className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 11h.01M15 11h.01" />
            </svg>
          </span>
          <span>
            <b>Je représente un établissement</b>
            <small>Lycée, université, école supérieure : engagez vos équipes aux compétitions.</small>
          </span>
        </button>
        <button className="choice" type="button" role="tab" aria-selected={mode === "etudiant"} onClick={() => setMode("etudiant")}>
          <span className="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" />
            </svg>
          </span>
          <span>
            <b>Je suis élève ou étudiant</b>
            <small>Créez votre profil sportif et recevez les informations des compétitions.</small>
          </span>
        </button>
      </div>
      {mode === "ecole" ? <SchoolForm /> : <StudentForm schools={schools} />}
    </>
  );
}

function SchoolForm() {
  const labels = ["Établissement", "Référent", "Participation", "Validation"];
  const [i, setI] = useState(0);
  const [err, setErr] = useState<Errors>({});
  const [teams, setTeams] = useState(1);
  const [recap, setRecap] = useState<[string, string][]>([]);
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(registerSchool, { ok: false });
  const ref = useRef<HTMLFormElement>(null);
  const errors = { ...err, ...(state.errors || {}) };

  function check(step: number) {
    const f = ref.current!;
    const e: Errors = {};
    if (step === 0) {
      if (val(f, "name").length < 3) e.name = "Indiquez le nom de l’établissement.";
      if (!val(f, "region")) e.region = "Choisissez une région.";
      if (val(f, "city").length < 2) e.city = "Indiquez la commune.";
    }
    if (step === 1) {
      if (val(f, "refName").length < 3) e.refName = "Indiquez le nom du référent.";
      if (!EMAIL_RE.test(val(f, "refEmail"))) e.refEmail = "Saisissez une adresse e-mail valide, par exemple nom@domaine.sn.";
      if (!PHONE_RE.test(val(f, "refPhone"))) e.refPhone = "Saisissez un numéro valide, par exemple +221 77 123 45 67.";
    }
    if (step === 2 && !vals(f, "disciplines").length) e.disciplines = "Choisissez au moins une discipline.";
    setErr(e);
    return !Object.keys(e).length;
  }

  function next() {
    if (!check(i)) return;
    if (i === 2) {
      const f = ref.current!;
      setRecap([
        ["Établissement", val(f, "name")],
        ["Type", vals(f, "type")[0]],
        ["Localisation", `${val(f, "city")}, ${val(f, "region")}`],
        ["Effectif", val(f, "size")],
        ["Référent", `${val(f, "refName")} · ${val(f, "refRole")}`],
        ["Contact", `${val(f, "refEmail")} · ${val(f, "refPhone")}`],
        ["Disciplines", vals(f, "disciplines").join(", ")],
        ["Compétitions", vals(f, "competitions").join(", ") || "À définir avec ADECAP"],
        ["Équipes", String(teams)],
      ]);
    }
    setI(i + 1);
  }

  if (state.ok) {
    const invite = `Bonjour à tous ! ${state.data?.name ?? "Notre établissement"} participe aux compétitions ADECAP. Créez votre profil sportif en 2 minutes pour recevoir le calendrier et les convocations : ${typeof location !== "undefined" ? location.origin : ""}/inscription?profil=etudiant`;
    return (
      <div className="reg-layout one">
        <div className="form sent">
          <div className="ok-ic">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </div>
          <h3 style={{ fontSize: "1.6rem" }}>Établissement inscrit</h3>
          <p className="muted" style={{ maxWidth: "48ch" }}>
            Votre demande <b style={{ color: "var(--ink)" }}>{state.message}</b> est en cours de validation. Un référent ADECAP vous contacte pour confirmer vos équipes.
          </p>
          <div className="invite">
            <span className="lbl">Invitez vos élèves à créer leur profil</span>
            <p>{invite}</p>
            <button
              className="btn btn-ink btn-sm"
              type="button"
              style={{ justifySelf: "start" }}
              onClick={() => navigator.clipboard?.writeText(invite).then(() => setCopied(true), () => setCopied(false))}
            >
              {copied ? "Message copié" : "Copier le message"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="form" ref={ref} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} noValidate>
      <Stepper labels={labels} i={i} />
      <div className="fs" hidden={i !== 0}>
        <h3 className="fs-t">L’établissement</h3>
        <F name="name" label="Nom de l’établissement" err={errors.name}>
          <input id="name" name="name" autoComplete="organization" placeholder="Ex. Lycée de Guédiawaye" />
        </F>
        <div className="field">
          <span className="lbl">Type</span>
          <div className="types" role="radiogroup" aria-label="Type d’établissement">
            {["Lycée", "Université", "École supérieure", "Centre de formation"].map((t, k) => (
              <label key={t}>
                <input type="radio" name="type" value={t} defaultChecked={k === 0} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="row2">
          <F name="region" label="Région" err={errors.region}>
            <select id="region" name="region" defaultValue="">
              <option value="">Choisir…</option>
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </F>
          <F name="city" label="Commune" err={errors.city}>
            <input id="city" name="city" placeholder="Ex. Guédiawaye" />
          </F>
        </div>
        <F name="size" label="Effectif approximatif">
          <select id="size" name="size" defaultValue="500 – 1 000">
            {["Moins de 500", "500 – 1 000", "1 000 – 2 000", "2 000 – 5 000", "Plus de 5 000"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </F>
      </div>
      <div className="fs" hidden={i !== 1}>
        <h3 className="fs-t">Le référent sport</h3>
        <p className="muted fs-d">La personne que nous contactons pour les convocations et le calendrier.</p>
        <div className="row2">
          <F name="refName" label="Nom complet" err={errors.refName}>
            <input id="refName" name="refName" autoComplete="name" />
          </F>
          <F name="refRole" label="Fonction">
            <select id="refRole" name="refRole">
              {["Professeur d’EPS", "Responsable des sports", "Chef d’établissement", "Président de l’association sportive", "Autre"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </F>
        </div>
        <div className="row2">
          <F name="refEmail" label="E-mail" err={errors.refEmail}>
            <input id="refEmail" name="refEmail" type="email" autoComplete="email" />
          </F>
          <F name="refPhone" label="Téléphone (WhatsApp)" err={errors.refPhone}>
            <input id="refPhone" name="refPhone" type="tel" autoComplete="tel" placeholder="+221 77 123 45 67" />
          </F>
        </div>
      </div>
      <div className="fs" hidden={i !== 2}>
        <h3 className="fs-t">Participation</h3>
        <F name="disciplines" label={<span className="lbl">Disciplines</span>} err={errors.disciplines}>
          <Picks name="disciplines" options={E_DISC} />
        </F>
        <div className="field">
          <span className="lbl">Compétitions visées</span>
          <Picks name="competitions" options={E_COMP} />
        </div>
        <div className="field">
          <span className="lbl">Nombre d’équipes engagées</span>
          <div className="counter">
            <button type="button" aria-label="Retirer une équipe" onClick={() => setTeams((t) => Math.max(1, t - 1))}>
              −
            </button>
            <output aria-live="polite">{teams}</output>
            <button type="button" aria-label="Ajouter une équipe" onClick={() => setTeams((t) => Math.min(10, t + 1))}>
              +
            </button>
          </div>
          <input type="hidden" name="teams" value={teams} />
        </div>
        <F name="note" label={<label htmlFor="note">Précisions <i>(facultatif)</i></label>}>
          <textarea id="note" name="note" placeholder="Terrain disponible, contraintes de calendrier…" style={{ minHeight: 90 }} />
        </F>
      </div>
      <div className="fs" hidden={i !== 3}>
        <h3 className="fs-t">Vérifiez et validez</h3>
        <dl className="recap">
          {recap.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <F name="certify" err={errors.certify}>
          <label className="check">
            <input type="checkbox" name="certify" />
            <span>Je certifie être habilité(e) à inscrire cet établissement.</span>
          </label>
        </F>
        <F name="consent" err={errors.consent}>
          <label className="check">
            <input type="checkbox" name="consent" />
            <span>J’accepte que ces informations soient utilisées par ADECAP pour l’organisation des compétitions.</span>
          </label>
        </F>
      </div>
      <div className="hp" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && !state.ok && <p className="form-msg" role="alert">{state.message}</p>}
      {state.errors && i === 3 && Object.keys(state.errors).some((k) => !["certify", "consent"].includes(k)) && (
        <p className="form-msg" role="alert">Certaines informations sont incomplètes : revenez aux étapes précédentes pour les corriger.</p>
      )}
      <div className="form-nav">
        {i > 0 && (
          <button className="btn btn-line btn-sm" type="button" onClick={() => setI(i - 1)}>
            ← Précédent
          </button>
        )}
        {i < labels.length - 1 ? (
          <button className="btn btn-ink" type="button" onClick={next}>
            Continuer →
          </button>
        ) : (
          <button className="btn btn-gold" type="submit" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer l’inscription"}
          </button>
        )}
      </div>
    </form>
  );
}

function StudentForm({ schools }: { schools: School[] }) {
  const labels = ["Profil", "Pratique", "Contact"];
  const [i, setI] = useState(0);
  const [err, setErr] = useState<Errors>({});
  const [school, setSchool] = useState("");
  const [minor, setMinor] = useState(false);
  const [state, action, pending] = useActionState<FormState, FormData>(registerStudent, { ok: false });
  const ref = useRef<HTMLFormElement>(null);
  const errors = { ...err, ...(state.errors || {}) };

  function check(step: number) {
    const f = ref.current!;
    const e: Errors = {};
    if (step === 0) {
      if (val(f, "firstName").length < 2) e.firstName = "Indiquez votre prénom.";
      if (val(f, "lastName").length < 2) e.lastName = "Indiquez votre nom.";
      const a = age(val(f, "birthDate"));
      if (a < 12 || a > 35) e.birthDate = "Indiquez une date de naissance valide (entre 12 et 35 ans).";
      if (!val(f, "schoolId")) e.schoolId = "Choisissez votre établissement.";
      if (val(f, "schoolId") === "autre" && val(f, "schoolOther").length < 3) e.schoolOther = "Indiquez le nom de votre établissement.";
      if (!val(f, "level")) e.level = "Choisissez votre niveau.";
    }
    if (step === 1 && !vals(f, "disciplines").length) e.disciplines = "Choisissez au moins une discipline.";
    setErr(e);
    return !Object.keys(e).length;
  }

  if (state.ok)
    return (
      <div className="form sent">
        <h3 style={{ fontSize: "1.6rem" }}>Bienvenue dans la saison ADECAP</h3>
        <p className="muted" style={{ maxWidth: "48ch" }}>
          Votre profil est enregistré, {state.data?.name}. Vous recevrez le calendrier et les convocations par <b style={{ color: "var(--ink)" }}>{state.data?.channels}</b>.
        </p>
      </div>
    );

  return (
    <form className="form" ref={ref} onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} noValidate>
      <Stepper labels={labels} i={i} />
      <div className="fs" hidden={i !== 0}>
        <h3 className="fs-t">Votre profil</h3>
        <div className="row2">
          <F name="firstName" label="Prénom" err={errors.firstName}>
            <input id="firstName" name="firstName" autoComplete="given-name" />
          </F>
          <F name="lastName" label="Nom" err={errors.lastName}>
            <input id="lastName" name="lastName" autoComplete="family-name" />
          </F>
        </div>
        <div className="row2">
          <F name="birthDate" label="Date de naissance" err={errors.birthDate}>
            <input id="birthDate" name="birthDate" type="date" autoComplete="bday" onChange={(e) => setMinor(age(e.target.value) >= 0 && age(e.target.value) < 18)} />
          </F>
          <div className="field">
            <span className="lbl">Catégorie</span>
            <div className="types two" role="radiogroup" aria-label="Catégorie">
              {["Masculin", "Féminin"].map((c, k) => (
                <label key={c}>
                  <input type="radio" name="category" value={c} defaultChecked={k === 0} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="row2">
          <F name="schoolId" label="Établissement" err={errors.schoolId}>
            <select id="schoolId" name="schoolId" value={school} onChange={(e) => setSchool(e.target.value)}>
              <option value="">Choisir…</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
              <option value="autre">Mon établissement n’est pas dans la liste</option>
            </select>
          </F>
          <F name="level" label="Niveau" err={errors.level}>
            <select id="level" name="level" defaultValue="">
              <option value="">Choisir…</option>
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </F>
        </div>
        <F name="schoolOther" label="Nom de votre établissement" err={errors.schoolOther} hidden={school !== "autre"}>
          <input id="schoolOther" name="schoolOther" placeholder="Il sera invité à s’inscrire à son tour" />
        </F>
      </div>
      <div className="fs" hidden={i !== 1}>
        <h3 className="fs-t">Votre pratique</h3>
        <F name="disciplines" label={<span className="lbl">Disciplines</span>} err={errors.disciplines}>
          <Picks name="disciplines" options={S_DISC} />
        </F>
        <div className="row2">
          <F name="position" label={<label htmlFor="position">Poste ou spécialité <i>(facultatif)</i></label>}>
            <input id="position" name="position" placeholder="Ex. milieu offensif" />
          </F>
          <F name="practice" label="Niveau de pratique">
            <select id="practice" name="practice" defaultValue="Équipe de l’établissement">
              {["Loisir", "Équipe de l’établissement", "Club amateur", "Club fédéré"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </F>
        </div>
      </div>
      <div className="fs" hidden={i !== 2}>
        <h3 className="fs-t">Rester informé</h3>
        <p className="muted fs-d">Convocations, calendrier et résultats, sur le canal de votre choix.</p>
        <div className="row2">
          <F name="phone" label="Téléphone / WhatsApp" err={errors.phone}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+221 77 123 45 67" />
          </F>
          <F name="email" label="E-mail" err={errors.email}>
            <input id="email" name="email" type="email" autoComplete="email" />
          </F>
        </div>
        <F name="channels" label={<span className="lbl">Recevoir les informations par</span>} err={errors.channels}>
          <Picks name="channels" options={["WhatsApp", "SMS", "E-mail"]} checked={["WhatsApp"]} />
        </F>
        <div className="field">
          <label className="check">
            <input type="checkbox" name="optIn" defaultChecked />
            <span>J’accepte de recevoir les informations des compétitions ADECAP. Désinscription possible à tout moment.</span>
          </label>
        </div>
        {minor && (
          <div className="minor">
            <F name="guardian" err={errors.guardian}>
              <label className="check">
                <input type="checkbox" name="guardian" />
                <span>Un parent ou tuteur légal autorise cette inscription.</span>
              </label>
            </F>
            <p>Obligatoire pour les moins de 18 ans. ADECAP pourra contacter le parent ou tuteur avant toute compétition.</p>
          </div>
        )}
        <F name="consent" err={errors.consent}>
          <label className="check">
            <input type="checkbox" name="consent" />
            <span>J’accepte que mes données soient utilisées par ADECAP pour l’organisation des compétitions, conformément à la politique de confidentialité.</span>
          </label>
        </F>
      </div>
      <div className="hp" aria-hidden="true">
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && !state.ok && <p className="form-msg" role="alert">{state.message}</p>}
      {state.errors && i === 2 && Object.keys(state.errors).some((k) => !["phone", "email", "channels", "guardian", "consent"].includes(k)) && (
        <p className="form-msg" role="alert">Certaines informations sont incomplètes : revenez aux étapes précédentes pour les corriger.</p>
      )}
      <div className="form-nav">
        {i > 0 && (
          <button className="btn btn-line btn-sm" type="button" onClick={() => setI(i - 1)}>
            ← Précédent
          </button>
        )}
        {i < labels.length - 1 ? (
          <button className="btn btn-ink" type="button" onClick={() => check(i) && setI(i + 1)}>
            Continuer →
          </button>
        ) : (
          <button className="btn btn-gold" type="submit" disabled={pending}>
            {pending ? "Envoi…" : "Créer mon profil"}
          </button>
        )}
      </div>
    </form>
  );
}
