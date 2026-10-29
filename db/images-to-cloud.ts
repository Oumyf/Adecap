// Transfère vers le stockage cloud (S3 / Cloudflare R2) les images encore gardées dans la base de données,
// puis met à jour les adresses dans les articles, les talents et la médiathèque.
// À lancer une fois, après avoir défini les variables S3_* : npm run db:images-to-cloud
import { randomBytes } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as s from "./schema";

const e = process.env;
for (const k of ["DATABASE_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_URL"]) {
  if (!e[k]) {
    console.error(`Variable manquante : ${k}`);
    process.exit(1);
  }
}
const url = e.DATABASE_URL!;
const ssl = e.DATABASE_SSL === "true" || /sslmode=require|\.render\.com/.test(url);
const pool = new pg.Pool({ connectionString: url, ssl: ssl ? { rejectUnauthorized: false } : false });
const db = drizzle(pool, { schema: s });
const client = new S3Client({
  endpoint: e.S3_ENDPOINT,
  region: e.S3_REGION || "auto",
  forcePathStyle: e.S3_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: e.S3_ACCESS_KEY_ID!, secretAccessKey: e.S3_SECRET_ACCESS_KEY! },
});
const publicUrl = e.S3_PUBLIC_URL!.replace(/\/+$/, "");
const prefix = (e.S3_PREFIX || "").replace(/^\/+|\/+$/g, "");
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

async function main() {
  const ids = await db.select({ id: s.images.id }).from(s.images);
  console.log(`${ids.length} image(s) à transférer.`);
  let done = 0;
  for (const { id } of ids) {
    const img = await db.query.images.findFirst({ where: eq(s.images.id, id) });
    if (!img) continue;
    const key = [prefix, "medias", "import", `${id}-${randomBytes(4).toString("hex")}.${EXT[img.mimeType] ?? "bin"}`].filter(Boolean).join("/");
    await client.send(new PutObjectCommand({ Bucket: e.S3_BUCKET, Key: key, Body: img.data, ContentType: img.mimeType, CacheControl: "public, max-age=31536000, immutable" }));
    const oldUrl = `/api/images/${id}`, newUrl = `${publicUrl}/${key}`;
    await db.transaction(async (tx) => {
      await tx.update(s.articles).set({ coverUrl: newUrl }).where(eq(s.articles.coverUrl, oldUrl));
      await tx.update(s.talents).set({ photoUrl: newUrl }).where(eq(s.talents.photoUrl, oldUrl));
      await tx.update(s.talents).set({ thumbUrl: newUrl }).where(eq(s.talents.thumbUrl, oldUrl));
      await tx.update(s.talents).set({ posterUrl: newUrl }).where(eq(s.talents.posterUrl, oldUrl));
      await tx.update(s.mediaItems).set({ url: newUrl }).where(eq(s.mediaItems.url, oldUrl));
      await tx.delete(s.images).where(eq(s.images.id, id));
    });
    done++;
    console.log(`  ${done}/${ids.length} ${img.filename} → ${newUrl}`);
  }
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(s.images);
  console.log(`Terminé : ${done} image(s) transférée(s), ${n} restante(s) en base.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
