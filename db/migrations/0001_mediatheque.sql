CREATE TABLE "media_albums" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_albums_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_items" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"kind" text DEFAULT 'image' NOT NULL,
	"url" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_album_id_media_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."media_albums"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_items_album_idx" ON "media_items" USING btree ("album_id","sort_order");