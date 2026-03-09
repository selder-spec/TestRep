// worker.js - Golden Library (المكتبھ الذھبیھ)
// Environment: Cloudflare Workers
// Env vars: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, ADMIN_PASSWORD

let CACHE_INDEX = null;
let CACHE_TIME = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // API routes
      if (url.pathname === "/api/index" && request.method === "GET") {
        const idx = await getIndex(env);
        return json(idx);
      }
      
      if (url.pathname === "/api/admin/create-folder" && request.method === "POST") {
        const body = await request.json();
        if (body.password !== env.ADMIN_PASSWORD) 
          return new Response("Unauthorized", { status: 401 });
        
        const name = sanitize(body.name || "NewFolder");
        const path = `${name}/.gitkeep`;
        await ghPut(env, path, btoa(""), `create folder ${name}`);
        await invalidateIndex(env);
        return json({ ok: true, message: "تم الرفع" });
      }
      
      if (url.pathname === "/api/admin/upload-book" && request.method === "POST") {
        const body = await request.json();
        if (body.password !== env.ADMIN_PASSWORD) 
          return new Response("Unauthorized", { status: 401 });
        
        const folder = sanitize(body.folder || "Unsorted");
        const name = sanitize(body.name || "book");
        if (!body.pdfBase64) return json({ error: "no pdf" }, 400);
        
        const pdfBase64 = body.pdfBase64.replace(/^data:application\/pdf;base64,/, "");
        const pdfPath = `${folder}/${name}.pdf`;
        await ghPut(env, pdfPath, pdfBase64, `add book ${name}`);
        
        const meta = { id: genId(), name, desc: body.desc || "", pdf_path: pdfPath };
        const metaPath = `${folder}/${name}__meta.json`;
        await ghPut(env, metaPath, btoa(JSON.stringify(meta)), `meta ${name}`);
        
        if (body.coverBase64) {
          const cover = body.coverBase64.replace(/^data:image\/\w+;base64,/, "");
          await ghPut(env, `${folder}/${name}__cover.jpg`, cover, `cover ${name}`);
        }
        
        await invalidateIndex(env);
        return json({ ok: true, message: "تم الرفع" });
      }
      
      if (url.pathname === "/api/admin/delete" && request.method === "POST") {
        const body = await request.json();
        if (body.password !== env.ADMIN_PASSWORD) 
          return new Response("Unauthorized", { status: 401 });
        
        const path = body.path;
        if (!path) return json({ error: "no path" }, 400);
        await ghDelete(env, path, `delete ${path}`);
        await invalidateIndex(env);
        return json({ ok: true });
      }
      
      // SPA
      if (request.method === "GET" && url.pathname === "/") {
        const index = await getIndex(env);
        return new Response(renderHTML(env, index), {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      
	  // serve static files from GitHub
      if (request.method === "GET" && (url.pathname === "/style.css" || url.pathname === "/app.js")) {
        const fileUrl = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/HEAD/public${url.pathname}`;
        
        const res = await fetch(fileUrl);
        
        if (!res.ok) {
          return new Response("File not found", { status: 404 });
        }
      
        const contentType = url.pathname.endsWith(".css")
          ? "text/css"
          : "application/javascript";
      
        return new Response(await res.text(), {
          headers: { "Content-Type": contentType }
        });
      }
	  
      return new Response("Not found", { status: 404 });
    } catch (e) {
      return json({ error: e.message || String(e) }, 500);
    }
  },
};

/* ---------- GitHub helpers ---------- */
function apiBase(env) {
  return `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}`;
}

async function ghFetch(env, path, opts = {}) {
  const res = await fetch(`${apiBase(env)}${path}`, {
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GoldenLibraryWorker"
    },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub ${res.status}: ${txt}`);
  }
  return res.json();
}

