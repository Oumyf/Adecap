"use server";

import { headers } from "next/headers";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { log } from "@/lib/auth";
import { ageOf, EMAIL_RE, PHONE_RE } from "@/lib/format";
import { REGIONS } from "@/lib/site";

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string>; data?: Record<string, string> };

// Limite anti-abus : 30 envois par formulaire, par adresse IP et par 10 minutes
// (assez large pour une classe entière inscrite depuis le même Wi-Fi).
const hits = new Map<string, number[]>();
async function tooMany(kind: string) {
  const h = await headers();
  const key = kind + ":" + ((h.get("x-forwarded-for") || "").split(",")[0].trim() || "local");
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 30;
}

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const list = (f: FormData, k: string) => f.getAll(k).map((v) => String(v).trim().slice(0, 80)).filter(Boolean).slice(0, 12);

export async function sendContact(_: FormState, f: FormData): Promise<FormState> {
  if (str(f, "website")) return { ok: true, message: "ADC-0000" }; // pot de miel
  if (await tooMany("contact")) return { ok: false, message: "Trop d’envois depuis votre connexion. Réessayez dans quelques minutes." };
  const type = ["Contact", "Partenariat", "Presse", "Bénévolat"].includes(str(f, "type")) ? str(f, "type") : "Contact";
  const name = str(f, "name", 120), email = str(f, "email", 160), message = str(f, "message", 4000);
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Indiquez votre nom.";
  if (!EMAIL_RE.test(email)) errors.email = "Saisissez une adresse e-mail valide, par exemple nom@domaine.sn.";
  if (message.length < 10) errors.message = "Votre message doit contenir au moins 10 caractères.";
  if (!f.get("consent")) errors.consent = "Cochez cette case pour que nous puissions traiter votre demande.";
  if (Object.keys(errors).length) return { ok: false, errors };
  const [{ n }] = await db.select({ n: count() }).from(schema.contactMessages);
  const reference = `ADC-${new Date().getFullYear()}-${String(n + 1).padStart(4, "0")}`;
  await db.insert(schema.contactMessages).values({ reference, type, name, email, organization: str(f, "organization", 160) || null, phone: str(f, "phone", 40) || null, message });
  await log(null, `demande « ${type} » reçue (${reference})`);
  return { ok: true, message: reference };
}

export async function subscribe(_: FormState, f: FormData): Promise<FormState> {
  const email = str(f, "email", 160).toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Saisissez une adresse e-mail valide." };
  if (await tooMany("subscribe")) return { ok: false, message: "Trop d’envois. Réessayez plus tard." };
  await db.insert(schema.subscribers).values({ email }).onConflictDoNothing();
  return { ok: true, message: "Inscription enregistrée. Vous recevrez le prochain agenda." };
}

export async function createAlert(_: FormState, f: FormData): Promise<FormState> {
  const contact = str(f, "contact", 160);
  const competitionId = str(f, "competitionId", 60);
  if (!EMAIL_RE.test(contact) && !PHONE_RE.test(contact)) return { ok: false, message: "Indiquez un e-mail ou un numéro WhatsApp valide." };
  if (await tooMany("alert")) return { ok: false, message: "Trop d’envois. Réessayez plus tard." };
  const comp = await db.query.competitions.findFirst({ where: eq(schema.competitions.id, competitionId) });
  if (!comp) return { ok: false, message: "Compétition introuvable." };
  await db.insert(schema.competitionAlerts).values({ contact, competitionId }).onConflictDoNothing();
  return { ok: true, message: `C’est noté : nous vous préviendrons pour « ${comp.name} ».` };
}

