// app.js - المكتبة الذهبية (Frontend Logic)
// SNAP, OWNER, REPO are injected by the worker via <script> in the HTML
const splash = document.getElementById("splash");
const splashBar = document.getElementById("splashBar");
const foldersRoot = document.getElementById("folders");
const sheet = document.getElementById("sheet");
const sheetImg = document.getElementById("sheetImg");
const sheetTitle = document.getElementById("sheetTitle");
const sheetDesc = document.getElementById("sheetDesc");
const readBtn = document.getElementById("readBtn");
const downloadBtn = document.getElementById("downloadBtn");
const plus = document.getElementById("plus");
const searchInput = document.getElementById("searchInput");
const adminBtn = document.getElementById("adminBtn");
let currentBook = null;
let currentFolder = null;
let adminPassLocal = null;

/* ---------- Init ---------- */
let totalBooks = 0;
for (const f of Object.values(SNAP.folders)) totalBooks += f.books.length;
startSplash(totalBooks);
renderFolders();

/* ---------- Splash ---------- */
function startSplash(total) {
  let progress = 0;
  const max = Math.min(100, 20 + total * 5);
  const interval = setInterval(() => {
    progress += 2;
    splashBar.style.width = progress + "%";
    if (progress >= max) {
      clearInterval(interval);
      splashBar.style.width = "100%";
      setTimeout(() => splash.remove(), 400);
    }
  }, 40);
}

/* ---------- Render folders ---------- */
function renderFolders() {
  foldersRoot.innerHTML = "";
  const keys = Object.keys(SNAP.folders);
  if (!keys.length) {
    foldersRoot.innerHTML = '<div class="small" style="padding:40px"> لا توجد مجلدات بعد </div>';
    return;
  }
  keys.forEach((k, i) => {
    const info = SNAP.folders[k];
    const div = document.createElement("div");
    div.className = "folder";
    div.style.animationDelay = (i * 60) + "ms";
    const cover = info.cover ? rawUrl(info.cover) : placeholderSVG(k, 800, 110);
    div.innerHTML = `
      <img src="${cover}" alt="${escapeHtml(k)}">
      <div class="folder-title">${escapeHtml(k)}</div>
      <div class="folder-count">${info.books.length} كتب</div>
    `;
    div.addEventListener("click", () => openFolder(k));
    foldersRoot.appendChild(div);
  });
}

/* ---------- Open folder overlay ---------- */
function openFolder(name) {
  const info = SNAP.folders[name];
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="overlay-header">
      <div class="overlay-title">${escapeHtml(name)}</div>
      <div style="display:flex;gap:8px;align-items:center">
        <button id="addBookBtn" class="btn hidden"> إضافة كتاب </button>
        <button id="closeOverlay" class="btn"> إغلاق </button>
      </div>
    </div>
    <div id="booksWrap"></div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#closeOverlay").addEventListener("click", () => overlay.remove());
  const addBookBtn = overlay.querySelector("#addBookBtn");
  if (adminPassLocal) addBookBtn.classList.remove("hidden");
  addBookBtn.addEventListener("click", () => addBookDialog(name));
  const booksWrap = overlay.querySelector("#booksWrap");
  const first3 = info.books.slice(0, 3);
  if (first3.length) {
    const grid = document.createElement("div");
    grid.className = "books-grid";
    first3.forEach(b => grid.appendChild(bookCard(b, name)));
    booksWrap.appendChild(grid);
  }
  info.books.slice(3).forEach(b => booksWrap.appendChild(bookRow(b, name)));
}

/* ---------- Book card (first 3) ---------- */
function bookCard(b, folder) {
  const el = document.createElement("div");
  el.className = "book";
  const cover = b.cover ? rawUrl(b.cover) : placeholderSVG(b.name, 160, 220);
  el.innerHTML = `
    <img src="${cover}" alt="${escapeHtml(b.name)}" width="80" height="110">
    <div>
      <h4 class="book-title">${escapeHtml(b.name)}</h4>
      <p class="book-desc">${escapeHtml(b.desc || "")}</p>
    </div>
  `;
  el.addEventListener("click", () => openSheet(b, folder));
  return el;
}

