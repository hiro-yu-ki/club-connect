import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Actor, Role } from "./types.ts";

export const id = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${randomBytes(6).toString("hex")}`;
export const now = () => new Date().toISOString();
export const normalizeEmail = (value: string) => value.trim().toLowerCase();
export function hashPassword(password: string) {
  if (password.length < 10) throw Object.assign(new Error("パスワードは10文字以上必要です"), { status: 400 });
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 64), expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const sign = (value: string, secret: string) => `${value}.${createHmac("sha256", secret).update(value).digest("base64url")}`;
export function unsign(value: string, secret: string) {
  const dot = value.lastIndexOf("."); if (dot < 1) return undefined;
  const raw = value.slice(0, dot), expected = Buffer.from(sign(raw, secret)), actual = Buffer.from(value);
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? raw : undefined;
}
export function requireRole(actor: Actor | undefined, roles: Role[]) {
  if (!actor || !actor.roles.some((role) => roles.includes(role))) throw Object.assign(new Error("権限がありません"), { status: 403 });
  return actor;
}
export const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
