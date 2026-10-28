import "server-only";
import { and, asc, count, desc, eq, ilike, lte, or, sql } from "drizzle-orm";
import { db, schema } from "./db";

const { articles, competitions, talents, schools, students } = schema;

const isLive = () => and(eq(articles.status, "PUBLISHED"), lte(articles.publishedAt, new Date()));

/** Les articles programmés passent en ligne automatiquement à leur date. */
export async function publishDue() {
  await db.update(articles).set({ status: "PUBLISHED" }).where(and(eq(articles.status, "SCHEDULED"), lte(articles.publishedAt, new Date())));
}

export async function listNews(opts: { category?: string; q?: string; limit?: number } = {}) {
  await publishDue();
  const conds = [isLive()];
  if (opts.category) conds.push(eq(articles.category, opts.category));
  if (opts.q) {
    const like = `%${opts.q}%`;
    conds.push(
      or(
        ilike(articles.title, like),
        ilike(articles.excerpt, like),
        sql`exists (select 1 from ${talents} t where t.id = ${articles.talentId} and (t.first_name || ' ' || t.last_name || ' ' || t.position || ' ' || t.school || ' ' || t.competition || ' ' || t.goal) ilike ${like})`,
      )!,
    );
  }
  return db.query.articles.findMany({ where: and(...conds), orderBy: desc(articles.publishedAt), limit: opts.limit, with: { talent: true } });
}

export async function newsCategories() {
  const rows = await db.selectDistinct({ c: articles.category }).from(articles).where(isLive());
  const order = ["Talents à suivre"];
  return rows.map((r) => r.c).sort((a, b) => (order.includes(b) ? 1 : 0) - (order.includes(a) ? 1 : 0) || a.localeCompare(b, "fr"));
}

export async function getArticle(slug: string) {
  await publishDue();
  return db.query.articles.findFirst({ where: and(eq(articles.slug, slug), isLive()), with: { talent: true } });
}

/** Talents dont le portrait est publié, du plus récent au plus ancien. */
export async function liveTalents() {
  await publishDue();
  return db.query.articles.findMany({ where: and(isLive(), sql`${articles.talentId} is not null`), orderBy: desc(articles.publishedAt), with: { talent: true } });
}

export async function getTalent(slug: string) {
  const t = await db.query.talents.findFirst({ where: eq(talents.slug, slug), with: { articles: true } });
  if (!t) return null;
  const art = t.articles.find((a) => a.status === "PUBLISHED" && a.publishedAt <= new Date());
  return art ? { talent: t, article: art } : null;
}

export async function listCompetitions() {
  return db.select().from(competitions).orderBy(asc(competitions.year), asc(competitions.sortOrder));
}

export async function getCompetition(slug: string) {
  return db.query.competitions.findFirst({ where: eq(competitions.slug, slug) });
}

export async function registrationCounts() {
  const [[a], [b]] = await Promise.all([db.select({ n: count() }).from(schools), db.select({ n: count() }).from(students)]);
  return { schools: a.n, students: b.n };
}

export async function schoolOptions() {
  return db.select({ id: schools.id, name: schools.name, city: schools.city }).from(schools).orderBy(asc(schools.name));
}