async function ghPut(env, path, contentBase64, message) {
  const url = `${apiBase(env)}/contents/${encodeURIComponent(path)}`;
  let sha = null;

  const get = await fetch(url, {
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GoldenLibraryWorker"
    },
  });

  if (get.ok) {
    const j = await get.json();
    if (j.sha) sha = j.sha;
  }

  const body = { message, content: contentBase64 };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GoldenLibraryWorker"
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub PUT ${res.status}: ${txt}`);
  }
  return res.json();
}

async function ghDelete(env, path, message) {
  const url = `${apiBase(env)}/contents/${encodeURIComponent(path)}`;

  const get = await fetch(url, {
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GoldenLibraryWorker"
    },
  });

  if (!get.ok) throw new Error("Not found");
  const info = await get.json();

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `token ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GoldenLibraryWorker"
    },
    body: JSON.stringify({ message, sha: info.sha }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub DELETE ${res.status}: ${txt}`);
  }
  return res.json();
}

/* ---------- Index builder & cache ---------- */
async function getIndex(env, force = false) {
  if (!force && CACHE_INDEX && Date.now() - CACHE_TIME < CACHE_TTL) 
    return CACHE_INDEX;
  
  const repoInfo = await ghFetch(env, "");
  const branch = repoInfo.default_branch || "main";
  
  const treeRes = await fetch(
    `${apiBase(env)}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GoldenLibraryWorker"
      },
    }
  );
  
  if (!treeRes.ok) throw new Error("Failed to fetch tree");
  const treeJson = await treeRes.json();
  const tree = treeJson.tree || [];
  const manifest = { folders: {} };
  
  for (const item of tree) {
    if (item.type !== "blob") continue;
    
    const parts = item.path.split("/");
    if (parts.length < 2) continue;
    
    const folder = parts[0];
    const filename = parts.slice(1).join("/");
    
    if (!manifest.folders[folder]) {
      manifest.folders[folder] = { name: folder, books: [], cover: null };
    }
    
    if (filename.toLowerCase().endsWith(".pdf")) {
      manifest.folders[folder].books.push({
        id: item.sha,
        name: filename.replace(/\.pdf$/i, ""),
        path: item.path,
        desc: "",
        cover: null,
      });
    } else if (filename.toLowerCase().endsWith("__meta.json")) {
      try {
        const raw = await fetch(
          `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/HEAD/${encodeURIComponent(
            item.path
          )}`,
          { headers: { "User-Agent": "GoldenLibraryWorker" } }
        );
        if (raw.ok) {
          const meta = await raw.json();
          const b = manifest.folders[folder].books.find(
            (x) => x.name === meta.name
          );
          if (b) b.desc = meta.desc || "";
        }
      } catch (e) {}
    } else if (
      filename.toLowerCase().match(/__cover\.(jpg|jpeg|png)$/) ||
      filename.toLowerCase().startsWith("cover.")
    ) {
      const base = filename.split("/").pop();
      if (base.toLowerCase().startsWith("cover")) {
        manifest.folders[folder].cover = item.path;
      } else {
        const name = base.replace(/__cover\.(jpg|jpeg|png)$/i, "");
        const b = manifest.folders[folder].books.find(
          (x) => x.name.toLowerCase() === name.toLowerCase()
        );
        if (b) b.cover = item.path;
      }
    }
  }
  
  for (const f of Object.values(manifest.folders)) {
    f.books.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  CACHE_INDEX = manifest;
  CACHE_TIME = Date.now();
  return manifest;
}

async function invalidateIndex(env) {
  CACHE_INDEX = null;
  CACHE_TIME = 0;
  await getIndex(env, true);
}

/* ---------- Utils ---------- */
function sanitize(s) {
  return String(s || "")
    .replace(/[\/\\#%&{}<>*? $!:'"@+`|=]/g, "-")
    .trim();
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- HTML renderer ---------- */
function renderHTML(env, index) {
  const snapshot = JSON.stringify(index);
  const owner = esc(env.GITHUB_OWNER);
  const repo = esc(env.GITHUB_REPO);
  
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>المكتبھ الذھبیھ</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="splash">
    <div id="splashTitle">المكتبھ الذھبیھ</div>
    <div id="splashBarWrap">
      <div id="splashBar"></div>
    </div>
  </div>
  
  <header>
    <div class="header-title">المكتبھ الذھبیھ</div>
    <div class="header-search">
      <span style="color:#888;font-size:16px"></span>
      <input id="searchInput" placeholder="ابحث عن كتاب pdf">
      <button id="adminBtn" class="btn hidden">الدخول كمدیر</button>
    </div>
  </header>
  
  <main>
    <div id="folders" class="grid-folders"></div>
  </main>
  
  <div id="sheet" class="sheet">
    <img id="sheetImg" src="">
    <div style="flex:1">
      <div id="sheetTitle" class="sheet-title"></div>
      <div id="sheetDesc" class="sheet-desc"></div>
    </div>
    <div class="book-actions">
      <button id="readBtn" class="btn">قراءة</button>
      <button id="downloadBtn" class="btn">تنزیل</button>
    </div>
  </div>
  
  <div id="plus" class="plus hidden">+</div>
  
  <script>
    const SNAP = ${snapshot};
    const OWNER = "${owner}";
    const REPO = "${repo}";
  </script>
  <script src="/app.js"></script>
</body>
</html>`;
}
