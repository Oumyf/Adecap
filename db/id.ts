import { randomBytes } from "node:crypto";

/** Identifiant court, triable dans le temps, sûr pour les URL. */
export function createId() {
  return Date.now().toString(36) + randomBytes(8).toString("hex");
}