export async function registerSchool(_: FormState, f: FormData): Promise<FormState> {
  if (str(f, "website")) return { ok: true, message: "ADC-ET-0000" };
  if (await tooMany("school")) return { ok: false, message: "Trop d’envois depuis votre connexion. Réessayez dans quelques minutes." };
  const v = {
    name: str(f, "name", 160), type: str(f, "type", 60), region: str(f, "region", 60), city: str(f, "city", 80), size: str(f, "size", 40),
    refName: str(f, "refName", 120), refRole: str(f, "refRole", 80), refEmail: str(f, "refEmail", 160), refPhone: str(f, "refPhone", 40), note: str(f, "note", 1500),
  };
  const disciplines = list(f, "disciplines"), competitions = list(f, "competitions");
  const teams = Math.max(1, Math.min(10, Number(f.get("teams")) || 1));
  const errors: Record<string, string> = {};
  if (v.name.length < 3) errors.name = "Indiquez le nom de l’établissement.";
  if (!REGIONS.includes(v.region)) errors.region = "Choisissez une région.";
  if (v.city.length < 2) errors.city = "Indiquez la commune.";
  if (v.refName.length < 3) errors.refName = "Indiquez le nom du référent.";
  if (!EMAIL_RE.test(v.refEmail)) errors.refEmail = "Saisissez une adresse e-mail valide.";
  if (!PHONE_RE.test(v.refPhone)) errors.refPhone = "Saisissez un numéro valide, par exemple +221 77 123 45 67.";
  if (!disciplines.length) errors.disciplines = "Choisissez au moins une discipline.";
  if (!f.get("certify")) errors.certify = "Cochez cette case pour confirmer.";
  if (!f.get("consent")) errors.consent = "Cochez cette case pour que nous puissions traiter l’inscription.";
  if (Object.keys(errors).length) return { ok: false, errors };
  const [{ n }] = await db.select({ n: count() }).from(schema.schools);
  const number = `ADC-ET-${String(n + 1).padStart(4, "0")}`;
  await db.insert(schema.schools).values({ ...v, note: v.note || null, number, disciplines, competitions, teams });
  await log(null, `établissement inscrit : ${v.name} (${number})`);
  return { ok: true, message: number, data: { name: v.name } };
}

export async function registerStudent(_: FormState, f: FormData): Promise<FormState> {
  if (str(f, "website")) return { ok: true };
  if (await tooMany("student")) return { ok: false, message: "Trop d’envois depuis votre connexion. Réessayez dans quelques minutes." };
  const firstName = str(f, "firstName", 80), lastName = str(f, "lastName", 80), dob = str(f, "birthDate", 20);
  const schoolId = str(f, "schoolId", 60), schoolOther = str(f, "schoolOther", 160), level = str(f, "level", 60);
  const phone = str(f, "phone", 40), email = str(f, "email", 160).toLowerCase();
  const disciplines = list(f, "disciplines"), channels = list(f, "channels").filter((c) => ["WhatsApp", "SMS", "E-mail"].includes(c));
  const birth = new Date(dob + "T00:00:00Z");
  const age = isNaN(birth.getTime()) ? -1 : ageOf(birth);
  const errors: Record<string, string> = {};
  if (firstName.length < 2) errors.firstName = "Indiquez votre prénom.";
  if (lastName.length < 2) errors.lastName = "Indiquez votre nom.";
  if (age < 12 || age > 35) errors.birthDate = "Indiquez une date de naissance valide (entre 12 et 35 ans).";
  if (!schoolId) errors.schoolId = "Choisissez votre établissement.";
  if (schoolId === "autre" && schoolOther.length < 3) errors.schoolOther = "Indiquez le nom de votre établissement.";
  if (!level) errors.level = "Choisissez votre niveau.";
  if (!disciplines.length) errors.disciplines = "Choisissez au moins une discipline.";
  if (phone && !PHONE_RE.test(phone)) errors.phone = "Saisissez un numéro valide, par exemple +221 77 123 45 67.";
  else if (!phone && (channels.includes("WhatsApp") || channels.includes("SMS"))) errors.phone = "WhatsApp et SMS nécessitent un numéro de téléphone.";
  if (email && !EMAIL_RE.test(email)) errors.email = "Saisissez une adresse e-mail valide.";
  else if (!email && channels.includes("E-mail")) errors.email = "Indiquez une adresse e-mail pour recevoir les informations par e-mail.";
  if (!channels.length) errors.channels = "Choisissez au moins un canal.";
  if (age >= 0 && age < 18 && !f.get("guardian")) errors.guardian = "L’autorisation d’un parent ou tuteur est obligatoire avant 18 ans.";
  if (!f.get("consent")) errors.consent = "Cochez cette case pour valider votre inscription.";
  if (Object.keys(errors).length) return { ok: false, errors };
  let sid: string | null = null;
  if (schoolId && schoolId !== "autre") {
    const s = await db.query.schools.findFirst({ where: eq(schema.schools.id, schoolId) });
    sid = s?.id ?? null;
  }
  await db.insert(schema.students).values({
    firstName, lastName, birthDate: birth, category: str(f, "category", 20) === "Féminin" ? "Féminin" : "Masculin", schoolId: sid, schoolOther: sid ? null : schoolOther || null,
    level, disciplines, position: str(f, "position", 80) || null, practice: str(f, "practice", 60) || null, phone: phone || null, email: email || null, channels,
    guardianConsent: !!f.get("guardian"), optIn: !!f.get("optIn"),
  });
  await log(null, `profil étudiant créé : ${firstName} ${lastName}`);
  return { ok: true, data: { name: `${firstName} ${lastName}`, channels: channels.join(", ") } };
}
