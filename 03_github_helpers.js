// ── GitHub Helpers — التعامل مع GitHub API ───────────────────────
import {
  CACHE_BRANCH, CACHE_TREE, CACHE_TREE_TIME, CACHE_TREE_TTL,
  setCacheBranch, setCacheTree, setCacheTreeTime,
} from './01_config.js';
import { b64, sanitize, genId } from './02_utils.js';

// ── API base ──────────────────────────────────────────────────────
export function apiBase(env) {
  return `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`;
}

export function ghH(env) {
  return {
    Authorization: `token ${env.GITHUB_TOKEN}`,
    Accept:        "application/vnd.github.v3+json",
    "User-Agent":  "GoldenLibraryWorker/6",
  };
}

// ── Raw GET ───────────────────────────────────────────────────────
export async function ghGetRaw(env, path) {
  const url = `${apiBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { headers: ghH(env) });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.content) return null;
  try {
    return atob(data.content.replace(/\n/g, ""));
  } catch {
    return null;
  }
}

export async function ghGetRawCDN(env, path) {
  const rawBase = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/HEAD`;
  const res = await fetch(`${rawBase}/${path.split('/').map(encodeURIComponent).join('/')}`, {
    headers: { "User-Agent": "GoldenLibraryWorker/6" },
  });
  if (!res.ok) return null;
  return res.text();
}

export async function ghGetWithSHA(env, path) {
  const url = `${apiBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { headers: ghH(env) });
  if (!res.ok) return { text: null, sha: null };
  const data = await res.json();
  if (!data.content) return { text: null, sha: data.sha || null };
  try {
    return { text: atob(data.content.replace(/\n/g, "")), sha: data.sha || null };
  } catch {
    return { text: null, sha: data.sha || null };
  }
}

// ── Mutex بسيط لمنع تعارض العمليات على نفس الملف ─────────────────
const _locks = new Map();

async function withLock(key, fn) {
  while (_locks.has(key)) {
    await _locks.get(key);
  }
  let resolve = (_value) => {};
  const p = new Promise(r => { resolve = r; });
  _locks.set(key, p);
  try {
    return await fn();
  } finally {
    _locks.delete(key);
    resolve();
  }
}

// ── PUT ───────────────────────────────────────────────────────────
export async function ghPut(env, path, contentBase64, message) {
  if (path.includes("..")) throw new Error("مسار غير مسموح");
  return withLock(path, async () => {
    const url     = `${apiBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
    const headers = ghH(env);

    let sha = null;
    const get = await fetch(url, { headers });
    if (get.ok) { const j = await get.json(); sha = j.sha ?? null; }

    const body = { message, content: contentBase64 };
    if (sha) body.sha = sha;

    const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });

    if (!res.ok) {
      if (res.status === 409 || res.status === 422) {
        const get2 = await fetch(url, { headers });
        if (get2.ok) {
          const j2    = await get2.json();
          const body2 = { message, content: contentBase64, sha: j2.sha };
          const res2  = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body2) });
          if (!res2.ok) throw new Error(`GitHub PUT retry ${res2.status}`);
          return res2.json();
        }
      }
      const txt = await res.text();
      throw new Error(`GitHub PUT ${res.status}: ${txt}`);
    }
    return res.json();
  });
}