/* ---------- Book row (rest) ---------- */
function bookRow(b, folder) {
  const el = document.createElement("div");
  el.className = "book";
  const cover = b.cover ? rawUrl(b.cover) : placeholderSVG(b.name, 160, 220);
  el.innerHTML = `
    <img src="${cover}" alt="${escapeHtml(b.name)}" width="64" height="88">
    <div style="flex:1">
      <h4 class="book-title">${escapeHtml(b.name)}</h4>
      <p class="book-desc">${escapeHtml(b.desc || "")}</p>
    </div>
    <div class="book-actions">
      <button class="btn" data-action="read"> قراءة </button>
      <button class="btn" data-action="download"> تنزيل </button>
    </div>
  `;
  el.querySelector('[data-action="read"]').addEventListener("click", () => openSheet(b, folder));
  el.querySelector('[data-action="download"]').addEventListener("click", () => downloadBook(b));
  return el;
}

/* ---------- Bottom sheet ---------- */
function openSheet(b, folder, auto = false) {
  currentBook = b;
  currentFolder = folder;
  const url = rawUrl(b.path);
  sheetImg.src = b.cover ? rawUrl(b.cover) : placeholderSVG(b.name, 128, 176);
  sheetTitle.textContent = b.name;
  sheetDesc.textContent = b.desc || "";
  sheet.classList.add("show");
  readBtn.onclick = () => window.open(url, "_blank");
  downloadBtn.onclick = () => downloadBook(b);
  if (auto) window.open(url, "_blank");
}

sheet.addEventListener("click", (e) => {
  if (e.target === sheet) sheet.classList.remove("show");
});

/* ---------- Download ---------- */
function downloadBook(b) {
  const a = document.createElement("a");
  a.href = rawUrl(b.path);
  a.download = b.name + ".pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- Search / Admin reveal ---------- */
searchInput.addEventListener("input", () => {
  const val = searchInput.value.trim();
  if (val.length >= 4) {
    adminBtn.classList.remove("hidden");
  } else {
    adminBtn.classList.add("hidden");
  }
});

adminBtn.addEventListener("click", () => {
  const pass = prompt("أدخل كلمة سر الإدارة");
  if (!pass) return;
  adminPassLocal = pass;
  plus.classList.remove("hidden");
  alert("تم تفعيل وضع المدير مؤقتاً ;)");
});

/* ---------- Add folder ---------- */
plus.addEventListener("click", () => {
  const name = prompt("اسم المجلد الجديد");
  if (!name) return;
  fetch("/api/admin/create-folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: adminPassLocal, name }),
  })
    .then(r => r.json())
    .then(j => {
      if (j.ok) {
        alert(j.message || "تم الرفع");
        location.reload();
      } else {
        alert("فشل إنشاء المجلد");
      }
    })
    .catch(() => alert("خطأ في الاتصال"));
});

/* ---------- Add book dialog ---------- */
function addBookDialog(folder) {
  const name = prompt("اسم الكتاب");
  if (!name) return;
  const desc = prompt("وصف قصير للكتاب") || "";
  const pdfUrl = prompt("رابط ملف PDF (مباشر)") || "";
  if (!pdfUrl) return alert("يجب إدخال رابط PDF");
  
  fetch(pdfUrl)
    .then(r => r.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        const pdfBase64 = reader.result;
        fetch("/api/admin/upload-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: adminPassLocal,
            folder,
            name,
            desc,
            pdfBase64,
          }),
        })
          .then(r => r.json())
          .then(j => {
            if (j.ok) {
              alert(j.message || "تم الرفع");
              location.reload();
            } else {
              alert("فشل رفع الكتاب");
            }
          })
          .catch(() => alert("خطأ في الاتصال"));
      };
      reader.readAsDataURL(blob);
    })
    .catch(() => alert("تعذر تحميل ملف PDF من الرابط"));
}

/* ---------- Helpers ---------- */
function rawUrl(path) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/HEAD/${encodeURIComponent(path)}`;
}

function placeholderSVG(text, w, h) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect width='100%' height='100%' fill='#050505'/>
    <text x='50%' y='50%' fill='#666' font-size='18' text-anchor='middle' dominant-baseline='middle'>${escapeHtml(text)}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}