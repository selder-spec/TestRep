// ── Data Logic — Articles, Index, Ratings, Auth ───────────────────
import {
  CACHE_INDEX, CACHE_TIME, CACHE_TTL,
  setCacheIndex, setCacheTime,
} from './01_config.js';
import { safeRatingKey, sanitize, b64, sha256 } from './02_utils.js';
import {
  apiBase, ghH, ghGetRaw, ghGetWithSHA, ghPutWithSHA, getRepoTree,
} from './03_github_helpers.js';

// ── Articles ──────────────────────────────────────────────────────
export async function getArticles(env) {
  const treeData = await getRepoTree(env);
  if (!treeData) return [];
  const { tree } = treeData;

  const rawBase      = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/HEAD`;
  const articleFiles = tree.filter(i =>
    i.type === "blob" &&
    i.path.startsWith("_articles/") &&
    i.path.endsWith("__article.json")
  );

  const articles = await Promise.all(
    articleFiles.map(item =>
      fetch(`${rawBase}/${encodeURIComponent(item.path)}`, { headers: { "User-Agent": "GLW/6" } })
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    )
  );

  const validArticles = articles.filter(Boolean);

  if (validArticles.length > 0) {
    await Promise.allSettled(
      validArticles.map(art => {
        const rpath = `_ratings/article_${art.id}__ratings.json`;
        const rurl  = `${apiBase(env)}/contents/${encodeURIComponent(rpath)}`;
        return fetch(rurl, { headers: ghH(env) })
          .then(r => r.ok ? r.json() : null)
          .then(resp => {
            if (!resp || !resp.content) return;
            const data = JSON.parse(atob(resp.content.replace(/\n/g, "")));
            if (data) { art.rating = data.avg || 0; art.ratingCount = data.count || 0; }
          })
          .catch(() => {});
      })
    );
  }

  return validArticles.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getArticle(env, articleId) {
  const raw = await ghGetRaw(env, `_articles/${articleId}__article.json`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Index builder ─────────────────────────────────────────────────
export async function getIndex(env) {
  if (CACHE_INDEX && Date.now() - CACHE_TIME < CACHE_TTL) {
    try {
      const ratingIds  = CACHE_INDEX.allBooks.map(b => b.id);
      const ratingsMap = await getRatings(env, ratingIds);
      for (const book of CACHE_INDEX.allBooks) {
        const r = ratingsMap[book.id];
        if (r) { book.rating = r.avg; book.ratingCount = r.count; }
        else   { book.rating = 0;     book.ratingCount = 0; }
      }
    } catch (_) {}
    return CACHE_INDEX;
  }

  const treeData = await getRepoTree(env);
  if (!treeData) throw new Error("فشل جلب شجرة الملفات");
  const { tree } = treeData;

  const rawBase = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/HEAD`;

  const manifest = {
    adminFolders: {},
    users: {},
    allBooks: [],
    stats: { totalBooks: 0, totalFolders: 0, totalUsers: 0 },
  };

  for (const item of tree) {
    if (item.type !== "blob") continue;
    const parts = item.path.split("/");
    if (parts.length < 2) continue;
    const root = parts[0];

    if (root === "_admin" && parts.length >= 3) {
      const folder   = parts[1];
      const filename = parts.slice(2).join("/");
      if (!manifest.adminFolders[folder]) {
        manifest.adminFolders[folder] = { name: folder, books: [], cover: null };
        manifest.stats.totalFolders++;
      }
      const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "";
      if (extMatch && !["json","gitkeep","md"].includes(ext) &&
          !filename.endsWith("__meta.json") && !filename.endsWith(".gitkeep") &&
          !filename.match(/__cover\.(jpg|jpeg|png|webp)$/) && !filename.match(/__media_\d+_/)) {
        const itemName = filename.replace(/\.[^.]+$/, "");
        const book = {
          id: item.path, name: itemName,
          path: item.path, desc: "", author: "", year: "",
          cover: null, size: item.size || 0, fileExt: ext,
          namespace: "admin", folder, owner: "__admin__",
          rating: 0, ratingCount: 0,
        };
        manifest.adminFolders[folder].books.push(book);
        manifest.allBooks.push(book);
        manifest.stats.totalBooks++;
      }
    }

    if (root === "_users" && parts.length >= 2) {
      if (parts.length === 2 && parts[1].endsWith("__profile.json")) {
        const uname = parts[1].replace("__profile.json", "");
        if (!manifest.users[uname]) {
          manifest.users[uname] = { displayName: uname, folders: {}, books: [] };
          manifest.stats.totalUsers++;
        }
        continue;
      }
      if (parts.length >= 4) {
        const uname    = parts[1];
        const folder   = parts[2];
        const filename = parts.slice(3).join("/");
        if (!manifest.users[uname]) {
          manifest.users[uname] = { displayName: uname, folders: {}, books: [] };
          manifest.stats.totalUsers++;
        }
        if (!manifest.users[uname].folders[folder]) {
          manifest.users[uname].folders[folder] = { name: folder, books: [], cover: null };
          manifest.stats.totalFolders++;
        }
        const extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : "";
        if (extMatch && !["json","gitkeep","md"].includes(ext) &&
            !filename.endsWith("__meta.json") && !filename.endsWith(".gitkeep") &&
            !filename.match(/__cover\.(jpg|jpeg|png|webp)$/) && !filename.match(/__media_\d+_/)) {
          const itemName = filename.replace(/\.[^.]+$/, "");
          const book = {
            id: item.path, name: itemName,
            path: item.path, desc: "", author: "", year: "",
            cover: null, size: item.size || 0, fileExt: ext,
            namespace: "user", folder, owner: uname,
            rating: 0, ratingCount: 0,
          };
          manifest.users[uname].folders[folder].books.push(book);
          manifest.users[uname].books.push(book);
          manifest.allBooks.push(book);
          manifest.stats.totalBooks++;
        }
      }
    }
  }

  const fetches = [];
  for (const item of tree) {
    if (item.type !== "blob") continue;
    const parts = item.path.split("/");
    const root  = parts[0];

    if (root === "_admin" && parts.length >= 3) {
      const folder   = parts[1];
      const filename = parts.slice(2).join("/");
      _enrichItem(env, rawBase, item, manifest.adminFolders[folder], filename, fetches);
    }
    if (root === "_users" && parts.length >= 4) {
      const uname    = parts[1];
      const folder   = parts[2];
      const filename = parts.slice(3).join("/");
      const uf = manifest.users[uname]?.folders[folder];
      if (uf) _enrichItem(env, rawBase, item, uf, filename, fetches);
    }
    if (root === "_users" && parts.length === 2 && parts[1].endsWith("__profile.json")) {
      const uname = parts[1].replace("__profile.json", "");
      fetches.push(
        fetch(`${rawBase}/${encodeURIComponent(item.path)}`, { headers: { "User-Agent": "GLW/6" } })
          .then(r => r.ok ? r.json() : null)
          .then(p => { if (p && manifest.users[uname]) manifest.users[uname].displayName = p.displayName || uname; })
          .catch(() => {})
      );
    }
  }

  await Promise.allSettled(fetches);

  try {
    const ratingIds  = manifest.allBooks.map(b => b.id);
    const ratingsMap = await getRatings(env, ratingIds);
    for (const book of manifest.allBooks) {
      const r = ratingsMap[book.id];
      if (r) { book.rating = r.avg; book.ratingCount = r.count; }
    }
  } catch (_) {}

  function weightedScore(b) { return (b.rating || 0) * Math.log((b.ratingCount || 0) + 1); }

  manifest.allBooks.sort((a, b) => {
    const d = weightedScore(b) - weightedScore(a);
    if (Math.abs(d) > 0.001) return d;
    if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
    if (b.ratingCount !== a.ratingCount) return (b.ratingCount || 0) - (a.ratingCount || 0);
    return a.name.localeCompare(b.name, "ar");
  });

  for (const f of Object.values(manifest.adminFolders))
    f.books.sort((a, b) => {
      const d = weightedScore(b) - weightedScore(a);
      return Math.abs(d) > 0.001 ? d : a.name.localeCompare(b.name, "ar");
    });
  for (const u of Object.values(manifest.users))
    for (const f of Object.values(u.folders))
      f.books.sort((a, b) => {
        const d = weightedScore(b) - weightedScore(a);
        return Math.abs(d) > 0.001 ? d : a.name.localeCompare(b.name, "ar");
      });

  setCacheIndex(manifest);
  setCacheTime(Date.now());
  return manifest;
}

