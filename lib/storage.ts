import "server-only";
import { randomBytes } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";

/*
 * Stockage des images téléversées depuis l’administration.
 *
 * - Si un stockage cloud compatible S3 est configuré (Cloudflare R2 conseillé), les images y sont envoyées
 *   et le site enregistre leur adresse publique.
 * - Sinon, elles sont gardées dans la base de données et servies par /api/images/<id>.
 *
 * Variables à définir pour le cloud (voir DEPLOIEMENT-O2SWITCH.md) :
 *   S3_ENDPOINT          https://<id de compte>.r2.cloudflarestorage.com
 *   S3_BUCKET            adecap
 *   S3_ACCESS_KEY_ID     clé d’accès
 *   S3_SECRET_ACCESS_KEY clé secrète
 *   S3_PUBLIC_URL        adresse publique du compartiment, ex. https://medias.adecapentertainment.com
 *   S3_REGION            facultatif (« auto » pour R2)
 *   S3_PREFIX            facultatif, dossier racine dans le compartiment
 */

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_SIZE = 5 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

function cfg() {
  const e = process.env;
  if (!e.S3_ENDPOINT || !e.S3_BUCKET || !e.S3_ACCESS_KEY_ID || !e.S3_SECRET_ACCESS_KEY || !e.S3_PUBLIC_URL) return null;
  return {
    bucket: e.S3_BUCKET,
    publicUrl: e.S3_PUBLIC_URL.replace(/\/+$/, ""),
    prefix: (e.S3_PREFIX || "").replace(/^\/+|\/+$/g, ""),
    client: new S3Client({
      endpoint: e.S3_ENDPOINT,
      region: e.S3_REGION || "auto",
      forcePathStyle: e.S3_FORCE_PATH_STYLE === "true",
      credentials: { accessKeyId: e.S3_ACCESS_KEY_ID, secretAccessKey: e.S3_SECRET_ACCESS_KEY },
    }),
  };
}

let cached: ReturnType<typeof cfg> | undefined;
const s3 = () => (cached === undefined ? (cached = cfg()) : cached);

export const storageMode = () => (s3() ? "cloud" : "database");

/** Envoie une image (déjà validée) et renvoie l’URL à enregistrer. */
export async function putImage(data: Buffer, mimeType: string, filename: string, folder = "medias"): Promise<string> {
  const c = s3();
  if (!c) {
    const [img] = await db.insert(schema.images).values({ filename: filename.slice(0, 120), mimeType, size: data.length, data }).returning({ id: schema.images.id });
    return `/api/images/${img.id}`;
  }
  const d = new Date();
  const key = [c.prefix, folder, d.getUTCFullYear(), String(d.getUTCMonth() + 1).padStart(2, "0"), `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${EXT[mimeType] ?? "bin"}`]
    .filter(Boolean)
    .join("/");
  await c.client.send(new PutObjectCommand({ Bucket: c.bucket, Key: key, Body: data, ContentType: mimeType, CacheControl: "public, max-age=31536000, immutable" }));
  return `${c.publicUrl}/${key}`;
}

/** Valide puis envoie un fichier venant d’un formulaire. */
export async function storeUpload(file: File, folder?: string): Promise<{ url: string } | { error: "trop-lourd" | "format" }> {
  if (file.size > MAX_SIZE) return { error: "trop-lourd" };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "format" };
  return { url: await putImage(Buffer.from(await file.arrayBuffer()), file.type, file.name, folder) };
}

/** Supprime une image téléversée (base ou cloud). Sans effet pour les images fixes du site (/images/…). */
export async function removeImage(url: string | null | undefined) {
  if (!url) return;
  if (url.startsWith("/api/images/")) {
    await db.delete(schema.images).where(eq(schema.images.id, url.slice("/api/images/".length)));
    return;
  }
  const c = s3();
  if (c && url.startsWith(c.publicUrl + "/")) {
    await c.client.send(new DeleteObjectCommand({ Bucket: c.bucket, Key: url.slice(c.publicUrl.length + 1) })).catch(() => {});
  }
}
