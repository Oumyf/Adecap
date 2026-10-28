// Schéma de la base PostgreSQL du site ADECAP Entertainment (Drizzle ORM)
import { relations } from "drizzle-orm";
import { boolean, customType, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createId } from "./id";

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });
const id = () => text("id").primaryKey().$defaultFn(createId);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const roleEnum = pgEnum("role", ["ADMIN", "EDITOR", "CONTRIBUTOR"]);
export const contentStatusEnum = pgEnum("content_status", ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]);
export const competitionStatusEnum = pgEnum("competition_status", ["PAST", "ONGOING", "UPCOMING"]);
export const schoolStatusEnum = pgEnum("school_status", ["PENDING", "APPROVED"]);

export type Role = (typeof roleEnum.enumValues)[number];
export type ContentStatus = (typeof contentStatusEnum.enumValues)[number];
export type CompetitionStatus = (typeof competitionStatusEnum.enumValues)[number];

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("CONTRIBUTOR"),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
});

export const images = pgTable("images", {
  id: id(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: createdAt(),
});

export type TalentAttribute = { icon: "run" | "cap" | "target"; title: string; text: string };

export const talents = pgTable("talents", {
  id: id(),
  slug: text("slug").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  number: integer("number"),
  position: text("position").notNull(),
  school: text("school").notNull(),
  competition: text("competition").notNull().default("IFL"),
  goal: text("goal").notNull(),
  hook: text("hook").notNull(),
  slogan: text("slogan").notNull().default("Le talent n’attend pas !"),
  signature: text("signature").notNull().default("Formé aujourd’hui, connecté demain"),
  attributes: jsonb("attributes").$type<TalentAttribute[]>().notNull().default([]),
  photoUrl: text("photo_url").notNull(),
  thumbUrl: text("thumb_url"),
  posterUrl: text("poster_url"),
  createdAt: createdAt(),
});

export const articles = pgTable(
  "articles",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    status: contentStatusEnum("status").notNull().default("DRAFT"),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    author: text("author").notNull().default("Rédaction"),
    coverUrl: text("cover_url"),
    talentId: text("talent_id").references(() => talents.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [index("articles_status_published_idx").on(t.status, t.publishedAt), uniqueIndex("articles_talent_idx").on(t.talentId)],
);

export const competitions = pgTable(
  "competitions",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    family: text("family").notNull(),
    name: text("name").notNull(),
    edition: text("edition").notNull(),
    year: integer("year").notNull(),
    month: text("month"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: competitionStatusEnum("status").notNull(),
    phase: integer("phase").notNull().default(0),
    participants: integer("participants"),
    unit: text("unit").notNull().default("équipes"),
    discipline: text("discipline").notNull().default("Football"),
    venue: text("venue"),
    winner: text("winner"),
    finalists: text("finalists").array().notNull().default([]),
    teams: text("teams").array().notNull().default([]),
    about: text("about").notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [index("competitions_year_idx").on(t.year, t.sortOrder)],
);

export const competitionAlerts = pgTable(
  "competition_alerts",
  {
    id: id(),
    contact: text("contact").notNull(),
    competitionId: text("competition_id").notNull().references(() => competitions.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("alerts_contact_comp_idx").on(t.contact, t.competitionId)],
);

export const schools = pgTable("schools", {
  id: id(),
  number: text("number").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  region: text("region").notNull(),
  city: text("city").notNull(),
  size: text("size").notNull(),
  refName: text("ref_name").notNull(),
  refRole: text("ref_role").notNull(),
  refEmail: text("ref_email").notNull(),
  refPhone: text("ref_phone").notNull(),
  disciplines: text("disciplines").array().notNull().default([]),
  competitions: text("competitions").array().notNull().default([]),
  teams: integer("teams").notNull().default(1),
  note: text("note"),
  status: schoolStatusEnum("status").notNull().default("PENDING"),
  createdAt: createdAt(),
});

export const students = pgTable("students", {
  id: id(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: timestamp("birth_date", { mode: "date" }).notNull(),
  category: text("category").notNull(),
  schoolId: text("school_id").references(() => schools.id, { onDelete: "set null" }),
  schoolOther: text("school_other"),
  level: text("level").notNull(),
  disciplines: text("disciplines").array().notNull().default([]),
  position: text("position"),
  practice: text("practice"),
  phone: text("phone"),
  email: text("email"),
  channels: text("channels").array().notNull().default([]),
  guardianConsent: boolean("guardian_consent").notNull().default(false),
  optIn: boolean("opt_in").notNull().default(false),
  createdAt: createdAt(),
});

export const contactMessages = pgTable("contact_messages", {
  id: id(),
  reference: text("reference").notNull().unique(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  organization: text("organization"),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: createdAt(),
});

export const subscribers = pgTable("subscribers", {
  id: id(),
  email: text("email").notNull().unique(),
  createdAt: createdAt(),
});

export const activityLogs = pgTable("activity_logs", {
  id: id(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  createdAt: createdAt(),
});

export const articlesRelations = relations(articles, ({ one }) => ({ talent: one(talents, { fields: [articles.talentId], references: [talents.id] }) }));
export const talentsRelations = relations(talents, ({ many }) => ({ articles: many(articles) }));
export const studentsRelations = relations(students, ({ one }) => ({ school: one(schools, { fields: [students.schoolId], references: [schools.id] }) }));
export const schoolsRelations = relations(schools, ({ many }) => ({ students: many(students) }));
export const alertsRelations = relations(competitionAlerts, ({ one }) => ({ competition: one(competitions, { fields: [competitionAlerts.competitionId], references: [competitions.id] }) }));

export type Article = typeof articles.$inferSelect;
export type Talent = typeof talents.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Student = typeof students.$inferSelect;
