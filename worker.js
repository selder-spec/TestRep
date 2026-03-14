// ── worker.js — نقطة الدخول الرئيسية (Main Entry Point) ─────────
import { CORS, invalidateCache }          from './01_config.js';
import { sanitize, sanitizeVoterId,
         safeRatingKey, genId, b64,
         json, sha256 }                   from './02_utils.js';
import { ghGetRaw, ghPut, ghDelete,
         uploadBookCore }                 from './03_github_helpers.js';
import { getIndex, getArticles,
         getArticle, rateItem,
         getRatings, verifyUser }         from './04_data_logic.js';
import { renderHTML }                     from './05_html_template.js';

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS });

    try {
      const url = new URL(request.url);
      const p   = url.pathname;

      /* ── Public API ─────────────────────────────────────────── */

      if (p === "/api/admin/verify" && request.method === "POST") {
        const { password } = await request.json();
        return json({ ok: password === env.ADMIN_PASSWORD });
      }

      if (p === "/api/index" && request.method === "GET") {
        return json(await getIndex(env));
      }

      // تقييم كتاب — stars=0 لإلغاء التصويت
      if (p === "/api/rate" && request.method === "POST") {
        const { bookId, stars, voterId } = await request.json();
        const starsNum = Number(stars);
        if (!bookId || starsNum < 0 || starsNum > 5 || !Number.isInteger(starsNum))
          return json({ error: "بيانات غير صالحة" }, 400);
        const safeVoterId = sanitizeVoterId(voterId || "anon");
        const key  = safeRatingKey(bookId);
        const path = `_ratings/${key}__ratings.json`;
        const result = await rateItem(env, path, starsNum, safeVoterId);
        invalidateCache();
        return json(result);
      }

      // تقييم مقالة — stars=0 لإلغاء التصويت
      if (p === "/api/rate-article" && request.method === "POST") {
        const { articleId, stars, voterId } = await request.json();
        const starsNum = Number(stars);
        if (!articleId || starsNum < 0 || starsNum > 5 || !Number.isInteger(starsNum))
          return json({ error: "بيانات غير صالحة" }, 400);
        const safeVoterId = sanitizeVoterId(voterId || "anon");
        const path = `_ratings/article_${articleId}__ratings.json`;
        const result = await rateItem(env, path, starsNum, safeVoterId);
        invalidateCache();
        return json(result);
      }

      // جلب تقييمات متعددة دفعةً واحدة
      if (p === "/api/ratings" && request.method === "POST") {
        const { bookIds } = await request.json();
        if (!Array.isArray(bookIds)) return json({}, 400);
        const ratings = await getRatings(env, bookIds.slice(0, 200));
        return json(ratings);
      }

      // endpoint موحّد لصوت المستخدم (كتاب أو مقالة)
      if (p === "/api/vote" && request.method === "POST") {
        const { bookId, articleId, voterId } = await request.json();
        const id = bookId || articleId;
        if (!id || !voterId) return json({ stars: 0, avg: 0, count: 0 });
        const path = bookId
          ? `_ratings/${safeRatingKey(bookId)}__ratings.json`
          : `_ratings/article_${articleId}__ratings.json`;
        const rawText = await ghGetRaw(env, path);
        if (!rawText) return json({ stars: 0, avg: 0, count: 0 });
        try {
          const data = JSON.parse(rawText);
          return json({
            stars: data.votes?.[sanitizeVoterId(voterId)] || 0,
            avg:   data.avg   || 0,
            count: data.count || 0,
          });
        } catch { return json({ stars: 0, avg: 0, count: 0 }); }
      }

      // روابط قديمة للتوافق مع الإصدار السابق
      if ((p === "/api/user-vote" || p === "/api/user-article-vote") && request.method === "POST") {
        const body      = await request.json();
        const bookId    = body.bookId    || null;
        const articleId = body.articleId || null;
        const voterId   = body.voterId   || null;
        const id = bookId || articleId;
        if (!id || !voterId) return json({ stars: 0, avg: 0, count: 0 });
        const path = bookId
          ? `_ratings/${safeRatingKey(bookId)}__ratings.json`
          : `_ratings/article_${articleId}__ratings.json`;
        const rawText = await ghGetRaw(env, path);
        if (!rawText) return json({ stars: 0, avg: 0, count: 0 });
        try {
          const data = JSON.parse(rawText);
          return json({
            stars: data.votes?.[sanitizeVoterId(voterId)] || 0,
            avg:   data.avg   || 0,
            count: data.count || 0,
          });
        } catch { return json({ stars: 0, avg: 0, count: 0 }); }
      }

      /* ── Articles API ───────────────────────────────────────── */

      if (p === "/api/articles" && request.method === "GET") {
        return json(await getArticles(env));
      }

      if (p.startsWith("/api/articles/") && request.method === "GET") {
        const articleId = sanitize(p.replace("/api/articles/", ""));
        if (!articleId) return json({ error: "معرف المقالة غير صالح" }, 400);
        const article = await getArticle(env, articleId);
        if (!article) return json({ error: "المقالة غير موجودة" }, 404);
        return json(article);
      }

      if (p === "/api/article/create" && request.method === "POST") {
        const body = await request.json();
        const { title, content, summary, tags, coverColor } = body;
        if (!title || !content) return json({ error: "العنوان والمحتوى مطلوبان" }, 400);

        let author = "__admin__";
        let authorDisplay = "المدير";

        if (body.password && body.password === env.ADMIN_PASSWORD) {
          author = "__admin__";
          authorDisplay = "المدير";
        } else if (body.username && body.password) {
          if (!await verifyUser(env, body.username, body.password))
            return new Response("Unauthorized", { status: 401 });
          author = sanitize(body.username);
          const profile = await ghGetRaw(env, `_users/${author}__profile.json`);
          authorDisplay = profile ? (JSON.parse(profile).displayName || author) : author;
        } else {
          return new Response("Unauthorized", { status: 401 });
        }

        const articleId = genId();
        const article = {
          id: articleId, title, content,
          summary: summary || "",
          tags: tags || [],
          coverColor: coverColor || "#c49a24",
          author, authorDisplay,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await ghPut(
          env,
          `_articles/${articleId}__article.json`,
          b64(JSON.stringify(article, null, 2)),
          `article: create "${title}" by ${author}`
        );
        invalidateCache();
        return json({ ok: true, articleId, message: "تم نشر المقالة بنجاح" });
      }

      if (p === "/api/article/upload-image" && request.method === "POST") {
        const body = await request.json();
        const { imageBase64, imageExt } = body;
        let allowed = false;
        if (body.password && body.password === env.ADMIN_PASSWORD) allowed = true;
        else if (body.username && body.password && await verifyUser(env, body.username, body.password)) allowed = true;
        if (!allowed) return new Response("Unauthorized", { status: 401 });
        if (!imageBase64 || !imageExt) return json({ error: "بيانات ناقصة" }, 400);
        const safeExt = imageExt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 5);
        const imgId   = genId();
        const imgPath = `_articles_media/${imgId}.${safeExt}`;
        const b64data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        await ghPut(env, imgPath, b64data, `article image upload ${imgId}`);
        const rawBase = `https://raw.githubusercontent.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/HEAD`;
        return json({ ok: true, url: `${rawBase}/${imgPath}` });
      }

      if (p === "/api/article/delete" && request.method === "POST") {
        const body = await request.json();
        const { articleId } = body;
        if (!articleId) return json({ error: "معرف المقالة مطلوب" }, 400);

        const article = await getArticle(env, articleId);
        if (!article) return json({ error: "المقالة غير موجودة" }, 404);

        if (body.password && body.password === env.ADMIN_PASSWORD) {
          // admin can delete any
        } else if (body.username && body.password) {
          if (!await verifyUser(env, body.username, body.password))
            return new Response("Unauthorized", { status: 401 });
          if (article.author !== sanitize(body.username))
            return json({ error: "غير مسموح" }, 403);
        } else {
          return new Response("Unauthorized", { status: 401 });
        }

        await ghDelete(env, `_articles/${articleId}__article.json`, `article: delete ${articleId}`);
        invalidateCache();
        return json({ ok: true, message: "تم حذف المقالة" });
      }

      if (p === "/api/article/update" && request.method === "POST") {
        const body = await request.json();
        const { articleId } = body;
        if (!articleId) return json({ error: "معرف المقالة مطلوب" }, 400);

        const existing = await getArticle(env, articleId);
        if (!existing) return json({ error: "المقالة غير موجودة" }, 404);

        if (body.password && body.password === env.ADMIN_PASSWORD) {
          // admin can edit any
        } else if (body.username && body.password) {
          if (!await verifyUser(env, body.username, body.password))
            return new Response("Unauthorized", { status: 401 });
          if (existing.author !== sanitize(body.username))
            return json({ error: "غير مسموح" }, 403);
        } else {
          return new Response("Unauthorized", { status: 401 });
        }

        const { title, content, summary, tags, coverColor } = body;
        if (!title || !content) return json({ error: "العنوان والمحتوى مطلوبان" }, 400);

        const updated = {
          ...existing, title, content,
          summary:    summary    ?? existing.summary,
          tags:       tags       ?? existing.tags,
          coverColor: coverColor ?? existing.coverColor,
          updated_at: new Date().toISOString(),
        };

        await ghPut(
          env,
          `_articles/${articleId}__article.json`,
          b64(JSON.stringify(updated, null, 2)),
          `article: update "${title}" by ${updated.author}`
        );
        invalidateCache();
        return json({ ok: true, message: "تم تحديث المقالة بنجاح" });
      }

      /* ── User auth ──────────────────────────────────────────── */

      if (p === "/api/user/register" && request.method === "POST") {
        const { username, password, displayName } = await request.json();
        const uname = sanitize(username || "");
        if (!uname || uname.length < 3)
          return json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }, 400);
        if (!password || password.length < 6)
          return json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, 400);
        if (uname.startsWith("_"))
          return json({ error: "اسم المستخدم غير مسموح" }, 400);

        const profilePath = `_users/${uname}__profile.json`;
        const existing = await ghGetRaw(env, profilePath);
        if (existing) return json({ error: "اسم المستخدم مستخدم بالفعل" }, 409);

        const passHash = await sha256(password);
        const profile = {
          username: uname,
          displayName: displayName || uname,
          passHash,
          created_at: new Date().toISOString(),
        };
        await ghPut(env, profilePath, b64(JSON.stringify(profile)), `register user: ${uname}`);
        return json({ ok: true, username: uname, displayName: profile.displayName });
      }

      if (p === "/api/user/login" && request.method === "POST") {
        const { username, password } = await request.json();
        const uname = sanitize(username || "");
        if (!uname || !password) return json({ error: "بيانات ناقصة" }, 400);

        const profile = await ghGetRaw(env, `_users/${uname}__profile.json`);
        if (!profile) return json({ error: "المستخدم غير موجود" }, 404);

        const parsed   = JSON.parse(profile);
        const passHash = await sha256(password);
        if (parsed.passHash !== passHash)
          return json({ error: "كلمة مرور خاطئة" }, 401);

        return json({ ok: true, username: uname, displayName: parsed.displayName });
      }

      /* ── User library API ───────────────────────────────────── */

      if (p === "/api/user/create-folder" && request.method === "POST") {
        const body = await request.json();
        const { username, password, name } = body;
        if (!await verifyUser(env, username, password))
          return new Response("Unauthorized", { status: 401 });

        const folderName = sanitize(name || "NewFolder");
        if (!folderName) return json({ error: "اسم غير صالح" }, 400);

        const path = `_users/${sanitize(username)}/${folderName}/.gitkeep`;
        await ghPut(env, path, btoa(""), `user ${username}: create folder ${folderName}`);
        invalidateCache();
        return json({ ok: true, message: "تم إنشاء المجلد" });
      }

      if (p === "/api/user/upload-book" && request.method === "POST") {
        const body = await request.json();
        const { username, password } = body;
        if (!await verifyUser(env, username, password))
          return new Response("Unauthorized", { status: 401 });
        if (!body.fileBase64) return json({ error: "الملف مطلوب" }, 400);
        const uname = sanitize(username);
        const result = await uploadBookCore(env, body, `_users/${uname}`, uname);
        invalidateCache();
        return json(result);
      }

      if (p === "/api/user/delete" && request.method === "POST") {
        const body = await request.json();
        const { username, password, path } = body;
        if (!await verifyUser(env, username, password))
          return new Response("Unauthorized", { status: 401 });

        const uname         = sanitize(username);
        const allowedPrefix = `_users/${uname}/`;
        const profilePath   = `_users/${uname}__profile.json`;
        if (!path || (!path.startsWith(allowedPrefix) && path !== profilePath))
          return json({ error: "غير مسموح" }, 403);

        await ghDelete(env, path, `user ${username}: delete ${path}`);
        invalidateCache();
        return json({ ok: true, message: "تم الحذف" });
      }

      /* ── Admin API ──────────────────────────────────────────── */

      if (p === "/api/admin/create-folder" && request.method === "POST") {
        const body = await request.json();
        if (body.password !== env.ADMIN_PASSWORD)
          return new Response("Unauthorized", { status: 401 });

        const name = sanitize(body.name || "NewFolder");
        if (!name) return json({ error: "اسم غير صالح" }, 400);

        await ghPut(env, `_admin/${name}/.gitkeep`, btoa(""), `admin: create folder ${name}`);
        invalidateCache();
        return json({ ok: true, message: "تم إنشاء المجلد" });
      }

      if (p === "/api/admin/upload-book" && request.method === "POST") {
        const body = await request.json();
        if (body.password !== env.ADMIN_PASSWORD)
          return new Response("Unauthorized", { status: 401 });
        if (!body.fileBase64) return json({ error: "الملف مطلوب" }, 400);
        const result = await uploadBookCore(env, body, "_admin", "__admin__");
        invalidateCache();
        return json(result);
      }

      if (p === "/api/admin/delete" && request.method === "POST") {
        const body = await request.json();
        if (body.password !== env.ADMIN_PASSWORD)
          return new Response("Unauthorized", { status: 401 });

        const path = body.path;
        if (!path) return json({ error: "المسار مطلوب" }, 400);
        if (!path.startsWith("_admin/") && !path.startsWith("_ratings/") && !path.startsWith("_users/"))
          return json({ error: "غير مسموح" }, 403);

        await ghDelete(env, path, `admin: delete ${path}`);
        invalidateCache();
        return json({ ok: true, message: "تم الحذف" });
      }

      /* ── SPA ────────────────────────────────────────────────── */
      if (request.method === "GET" && (p === "/" || p.startsWith("/u/"))) {
        const index    = await getIndex(env);
        const articles = await getArticles(env);
        return new Response(renderHTML(env, index, articles), {
          headers: {
            "Content-Type":  "text/html; charset=utf-8",
            "Cache-Control": "no-cache, must-revalidate",
          },
        });
      }

      return new Response("Not found", { status: 404 });

    } catch (e) {
      console.error(e);
      return json({ error: e.message || String(e) }, 500);
    }
  },
};
