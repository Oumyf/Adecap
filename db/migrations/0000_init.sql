CREATE TYPE "public"."competition_status" AS ENUM('PAST', 'ONGOING', 'UPCOMING');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'EDITOR', 'CONTRIBUTOR');--> statement-breakpoint
CREATE TYPE "public"."school_status" AS ENUM('PENDING', 'APPROVED');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"excerpt" text NOT NULL,
	"body" text NOT NULL,
	"status" "content_status" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"author" text DEFAULT 'Rédaction' NOT NULL,
	"cover_url" text,
	"talent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "competition_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"contact" text NOT NULL,
	"competition_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"family" text NOT NULL,
	"name" text NOT NULL,
	"edition" text NOT NULL,
	"year" integer NOT NULL,
	"month" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" "competition_status" NOT NULL,
	"phase" integer DEFAULT 0 NOT NULL,
	"participants" integer,
	"unit" text DEFAULT 'équipes' NOT NULL,
	"discipline" text DEFAULT 'Football' NOT NULL,
	"venue" text,
	"winner" text,
	"finalists" text[] DEFAULT '{}' NOT NULL,
	"teams" text[] DEFAULT '{}' NOT NULL,
	"about" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"organization" text,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"handled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contact_messages_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" text PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"region" text NOT NULL,
	"city" text NOT NULL,
	"size" text NOT NULL,
	"ref_name" text NOT NULL,
	"ref_role" text NOT NULL,
	"ref_email" text NOT NULL,
	"ref_phone" text NOT NULL,
	"disciplines" text[] DEFAULT '{}' NOT NULL,
	"competitions" text[] DEFAULT '{}' NOT NULL,
	"teams" integer DEFAULT 1 NOT NULL,
	"note" text,
	"status" "school_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "schools_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"birth_date" timestamp NOT NULL,
	"category" text NOT NULL,
	"school_id" text,
	"school_other" text,
	"level" text NOT NULL,
	"disciplines" text[] DEFAULT '{}' NOT NULL,
	"position" text,
	"practice" text,
	"phone" text,
	"email" text,
	"channels" text[] DEFAULT '{}' NOT NULL,
	"guardian_consent" boolean DEFAULT false NOT NULL,
	"opt_in" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "talents" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"number" integer,
	"position" text NOT NULL,
	"school" text NOT NULL,
	"competition" text DEFAULT 'IFL' NOT NULL,
	"goal" text NOT NULL,
	"hook" text NOT NULL,
	"slogan" text DEFAULT 'Le talent n’attend pas !' NOT NULL,
	"signature" text DEFAULT 'Formé aujourd’hui, connecté demain' NOT NULL,
	"attributes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photo_url" text NOT NULL,
	"thumb_url" text,
	"poster_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "talents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'CONTRIBUTOR' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_talent_id_talents_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_alerts" ADD CONSTRAINT "competition_alerts_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "articles_status_published_idx" ON "articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "articles_talent_idx" ON "articles" USING btree ("talent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "alerts_contact_comp_idx" ON "competition_alerts" USING btree ("contact","competition_id");--> statement-breakpoint
CREATE INDEX "competitions_year_idx" ON "competitions" USING btree ("year","sort_order");