function _enrichItem(env, rawBase, item, folderObj, filename, fetches) {
  if (filename.toLowerCase().endsWith("__meta.json")) {
    fetches.push(
      fetch(`${rawBase}/${encodeURIComponent(item.path)}`, { headers: { "User-Agent": "GLW/6" } })
        .then(r => r.ok ? r.json() : null)
        .then(meta => {
          if (!meta || !folderObj) return;
          const b = folderObj.books.find(x => x.name === meta.name);
          if (b) {
            b.desc    = meta.desc    || "";
            b.author  = meta.author  || "";
            b.year    = meta.year    || "";
            b.fileExt = meta.fileExt || b.fileExt || "bin";
            if (meta.mediaFiles) b.mediaFiles = meta.mediaFiles;
          }
        })
        .catch(() => {})
    );
  } else if (filename.toLowerCase().match(/__cover\.(jpg|jpeg|png|webp)$/)) {
    const baseName = filename.split("/").pop().replace(/__cover\.(jpg|jpeg|png|webp)$/i, "");
    const b = folderObj?.books.find(x => x.name.toLowerCase() === baseName.toLowerCase());
    if (b) b.cover = item.path;
  } else if (filename.toLowerCase().match(/^cover\.(jpg|jpeg|png|webp)$/)) {
    if (folderObj) folderObj.cover = item.path;
  }
}

