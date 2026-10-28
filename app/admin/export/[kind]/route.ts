import { asc, desc } from "drizzle-orm";
import { getUser, log } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { fmtDate } from "@/lib/format";

// Export CSV (séparateur « ; », compatible Excel) des inscriptions, demandes et abonnés.
function csv(rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // évite l’injection de formules
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
}

export async function GET(_: Request, ctx: { params: Promise<{ kind: string }> }) {
  const u = await getUser();
  if (!u || u.role === "CONTRIBUTOR") return new Response("Accès refusé", { status: 403 });
  const { kind } = await ctx.params;
  let rows: (string | number | null)[][] = [];
  if (kind === "etablissements") {
    const list = await db.select().from(schema.schools).orderBy(asc(schema.schools.number));
    rows = [["N°", "Établissement", "Type", "Région", "Commune", "Effectif", "Référent", "Fonction", "E-mail", "Téléphone", "Disciplines", "Compétitions", "Équipes", "Statut", "Date"]];
    for (const x of list) rows.push([x.number, x.name, x.type, x.region, x.city, x.size, x.refName, x.refRole, x.refEmail, x.refPhone, x.disciplines.join(", "), x.competitions.join(", "), x.teams, x.status === "APPROVED" ? "Validé" : "En attente", fmtDate(x.createdAt)]);
  } else if (kind === "etudiants") {
    const list = await db.query.students.findMany({ with: { school: true }, orderBy: desc(schema.students.createdAt) });
    rows = [["Prénom", "Nom", "Naissance", "Catégorie", "Établissement", "Niveau", "Disciplines", "Poste", "Téléphone", "E-mail", "Canaux", "Autorisation parentale", "Accepte les infos", "Date"]];
    for (const x of list) rows.push([x.firstName, x.lastName, fmtDate(x.birthDate), x.category, x.school?.name ?? x.schoolOther ?? "", x.level, x.disciplines.join(", "), x.position, x.phone, x.email, x.channels.join(", "), x.guardianConsent ? "Oui" : "", x.optIn ? "Oui" : "Non", fmtDate(x.createdAt)]);
  } else if (kind === "demandes") {
    const list = await db.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt));
    rows = [["Référence", "Objet", "Nom", "Organisation", "E-mail", "Téléphone", "Message", "Traitée", "Date"]];
    for (const x of list) rows.push([x.reference, x.type, x.name, x.organization, x.email, x.phone, x.message, x.handled ? "Oui" : "Non", fmtDate(x.createdAt)]);
  } else if (kind === "abonnes") {
    const subs = await db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
    const alerts = await db.query.competitionAlerts.findMany({ with: { competition: true } });
    rows = [["Contact", "Type", "Compétition", "Date"]];
    for (const x of subs) rows.push([x.email, "Agenda", "", fmtDate(x.createdAt)]);
    for (const x of alerts) rows.push([x.contact, "Alerte compétition", `${x.competition.name} ${x.competition.edition}`, fmtDate(x.createdAt)]);
  } else return new Response("Introuvable", { status: 404 });

  await log(u, `a exporté : ${kind}`);
  return new Response(csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="adecap-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
