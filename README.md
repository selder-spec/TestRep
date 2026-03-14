# المكتبة الرقمية v7 — هيكل الملفات

## بنية المشروع

```
worker.js              ← نقطة الدخول الرئيسية (main entry)
01_config.js           ← المتغيرات العامة والثوابت
02_utils.js            ← دوال مساعدة (sanitize, b64, json, sha256...)
03_github_helpers.js   ← التعامل مع GitHub API
04_data_logic.js       ← منطق البيانات (Index, Articles, Ratings, Auth)
05_html_template.js    ← توليد صفحة HTML + CSS + JS الواجهة
06_frontend_js.js      ← re-export لـ getClientScript
wrangler.toml          ← إعدادات Cloudflare Workers
```

## خطوات التشغيل

### 1. تثبيت Wrangler
```bash
npm install -g wrangler
```

### 2. تسجيل الدخول إلى Cloudflare
```bash
wrangler login
```

### 3. تعديل wrangler.toml
افتح `wrangler.toml` وعدّل:
```toml
GITHUB_OWNER = "اسم_حسابك_في_GitHub"
GITHUB_REPO  = "اسم_الريبو"
```

### 4. إضافة المتغيرات السرية
```bash
wrangler secret put GITHUB_TOKEN
# ثم اكتب الـ token عند الطلب

wrangler secret put ADMIN_PASSWORD
# ثم اكتب كلمة مرور المدير
```

### 5. التشغيل المحلي للاختبار
```bash
wrangler dev worker.js
```

### 6. النشر على Cloudflare
```bash
wrangler deploy worker.js
```

## شرح الاعتماديات بين الملفات

```
worker.js
  ├── 01_config.js     (CORS, cache vars)
  ├── 02_utils.js      (json, b64, sanitize...)
  │     └── 01_config.js
  ├── 03_github_helpers.js  (ghPut, ghDelete...)
  │     ├── 01_config.js
  │     └── 02_utils.js
  ├── 04_data_logic.js  (getIndex, rateItem...)
  │     ├── 01_config.js
  │     ├── 02_utils.js
  │     └── 03_github_helpers.js
  └── 05_html_template.js  (renderHTML)
        ├── 01_config.js
        └── 02_utils.js
```