// ── Rating system ─────────────────────────────────────────────────
export async function rateItem(env, path, stars, voterId) {
  const { text: rawText, sha } = await ghGetWithSHA(env, path);
  let data;
  try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }
  if (!data || typeof data.votes !== "object") data = { votes: {}, avg: 0, count: 0 };

  if (stars === 0) {
    delete data.votes[voterId];
  } else {
    data.votes[voterId] = stars;
  }

  const vals = Object.values(data.votes).filter(v => v >= 1 && v <= 5);
  data.avg   = vals.length > 0
    ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10
    : 0;
  data.count = vals.length;

  await ghPutWithSHA(env, path, b64(JSON.stringify(data)), `rate: ${path}`, sha);
  return { ok: true, avg: data.avg, count: data.count, userVote: stars };
}

export async function getRatings(env, bookIds) {
  if (!bookIds.length) return {};
  const results  = {};
  const keyToId  = {};
  for (const id of bookIds) keyToId[safeRatingKey(id)] = id;

  try {
    const treeData = await getRepoTree(env);
    if (!treeData) return results;
    const { tree } = treeData;

    const ratingFiles = tree.filter(
      i => i.type === "blob" &&
           i.path.startsWith("_ratings/") &&
           i.path.endsWith("__ratings.json") &&
           !i.path.includes("article_")
    );

    const needed = ratingFiles.filter(file => {
      const key = file.path.replace("_ratings/", "").replace("__ratings.json", "");
      return !!keyToId[key];
    });

    await Promise.allSettled(
      needed.map(file => {
        const key    = file.path.replace("_ratings/", "").replace("__ratings.json", "");
        const bookId = keyToId[key];
        const url    = `${apiBase(env)}/contents/${encodeURIComponent(file.path)}`;
        return fetch(url, { headers: ghH(env) })
          .then(r => r.ok ? r.json() : null)
          .then(resp => {
            if (!resp || !resp.content) return;
            const data = JSON.parse(atob(resp.content.replace(/\n/g, "")));
            if (data && typeof data.avg === "number")
              results[bookId] = { avg: data.avg || 0, count: data.count || 0 };
          })
          .catch(() => {});
      })
    );
  } catch (_) {}

  return results;
}

// ── Auth ──────────────────────────────────────────────────────────
export async function verifyUser(env, username, password) {
  if (!username || !password) return false;
  const uname   = sanitize(username);
  const profile = await ghGetRaw(env, `_users/${uname}__profile.json`);
  if (!profile) return false;
  const parsed   = JSON.parse(profile);
  const passHash = await sha256(password);
  return parsed.passHash === passHash;
}
