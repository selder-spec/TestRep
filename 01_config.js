// worker.js - المكتبة الرقمية (Digital Library) v7
// Env vars: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, ADMIN_PASSWORD
//
// Data layout in GitHub repo:
//   _admin/{folder}/...                    ← admin books
//   _users/{username}/                     ← user profile + books
//   _users/{username}__profile.json
//   _ratings/{bookId}__ratings.json        ← { votes:{uid:stars}, avg, count }
//   _articles/{articleId}__article.json    ← article data

// ── Cache state (مشترك بين الوحدات) ──────────────────────────────
export let CACHE_INDEX      = null;
export let CACHE_TIME       = 0;
export let CACHE_TREE       = null;
export let CACHE_TREE_TIME  = 0;
export let CACHE_BRANCH     = null; // branch لا يتغير — يُحفظ دائماً

// دوال لتعديل المتغيرات المشتركة من الوحدات الأخرى
export function setCacheIndex(val)     { CACHE_INDEX     = val; }
export function setCacheTime(val)      { CACHE_TIME       = val; }
export function setCacheTree(val)      { CACHE_TREE       = val; }
export function setCacheTreeTime(val)  { CACHE_TREE_TIME  = val; }
export function setCacheBranch(val)    { CACHE_BRANCH     = val; }
export function invalidateCache()      { CACHE_INDEX = null; CACHE_TREE = null; }

// ── TTL ───────────────────────────────────────────────────────────
export const CACHE_TTL      = 1000 * 60 * 5;  // 5 دقائق للهيكل
export const CACHE_TREE_TTL = 1000 * 60 * 2;  // دقيقتان للشجرة

// ── CORS ──────────────────────────────────────────────────────────
export const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Article colors ────────────────────────────────────────────────
export const ARTICLE_COLORS_LIST = [
  '#c49a24','#6d28d9','#0f766e','#b91c1c','#1d4ed8',
  '#be185d','#15803d','#92400e','#1e40af','#7c3aed'
];