// ── PUT with known SHA (أسرع — يتجنب GET إضافي) ──────────────────
export async function ghPutWithSHA(env, path, contentBase64, message, knownSha = null) {
  if (path.includes("..")) throw new Error("مسار غير مسموح");
  return withLock(path, async () => {
    const url     = `${apiBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
    const headers = ghH(env);

    let sha = knownSha;
    if (sha === null) {
      const get = await fetch(url, { headers });
      if (get.ok) { const j = await get.json(); sha = j.sha ?? null; }
    }

    const body = { message, content: contentBase64 };
    if (sha) body.sha = sha;

    const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
    if (!res.ok) {
      if (res.status === 409 || res.status === 422) {
        const get2 = await fetch(url, { headers });
        if (get2.ok) {
          const j2    = await get2.json();
          const body2 = { message, content: contentBase64, sha: j2.sha };
          const res2  = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body2) });
          if (!res2.ok) throw new Error(`GitHub PUT retry ${res2.status}`);
          return res2.json();
        }
      }
      const txt = await res.text();
      throw new Error(`GitHub PUT ${res.status}: ${txt}`);
    }
    return res.json();
  });
}

// ── DELETE ────────────────────────────────────────────────────────
export async function ghDelete(env, path, message) {
  if (path.includes("..")) throw new Error("مسار غير مسموح");
  return withLock(path, async () => {
    const url     = `${apiBase(env)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
    const headers = ghH(env);

    const get = await fetch(url, { headers });
    if (!get.ok) return;

    const info = await get.json();
    if (!info.sha) return;

    const res = await fetch(url, {
      method: "DELETE", headers,
      body: JSON.stringify({ message, sha: info.sha }),
    });

    if (!res.ok) {
      if (res.status === 409 || res.status === 422) {
        const get2 = await fetch(url, { headers });
        if (get2.ok) {
          const j2   = await get2.json();
          const res2 = await fetch(url, {
            method: "DELETE", headers,
            body: JSON.stringify({ message, sha: j2.sha }),
          });
          if (!res2.ok) throw new Error(`GitHub DELETE retry ${res2.status}`);
          return;
        }
      }
      const txt = await res.text();
      throw new Error(`GitHub DELETE ${res.status}: ${txt}`);
    }
  });
}

// ── Branch & Tree helpers ─────────────────────────────────────────
export async function getDefaultBranch(env) {
  if (CACHE_BRANCH) return CACHE_BRANCH;
  try {
    const info = await (await fetch(`${apiBase(env)}`, { headers: ghH(env) })).json();
    setCacheBranch(info.default_branch || "main");
  } catch (_) {
    setCacheBranch("main");
  }
  return CACHE_BRANCH;
}

export async function getRepoTree(env) {
  const now = Date.now();
  if (CACHE_TREE && (now - CACHE_TREE_TIME) < CACHE_TREE_TTL) {
    return CACHE_TREE;
  }
  const branch  = await getDefaultBranch(env);
  const treeRes = await fetch(`${apiBase(env)}/git/trees/${branch}?recursive=1`, { headers: ghH(env) });
  if (!treeRes.ok) return null;
  const { tree = [] } = await treeRes.json();

  setCacheTree({ tree, branch });
  setCacheTreeTime(now);
  return CACHE_TREE;
}

// ── Upload book helper (مشترك بين admin و user) ───────────────────
export async function uploadBookCore(env, body, basePath, owner) {
  const folder = sanitize(body.folder || "Unsorted");
  const name   = sanitize(body.name   || "file");
  if (!folder || !name) throw new Error("اسم المجلد أو الملف غير صالح");

  const ext        = (body.fileExt || "bin").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const fileBase64 = body.fileBase64.replace(/^data:[^;]+;base64,/, "");
  const filePath   = `${basePath}/${folder}/${name}.${ext}`;
  await ghPut(env, filePath, fileBase64, `${owner}: add file ${name}`);

  const bookId = genId();
  const meta   = {
    id: bookId, name,
    desc:      body.desc   || "",
    author:    body.author || "",
    year:      body.year   || "",
    fileExt:   ext,
    file_path: filePath,
    owner,
    created_at: new Date().toISOString(),
  };
  await ghPut(
    env, `${basePath}/${folder}/${name}__meta.json`,
    b64(JSON.stringify(meta, null, 2)),
    `${owner}: meta ${name}`
  );

  if (body.coverBase64) {
    const cover = body.coverBase64.replace(/^data:image\/\w+;base64,/, "");
    await ghPut(env, `${basePath}/${folder}/${name}__cover.jpg`, cover, `${owner}: cover ${name}`);
  }

  if (body.mediaFiles && Array.isArray(body.mediaFiles)) {
    const mediaList = [];
    for (let i = 0; i < Math.min(body.mediaFiles.length, 5); i++) {
      const mf = body.mediaFiles[i];
      if (!mf || !mf.base64 || !mf.name) continue;
      const mExt  = (mf.ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const mName = sanitize(mf.name || ("media_" + i));
      const mPath = `${basePath}/${folder}/${name}__media_${i}_${mName}.${mExt}`;
      const mData = mf.base64.replace(/^data:[^;]+;base64,/, "");
      await ghPut(env, mPath, mData, `${owner}: media ${name} #${i}`);
      mediaList.push({ path: mPath, name: mf.name, ext: mExt });
    }
    if (mediaList.length) {
      meta.mediaFiles = mediaList;
      await ghPut(
        env, `${basePath}/${folder}/${name}__meta.json`,
        b64(JSON.stringify(meta, null, 2)),
        `${owner}: meta media ${name}`
      );
    }
  }

  return { ok: true, message: "تم رفع الملف بنجاح", bookId };
}
