// ── Utilities — دوال مساعدة عامة ─────────────────────────────────
import { CORS } from './01_config.js';

export function safeRatingKey(id) {
  return String(id).replace(/[\/\\]/g, "__").replace(/[^a-zA-Z0-9._\-]/g, "-");
}

export function sanitize(s) {
  return String(s || "")
    .trim()
    .replace(/[\/\\#%&{}<>*?$!:'"@+`|=\x00-\x1f\s]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function sanitizeVoterId(id) {
  return String(id || "anon")
    .slice(0, 128)
    .replace(/[^a-zA-Z0-9_\-\.@]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "") || "anon";
}

export function b64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

export function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function sha256(message) {
  const msgBuffer  = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
