"use server";

import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { can, createSession, destroySession, getUser, log, requireUser, type SessionUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { CATEGORIES, EMAIL_RE, slugify } from "@/lib/format";
import type { CompetitionStatus, ContentStatus, Role, TalentAttribute } from "@/db/schema";

export type AdminState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const s = (f: FormData, k: string, max = 400) => String(f.get(k) ?? "").trim().slice(0, max);
const refresh = () => revalidatePath("/", "layout");

async function uniqueSlug(table: typeof schema.articles | typeof schema.talents | typeof schema.competitions, base: string, exceptId?: string) {
  const root = slugify(base) || "contenu";
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${root}-${i + 1}` : root;
    const hit = await db.select({ id: table.id }).from(table).where(exceptId ? and(eq(table.slug, slug), ne(table.id, exceptId)) : eq(table.slug, slug)).limit(1);
    if (!hit.length) return slug;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** Enregistre une image envoyée depuis un formulaire et renvoie son URL publique. */
async function saveImage(f: FormData, key: string): Promise<string | null | "trop-lourd" | "format"> {
  const file = f.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) return "trop-lourd";
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) return "format";
  const [img] = await db
    .insert(schema.images)
    .values({ filename: file.name.slice(0, 120), mimeType: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()) })
    .returning({ id: schema.images.id });
  return `/api/images/${img.id}`;
}

function imgError(r: string | null, label: string) {
  if (r === "trop-lourd") return `${label} : 5 Mo maximum.`;
  if (r === "format") return `${label} : formats acceptés JPG, PNG, WebP ou GIF.`;
  return null;
}

/* ---------------- Connexion ---------------- */
const attempts = new Map<string, { n: number; until: number }>();

export async function login(_: AdminState, f: FormData): Promise<AdminState> {
  const email = s(f, "email", 160).toLowerCase();
  const password = String(f.get("password") ?? "");
  const a = attempts.get(email);
  if (a && a.until > Date.now()) return { message: "Trop de tentatives. Réessayez dans quelques minutes." };
  const u = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  const ok = u && u.active && (await bcrypt.compare(password, u.passwordHash));
  if (!ok) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(email, { n, until: n >= 5 ? Date.now() + 10 * 60_000 : 0 });
    return { message: "E-mail ou mot de passe incorrect." };
  }
  attempts.delete(email);
  await createSession(u.id);
  await log({ id: u.id, name: u.name, email: u.email, role: u.role }, "s’est connecté");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/connexion");
}

/* ---------------- Articles ---------------- */
export async function saveArticle(_: AdminState, f: FormData): Promise<AdminState> {
  const u = await requireUser();
  const id = s(f, "id", 60);
  const title = s(f, "title", 200), excerpt = s(f, "excerpt", 400), body = s(f, "body", 20000);
  const category = CATEGORIES.includes(s(f, "category")) ? s(f, "category") : "Communiqués";
  let status = (["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"].includes(s(f, "status")) ? s(f, "status") : "DRAFT") as ContentStatus;
  if (!can.publish(u.role)) status = "DRAFT";
  const date = s(f, "publishedAt", 30);
  const publishedAt = date ? new Date(date) : new Date();
  const talentId = s(f, "talentId", 60) || null;
  const errors: Record<string, string> = {};
  if (title.length < 4) errors.title = "Le titre doit contenir au moins 4 caractères.";
  if (excerpt.length < 10) errors.excerpt = "Le chapeau doit contenir au moins 10 caractères.";
  if (body.length < 20) errors.body = "Le texte doit contenir au moins 20 caractères.";
  if (isNaN(publishedAt.getTime())) errors.publishedAt = "Date invalide.";
  if (status === "SCHEDULED" && publishedAt <= new Date()) errors.publishedAt = "Pour programmer, choisissez une date future.";
  const cover = await saveImage(f, "cover");
  const ie = imgError(cover, "Image");
  if (ie) errors.cover = ie;
  if (Object.keys(errors).length) return { errors };

  const existing = id ? await db.query.articles.findFirst({ where: eq(schema.articles.id, id) }) : null;
  if (id && !existing) return { message: "Article introuvable." };
  if (existing && !can.publish(u.role) && existing.status !== "DRAFT") return { message: "Seul un éditeur peut modifier un article déjà publié." };
  if (talentId) {
    const taken = await db.query.articles.findFirst({ where: and(eq(schema.articles.talentId, talentId), id ? ne(schema.articles.id, id) : undefined) });
    if (taken) return { errors: { talentId: "Ce talent a déjà un portrait." } };
  }
  const data = {
    title, excerpt, body, category, status, publishedAt, talentId,
    author: s(f, "author", 80) || u.name,
    coverUrl: cover || (f.get("removeCover") ? null : existing?.coverUrl ?? null),
  };
  if (existing) {
    await db.update(schema.articles).set(data).where(eq(schema.articles.id, existing.id));
    await log(u, `a modifié « ${title} »`);
  } else {
    await db.insert(schema.articles).values({ ...data, slug: await uniqueSlug(schema.articles, title) });
    await log(u, `a créé « ${title} » (${status.toLowerCase()})`);
  }
  refresh();
  redirect("/admin/articles?ok=1");
}

export async function setArticleStatus(id: string, status: ContentStatus) {
  const u = await requireUser();
  if (!can.publish(u.role)) return;
  const a = await db.query.articles.findFirst({ where: eq(schema.articles.id, id) });
  if (!a) return;
  await db.update(schema.articles).set({ status, ...(status === "PUBLISHED" && a.publishedAt > new Date() ? { publishedAt: new Date() } : {}) }).where(eq(schema.articles.id, id));
  await log(u, `${status === "PUBLISHED" ? "a publié" : status === "ARCHIVED" ? "a archivé" : "a repassé en brouillon"} « ${a.title} »`);
  refresh();
}

export async function deleteArticle(id: string) {
  const u = await requireUser();
  if (!can.delete(u.role)) return;
  const [a] = await db.delete(schema.articles).where(eq(schema.articles.id, id)).returning();
  if (a) await log(u, `a supprimé « ${a.title} »`);
  refresh();
}

/* ---------------- Talents ---------------- */
export async function saveTalent(_: AdminState, f: FormData): Promise<AdminState> {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const id = s(f, "id", 60);
  const v = {
    firstName: s(f, "firstName", 60), lastName: s(f, "lastName", 60), position: s(f, "position", 80), school: s(f, "school", 80),
    competition: s(f, "competition", 40) || "IFL", goal: s(f, "goal", 80), hook: s(f, "hook", 200), slogan: s(f, "slogan", 120) || "Le talent n’attend pas !",
    signature: s(f, "signature", 120) || "Formé aujourd’hui, connecté demain",
  };
  const num = s(f, "number", 3);
  const attributes: TalentAttribute[] = [0, 1, 2]
    .map((i) => ({ icon: (["run", "cap", "target"].includes(s(f, `a${i}icon`)) ? s(f, `a${i}icon`) : "target") as TalentAttribute["icon"], title: s(f, `a${i}title`, 60), text: s(f, `a${i}text`, 120) }))
    .filter((a) => a.title);
  const errors: Record<string, string> = {};
  if (v.firstName.length < 2) errors.firstName = "Prénom requis.";
  if (v.lastName.length < 2) errors.lastName = "Nom requis.";
  if (!v.position) errors.position = "Poste requis.";
  if (!v.school) errors.school = "Formation requise.";
  if (!v.goal) errors.goal = "Objectif requis.";
  if (v.hook.length < 10) errors.hook = "Accroche requise (10 caractères minimum).";
  const existing = id ? await db.query.talents.findFirst({ where: eq(schema.talents.id, id) }) : null;
  const photo = await saveImage(f, "photo"), thumb = await saveImage(f, "thumb"), poster = await saveImage(f, "poster");
  for (const [r, k, l] of [[photo, "photo", "Photo"], [thumb, "thumb", "Vignette"], [poster, "poster", "Affiche"]] as const) {
    const e = imgError(r, l);
    if (e) errors[k] = e;
  }
  const photoUrl = photo || existing?.photoUrl;
  if (!photoUrl) errors.photo = "Ajoutez une photo verticale du joueur.";
  if (Object.keys(errors).length) return { errors };
  const data = { ...v, number: num ? Math.max(0, Math.min(99, Number(num) || 0)) : null, attributes, photoUrl: photoUrl!, thumbUrl: thumb || existing?.thumbUrl || null, posterUrl: poster || existing?.posterUrl || null };
  let talentId = id;
  if (existing) {
    await db.update(schema.talents).set(data).where(eq(schema.talents.id, id));
    await log(u, `a modifié le talent ${v.firstName} ${v.lastName}`);
  } else {
    const [t] = await db.insert(schema.talents).values({ ...data, slug: await uniqueSlug(schema.talents, `${v.firstName} ${v.lastName}`) }).returning();
    talentId = t.id;
    await log(u, `a ajouté le talent ${v.firstName} ${v.lastName}`);
  }
  refresh();
  // Nouveau talent : on enchaîne sur la rédaction de son portrait.
  if (!existing && f.get("withArticle")) redirect(`/admin/articles/nouveau?talent=${talentId}`);
  redirect("/admin/talents?ok=1");
}

export async function deleteTalent(id: string) {
  const u = await requireUser(["ADMIN"]);
  const [t] = await db.delete(schema.talents).where(eq(schema.talents.id, id)).returning();
  if (t) await log(u, `a supprimé le talent ${t.firstName} ${t.lastName}`);
  refresh();
}

/* ---------------- Compétitions ---------------- */
const lines = (v: string) => v.split(/\n|;/).map((x) => x.trim()).filter(Boolean).slice(0, 80);

export async function saveCompetition(_: AdminState, f: FormData): Promise<AdminState> {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const id = s(f, "id", 60);
  const status = (["PAST", "ONGOING", "UPCOMING"].includes(s(f, "status")) ? s(f, "status") : "UPCOMING") as CompetitionStatus;
  const year = Number(s(f, "year", 4));
  const participants = s(f, "participants", 4);
  const v = {
    family: s(f, "family", 40), name: s(f, "name", 80), edition: s(f, "edition", 60), year, month: s(f, "month", 20) || null, status,
    phase: Math.max(0, Math.min(3, Number(s(f, "phase", 1)) || 0)), participants: participants ? Number(participants) || null : null, unit: s(f, "unit", 60) || "équipes",
    discipline: s(f, "discipline", 60) || "Football", venue: s(f, "venue", 120) || null, winner: s(f, "winner", 80) || null, about: s(f, "about", 1000),
    finalists: lines(s(f, "finalists", 300)).slice(0, 2), teams: lines(s(f, "teams", 4000)), sortOrder: Number(s(f, "sortOrder", 3)) || 0,
  };
  const errors: Record<string, string> = {};
  if (!v.name) errors.name = "Nom requis.";
  if (!v.family) errors.family = "Famille requise (ex. IFL, ASL).";
  if (!v.edition) errors.edition = "Édition requise.";
  if (!(year >= 2000 && year <= 2100)) errors.year = "Année invalide.";
  if (v.about.length < 5) errors.about = "Ajoutez une courte description.";
  if (Object.keys(errors).length) return { errors };
  if (id) {
    await db.update(schema.competitions).set(v).where(eq(schema.competitions.id, id));
    await log(u, `a modifié la compétition ${v.name} ${v.edition}`);
  } else {
    await db.insert(schema.competitions).values({ ...v, slug: await uniqueSlug(schema.competitions, `${v.name} ${year}`) });
    await log(u, `a ajouté la compétition ${v.name} ${v.edition}`);
  }
  refresh();
  redirect("/admin/competitions?ok=1");
}

/** Mise à jour rapide depuis la liste : statut, avancement, vainqueur. */
export async function quickCompetition(f: FormData) {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const id = s(f, "id", 60);
  const c = await db.query.competitions.findFirst({ where: eq(schema.competitions.id, id) });
  if (!c) return;
  const status = (["PAST", "ONGOING", "UPCOMING"].includes(s(f, "status")) ? s(f, "status") : c.status) as CompetitionStatus;
  const phase = Math.max(0, Math.min(3, Number(s(f, "phase", 1) || c.phase)));
  const winner = f.has("winner") ? s(f, "winner", 80).toUpperCase() || null : c.winner;
  await db.update(schema.competitions).set({ status, phase, winner }).where(eq(schema.competitions.id, id));
  await log(u, `a mis à jour ${c.name} ${c.edition} (${status === "PAST" ? "vainqueur : " + (winner || "à déterminer") : status === "ONGOING" ? ["lancement", "en compétition", "finale", "champion"][phase] : "à venir"})`);
  refresh();
}

export async function deleteCompetition(id: string) {
  const u = await requireUser(["ADMIN"]);
  const [c] = await db.delete(schema.competitions).where(eq(schema.competitions.id, id)).returning();
  if (c) await log(u, `a supprimé la compétition ${c.name} ${c.edition}`);
  refresh();
}

/* ---------------- Inscriptions, messages, abonnés ---------------- */
export async function approveSchool(id: string) {
  const u = await requireUser(["ADMIN", "EDITOR"]);
  const [sc] = await db.update(schema.schools).set({ status: "APPROVED" }).where(eq(schema.schools.id, id)).returning();
  if (sc) await log(u, `a validé l’établissement ${sc.name}`);
  refresh();
}

export async function deleteSchool(id: string) {
  const u = await requireUser(["ADMIN"]);
  const [sc] = await db.delete(schema.schools).where(eq(schema.schools.id, id)).returning();
  if (sc) await log(u, `a supprimé l’établissement ${sc.name}`);
  refresh();
}

export async function deleteStudent(id: string) {
  const u = await requireUser(["ADMIN"]);
  const [st] = await db.delete(schema.students).where(eq(schema.students.id, id)).returning();
  if (st) await log(u, `a supprimé le profil ${st.firstName} ${st.lastName}`);
  refresh();
}

export async function toggleMessage(id: string) {
  const u = await requireUser();
  const m = await db.query.contactMessages.findFirst({ where: eq(schema.contactMessages.id, id) });
  if (!m) return;
  await db.update(schema.contactMessages).set({ handled: !m.handled }).where(eq(schema.contactMessages.id, id));
  await log(u, `a marqué la demande ${m.reference} comme ${m.handled ? "à traiter" : "traitée"}`);
  refresh();
}

export async function deleteMessage(id: string) {
  const u = await requireUser(["ADMIN"]);
  const [m] = await db.delete(schema.contactMessages).where(eq(schema.contactMessages.id, id)).returning();
  if (m) await log(u, `a supprimé la demande ${m.reference}`);
  refresh();
}

/* ---------------- Utilisateurs ---------------- */
export async function createUserAction(_: AdminState, f: FormData): Promise<AdminState> {
  const u = await requireUser(["ADMIN"]);
  const email = s(f, "email", 160).toLowerCase(), name = s(f, "name", 80), password = String(f.get("password") ?? "");
  const role = (["ADMIN", "EDITOR", "CONTRIBUTOR"].includes(s(f, "role")) ? s(f, "role") : "CONTRIBUTOR") as Role;
  const errors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) errors.email = "E-mail invalide.";
  if (name.length < 2) errors.name = "Nom requis.";
  if (password.length < 10) errors.password = "10 caractères minimum.";
  if (await db.query.users.findFirst({ where: eq(schema.users.email, email) })) errors.email = "Un compte existe déjà avec cet e-mail.";
  if (Object.keys(errors).length) return { errors };
  await db.insert(schema.users).values({ email, name, role, passwordHash: await bcrypt.hash(password, 12) });
  await log(u, `a créé le compte de ${name} (${role.toLowerCase()})`);
  refresh();
  return { ok: true, message: `Compte créé pour ${name}. Transmettez-lui son mot de passe de façon sécurisée.` };
}

export async function updateUserAction(f: FormData) {
  const u = await requireUser(["ADMIN"]);
  const id = s(f, "id", 60);
  if (id === u.id) return; // on ne modifie pas son propre rôle ici
  const role = (["ADMIN", "EDITOR", "CONTRIBUTOR"].includes(s(f, "role")) ? s(f, "role") : undefined) as Role | undefined;
  const active = f.get("active") === "on";
  const [t] = await db.update(schema.users).set({ ...(role ? { role } : {}), active }).where(eq(schema.users.id, id)).returning();
  if (t) await log(u, `a mis à jour le compte de ${t.name} (${t.role.toLowerCase()}, ${t.active ? "actif" : "désactivé"})`);
  refresh();
}

export async function changePassword(_: AdminState, f: FormData): Promise<AdminState> {
  const me = (await getUser()) as SessionUser | null;
  if (!me) redirect("/admin/connexion");
  const cur = String(f.get("current") ?? ""), next = String(f.get("next") ?? "");
  const u = await db.query.users.findFirst({ where: eq(schema.users.id, me.id) });
  if (!u || !(await bcrypt.compare(cur, u.passwordHash))) return { errors: { current: "Mot de passe actuel incorrect." } };
  if (next.length < 10) return { errors: { next: "10 caractères minimum." } };
  await db.update(schema.users).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(schema.users.id, me.id));
  await log(me, "a changé son mot de passe");
  return { ok: true, message: "Mot de passe mis à jour." };
}
