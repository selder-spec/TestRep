// ── HTML Template — renderHTML + getClientScript ─────────────────
import { ARTICLE_COLORS_LIST } from './01_config.js';
import { esc } from './02_utils.js';

/* ═══════════════════════════════════════════════════════════════════
   HTML renderer
   ═══════════════════════════════════════════════════════════════════ */

export function renderHTML(env, index, articles) {
  const snapshot         = JSON.stringify(index).replace(/<\/script>/gi, '<\\/script>');
  const articlesSnapshot = JSON.stringify(articles).replace(/<\/script>/gi, '<\\/script>');
  const owner            = esc(env.GITHUB_OWNER);
  const repo             = esc(env.GITHUB_REPO);

  const colorSwatchesHtml = ARTICLE_COLORS_LIST
    .map(c => `<div class="color-swatch" data-color="${c}" style="background:${c}" title="${c}"></div>`)
    .join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>المكتبة الرقمية</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#020b18;--surface:#061428;--card:#091e38;--card-hov:#0d2a4a;
  --border:rgba(0,212,255,.13);
  --accent:#00d4ff;--accent-dim:#0099bb;
  --accent-glow:rgba(0,212,255,.18);
  --text:#cce8f4;--muted:#4a7a96;
  --danger:#ff4d6d;--success:#00e5a0;--info:#38bdf8;--article:#818cf8;
  --gold:#00d4ff;--gold-dim:#0099bb;--gold-glow:rgba(0,212,255,.18);
  --r:12px;--rs:7px;--shadow:0 8px 32px rgba(0,0,0,.7);
  --fb:'Tajawal',sans-serif;--fd:'Tajawal',sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:15px;line-height:1.6;min-height:100vh;overflow-x:hidden;}
body::before{content:'';position:fixed;inset:0;background:
  radial-gradient(ellipse at 20% 50%, rgba(0,80,160,.07) 0%, transparent 60%),
  radial-gradient(ellipse at 80% 20%, rgba(0,212,255,.05) 0%, transparent 55%),
  repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,212,255,.025) 39px,rgba(0,212,255,.025) 40px),
  repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,212,255,.025) 39px,rgba(0,212,255,.025) 40px);
pointer-events:none;z-index:0;}

/* Splash */
#splash{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:9999;transition:opacity .5s,visibility .5s;}
#splash.out{opacity:0;visibility:hidden;}
.spl-logo{font-family:var(--fd);font-size:44px;color:var(--accent);text-shadow:0 0 40px var(--accent-glow),0 0 80px rgba(0,212,255,.2);animation:glow 2s ease-in-out infinite;letter-spacing:.04em;}
.spl-sub{font-size:11px;color:var(--muted);letter-spacing:.25em;text-transform:uppercase;}
.spl-bar-wrap{width:220px;height:2px;background:rgba(0,212,255,.08);border-radius:2px;overflow:hidden;}
.spl-bar{height:100%;width:0%;background:linear-gradient(90deg,var(--accent-dim),var(--accent));transition:width .3s ease;box-shadow:0 0 12px var(--accent-glow);}
@keyframes glow{0%,100%{text-shadow:0 0 30px var(--accent-glow);}50%{text-shadow:0 0 70px rgba(0,212,255,.45),0 0 120px rgba(0,212,255,.15);}}

/* Header */
header{position:sticky;top:0;z-index:200;background:rgba(2,11,24,.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:10px 18px;display:flex;align-items:center;gap:10px;}
.h-brand{display:flex;align-items:center;gap:8px;flex-shrink:0;cursor:pointer;}
.h-logo-icon{width:32px;height:32px;background:linear-gradient(135deg,var(--accent-dim),var(--accent));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 0 14px var(--accent-glow);}
.h-title{font-family:var(--fd);font-size:17px;color:var(--accent);white-space:nowrap;letter-spacing:.03em;}
.h-center{flex:1;max-width:340px;margin:0 auto;}
.srch-wrap{position:relative;}
.srch-icon{position:absolute;right:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;}
#searchInput{width:100%;padding:8px 34px 8px 12px;background:var(--surface);border:1px solid var(--border);border-radius:24px;color:var(--text);font-family:var(--fb);font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s;}
#searchInput::placeholder{color:var(--muted);}
#searchInput:focus{border-color:rgba(0,212,255,.15);box-shadow:0 0 0 3px rgba(0,212,255,.05);}
.h-right{display:flex;gap:6px;align-items:center;flex-shrink:0;margin-right:auto;}

/* Nav tabs */
.nav-tabs{display:flex;gap:4px;padding:0 18px;border-bottom:1px solid var(--border);background:rgba(2,11,24,.7);overflow-x:auto;}
.nav-tab{padding:10px 16px;font-size:13px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;transition:color .2s,border-color .2s;}
.nav-tab.active{color:var(--accent);border-bottom-color:var(--accent);}
.nav-tab:hover{color:var(--text);}

/* Stats bar */
.stats-bar{display:flex;align-items:center;gap:18px;padding:8px 18px;font-size:11px;color:var(--muted);border-bottom:1px solid rgba(0,212,255,.04);}
.stats-bar strong{color:var(--accent);}

/* Main */
main{max-width:1200px;margin:0 auto;padding:22px 18px 90px;position:relative;z-index:1;}

/* Section heading */
.sec-head{font-family:var(--fd);font-size:20px;color:var(--accent);margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.sec-head::after{content:'';flex:1;height:1px;background:linear-gradient(to left,transparent,var(--border));}

/* Top books grid */
.top-books-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;}
.top-book-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .25s,box-shadow .25s,border-color .25s;animation:fadeUp .4s ease forwards;opacity:0;}
.top-book-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,.7),0 0 0 1px rgba(0,212,255,.25);border-color:rgba(0,212,255,.3);}
.tbc-cover{width:100%;aspect-ratio:1/1;object-fit:cover;object-position:center top;background:var(--surface);display:block;}
.tbc-body{padding:10px 12px 12px;}
.tbc-name{font-weight:700;font-size:13px;color:var(--text);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tbc-author{font-size:11px;color:var(--accent-dim);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tbc-owner{font-size:10px;color:var(--muted);}

/* Stars */
.stars{display:flex;gap:2px;align-items:center;margin-top:4px;}
.star{font-size:13px;cursor:pointer;transition:transform .15s;color:rgba(0,180,220,.2);}
.star.filled{color:var(--accent);}
.star:hover{transform:scale(1.3);}
@keyframes starPop{0%{transform:scale(1);}40%{transform:scale(1.6);}70%{transform:scale(.88);}100%{transform:scale(1);}}
.star.pop{animation:starPop .38s cubic-bezier(.36,.07,.19,.97);}
.rating-val{font-size:11px;color:var(--muted);margin-right:4px;}
.rating-count{font-size:10px;color:var(--muted);}

/* Rank badge */
.rank-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-size:10px;font-weight:900;margin-bottom:4px;}
.rank-1{background:linear-gradient(135deg,#005f80,#00d4ff);color:#001a26;}
.rank-2{background:linear-gradient(135deg,#0a3a5c,#1a8caa);color:#001020;}
.rank-3{background:linear-gradient(135deg,#0d2a40,#0d6680);color:#001020;}
.rank-other{background:rgba(0,212,255,.07);color:var(--muted);}

/* Folders view */
.folders-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:15px;}
.folder-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .25s,box-shadow .25s,border-color .25s;animation:fadeUp .4s ease forwards;opacity:0;}
.folder-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,.7),0 0 0 1px rgba(0,212,255,.2);border-color:rgba(0,212,255,.25);}
.fc-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--surface);display:block;}
.fc-body{padding:10px 12px 12px;}
.fc-name{font-weight:700;font-size:14px;color:var(--text);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fc-meta{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px;}
.fc-dot{width:4px;height:4px;background:var(--gold);border-radius:50%;opacity:.6;}

/* Users list */
.users-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;}
.user-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:16px;cursor:pointer;transition:transform .25s,border-color .25s;animation:fadeUp .4s forwards;opacity:0;}
.user-card:hover{transform:translateY(-4px);border-color:rgba(0,212,255,.15);}
.uc-avatar{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dim),var(--gold));display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px;color:#001520;font-weight:900;}
.uc-name{font-weight:700;font-size:15px;color:var(--text);margin-bottom:3px;}
.uc-meta{font-size:11px;color:var(--muted);}

/* Article Cards */
.articles-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;}
.article-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:transform .25s,box-shadow .25s,border-color .25s;animation:fadeUp .4s ease forwards;opacity:0;display:flex;flex-direction:column;}
.article-card:hover{transform:translateY(-5px);box-shadow:0 16px 48px rgba(0,0,0,.7),0 0 0 1px rgba(167,139,250,.25);border-color:rgba(167,139,250,.3);}
.ac-banner{width:100%;height:120px;display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0;position:relative;overflow:hidden;}
.ac-banner::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(8,6,8,.7));}
.ac-body{padding:14px 16px 16px;flex:1;display:flex;flex-direction:column;}
.ac-title{font-family:var(--fd);font-size:17px;color:var(--text);margin-bottom:6px;line-height:1.4;}
.ac-summary{font-size:12px;color:var(--muted);line-height:1.7;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:10px;}
.ac-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.ac-author{font-size:11px;color:var(--accent-dim);display:flex;align-items:center;gap:4px;}
.ac-date{font-size:10px;color:var(--muted);}
.ac-tags{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px;}
.ac-tag{font-size:10px;padding:2px 7px;background:rgba(167,139,250,.08);color:var(--article);border-radius:20px;border:1px solid rgba(167,139,250,.18);}
/* Rich editor */
#articleReaderOverlay{position:fixed;inset:0;z-index:1000;background:var(--bg);display:flex;flex-direction:column;animation:fadeIn .2s ease;overflow:hidden;}
#articleReaderOverlay.hidden{display:none;}
#articleReaderBar{display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(8,6,8,.95);border-bottom:1px solid var(--border);flex-shrink:0;flex-wrap:wrap;}
#articleReaderTitle{font-family:var(--fd);font-size:16px;color:var(--accent);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#articleCloseBtn{background:rgba(224,92,122,.1);border:1px solid rgba(224,92,122,.25);color:var(--danger);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s;white-space:nowrap;}
#articleCloseBtn:hover{background:rgba(224,92,122,.2);}
#articleDeleteBtn{background:rgba(224,92,122,.1);border:1px solid rgba(224,92,122,.25);color:var(--danger);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s;white-space:nowrap;display:none;}
#articleDeleteBtn:hover{background:rgba(224,92,122,.2);}
#articleReaderBody{flex:1;overflow-y:auto;padding:0 0 60px;}
#articleReaderBody::-webkit-scrollbar{width:5px;}
#articleReaderBody::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}
.art-hero{width:100%;height:220px;display:flex;align-items:center;justify-content:center;font-size:64px;flex-shrink:0;position:relative;}
.art-hero::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,var(--bg));}
.art-content-wrap{max-width:720px;margin:0 auto;padding:0 24px 40px;}
.art-meta-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid var(--border);}
.art-author-badge{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--accent-dim);}
.art-author-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dim),var(--gold));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;color:#001520;flex-shrink:0;}
.art-date{font-size:11px;color:var(--muted);}
.art-tags-row{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:20px;}
.art-title-big{font-family:var(--fd);font-size:28px;color:var(--text);line-height:1.4;margin-bottom:16px;}

/* Article rating widget */
.art-rating-bar{display:flex;align-items:center;gap:12px;padding:14px 18px;background:rgba(0,212,255,.04);border-top:1px solid var(--border);margin-top:24px;border-radius:0 0 var(--r) var(--r);flex-wrap:wrap;}
.art-rating-avg{display:flex;flex-direction:column;align-items:center;gap:2px;}
.art-rating-num{font-size:26px;font-weight:900;color:var(--accent);line-height:1;}
.art-rating-avg-stars{display:flex;gap:1px;font-size:14px;}
.art-rating-cnt{font-size:10px;color:var(--muted);}
.art-rating-user{display:flex;flex-direction:column;gap:3px;flex:1;}
.art-rating-lbl{font-size:11px;color:var(--muted);}
.art-rating-stars .star{font-size:20px;}
.art-rating-msg{font-size:11px;color:var(--success);min-height:14px;}

/* Article card rating display */
.ac-rating-row{display:flex;align-items:center;gap:5px;margin-top:4px;}
.ac-rating-row .star{font-size:11px;cursor:default;}
.ac-rating-score{font-size:11px;color:var(--accent);font-weight:700;}
.ac-rating-cnt{font-size:10px;color:var(--muted);}

/* Rating widget (book sheet) */
.rating-wrap{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;padding:4px 0;}
.rating-avg-block{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:70px;}
.rating-big-num{font-size:28px;font-weight:900;color:var(--accent);line-height:1;}
@keyframes numBump{0%{transform:scale(1);}50%{transform:scale(1.25);}100%{transform:scale(1);}}
.rating-big-num.bump{animation:numBump .3s ease;}
.rating-avg-stars{display:flex;gap:2px;direction:ltr;}
.star-disp{font-size:16px;position:relative;color:rgba(0,180,220,.15);display:inline-block;direction:ltr;unicode-bidi:embed;}
.star-disp::after{content:'★';position:absolute;left:0;top:0;width:var(--pct,0%);overflow:hidden;color:var(--accent);white-space:nowrap;direction:ltr;}
.rating-count-label{font-size:10px;color:var(--muted);}
.rating-user-block{display:flex;flex-direction:column;gap:4px;flex:1;}
.rating-user-label{font-size:11px;color:var(--muted);}
.rich-editor-wrap{position:relative;}
#richEditor{width:100%;min-height:320px;padding:14px;background:var(--surface);border:none;color:var(--text);font-family:var(--fb);font-size:14px;line-height:1.9;outline:none;white-space:pre-wrap;word-break:break-word;}
#richEditor:empty::before{content:attr(data-placeholder);color:var(--muted);pointer-events:none;}
#richEditor img.inserted-img{display:block;max-width:100%;border-radius:8px;margin:10px 0;cursor:move;border:2px solid transparent;transition:border-color .2s;user-select:none;}
#richEditor img.inserted-img.selected{border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,212,255,.15);}
.img-toolbar{position:absolute;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:4px 6px;display:flex;gap:4px;z-index:100;box-shadow:var(--shadow);}
.img-toolbar button{background:rgba(255,255,255,.07);border:none;color:var(--text);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;transition:background .15s;}
.img-toolbar button:hover{background:rgba(0,212,255,.15);color:var(--accent);}

/* Article body */
.art-body{font-size:16px;line-height:1.9;color:#cfc8e0;}
.art-body h1,.art-body h2,.art-body h3{font-family:var(--fd);color:var(--accent);margin:28px 0 12px;}
.art-body h1{font-size:24px;}
.art-body h2{font-size:20px;}
.art-body h3{font-size:17px;color:var(--accent-dim);}
.art-body p{margin-bottom:16px;}
.art-body strong{color:var(--text);font-weight:700;}
.art-body em{color:var(--gold-dim);font-style:italic;}
.art-body blockquote{border-right:3px solid var(--gold);padding:10px 16px;margin:16px 0;background:rgba(0,212,255,.04);border-radius:0 8px 8px 0;color:var(--muted);font-style:italic;}
.art-body ul,.art-body ol{padding-right:22px;margin-bottom:16px;}
.art-body li{margin-bottom:6px;}
.art-body hr{border:none;border-top:1px solid var(--border);margin:28px 0;}
.art-body a{color:var(--info);text-decoration:underline;}
.art-body code{background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px;color:var(--success);}
.art-body pre{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:14px;overflow-x:auto;margin-bottom:16px;}
.art-body pre code{background:none;padding:0;}

/* Write Article Modal */
.article-editor{background:var(--surface);border:1px solid rgba(255,255,255,.1);border-radius:var(--rs);padding:0;overflow:hidden;}
.editor-toolbar{display:flex;gap:4px;padding:8px 10px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);flex-wrap:wrap;}
.tb-btn{background:none;border:1px solid transparent;color:var(--muted);border-radius:5px;padding:4px 8px;cursor:pointer;font-size:12px;font-family:var(--fb);transition:all .15s;white-space:nowrap;}
.tb-btn:hover{background:rgba(0,212,255,.07);border-color:rgba(0,212,255,.2);color:var(--accent);}
.tb-sep{width:1px;height:20px;background:rgba(255,255,255,.1);margin:2px 3px;align-self:center;}
.editor-preview{padding:14px;min-height:200px;font-size:14px;line-height:1.8;}
.editor-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.07);}
.editor-tab{padding:8px 16px;font-size:12px;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;font-family:var(--fb);}
.editor-tab.active{color:var(--gold);border-bottom-color:var(--gold);}
.color-swatches{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
.color-swatch{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:transform .15s,border-color .15s;}
.color-swatch:hover{transform:scale(1.15);}
.color-swatch.selected{border-color:#fff;transform:scale(1.1);}
.char-count{font-size:11px;color:var(--muted);text-align:left;padding:6px 12px;border-top:1px solid rgba(255,255,255,.05);}

/* Empty state */
.empty-state{grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted);font-size:14px;}
.empty-state .emoji{font-size:36px;display:block;margin-bottom:12px;}

/* Overlay */
.overlay{position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;background:rgba(4,3,6,.96);backdrop-filter:blur(4px);animation:fadeIn .2s ease;overflow:hidden;}
.ov-header{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--border);background:rgba(8,6,8,.85);flex-shrink:0;}
.ov-title{font-family:var(--fd);font-size:19px;color:var(--accent);}
.ov-acts{display:flex;gap:7px;align-items:center;}
.ov-search-wrap{padding:11px 18px;border-bottom:1px solid rgba(255,255,255,.04);flex-shrink:0;}
#bookSearch{width:100%;padding:9px 14px;background:var(--surface);border:1px solid var(--border);border-radius:24px;color:var(--text);font-family:var(--fb);font-size:13px;outline:none;}
#bookSearch:focus{border-color:rgba(0,212,255,.15);}
#bookSearch::placeholder{color:var(--muted);}
.ov-body{flex:1;overflow-y:auto;padding:15px 18px 80px;}
.ov-body::-webkit-scrollbar{width:5px;}
.ov-body::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}

/* Book cards */
.books-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:11px;}
.book-card{display:flex;gap:11px;align-items:flex-start;padding:11px;background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:var(--rs);cursor:pointer;transition:background .2s,border-color .2s,transform .2s;animation:fadeUp .35s ease forwards;opacity:0;}
.book-card:hover{background:var(--card-hov);border-color:rgba(0,212,255,.2);transform:translateY(-2px);}
.bk-thumb{width:60px;height:60px;object-fit:cover;border-radius:5px;background:var(--surface);flex-shrink:0;}
.bk-info{flex:1;min-width:0;}
.bk-name{font-weight:700;font-size:13px;color:var(--text);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bk-author{font-size:11px;color:var(--accent-dim);margin-bottom:3px;}
.bk-desc{font-size:11px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bk-tags{display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;}
.bk-tag{font-size:10px;padding:2px 6px;background:rgba(0,212,255,.05);color:var(--accent-dim);border-radius:20px;border:1px solid rgba(0,212,255,.12);}
.bk-qa{display:flex;flex-direction:column;gap:4px;flex-shrink:0;}
.bk-ext{background:rgba(90,180,224,.12);color:var(--info);font-weight:700;}

/* Bottom sheet */
#sheet{position:fixed;bottom:0;left:0;right:0;z-index:600;background:var(--surface);border-top:1px solid var(--border);border-radius:20px 20px 0 0;padding:20px 18px;display:flex;align-items:flex-start;gap:15px;transform:translateY(100%);transition:transform .35s cubic-bezier(.32,.72,0,1);box-shadow:0 -20px 60px rgba(0,0,0,.7);}
#sheet.show{transform:translateY(0);}
.sh-drag{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:36px;height:4px;background:rgba(255,255,255,.15);border-radius:2px;}
#sheetClose{position:absolute;top:13px;left:14px;background:none;border:none;color:var(--muted);font-size:19px;cursor:pointer;padding:4px;transition:color .2s;line-height:1;}
#sheetClose:hover{color:var(--text);}
#sheetImg{width:90px;height:90px;border-radius:10px;object-fit:cover;background:var(--card);flex-shrink:0;box-shadow:var(--shadow);}
.sh-body{flex:1;min-width:0;}
.sh-folder{font-size:11px;color:var(--muted);margin-bottom:3px;}
#sheetTitle{font-family:var(--fd);font-size:18px;color:var(--accent);margin-bottom:3px;}
#sheetAuthor{font-size:12px;color:var(--accent-dim);margin-bottom:5px;}
#sheetDesc{font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.7;}
.sh-rating{margin-bottom:10px;}
.sh-btns{display:flex;gap:7px;flex-wrap:wrap;}

/* FAB */
#fab{position:fixed;left:18px;bottom:18px;z-index:300;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#2ecc71,#27ae60);display:flex;align-items:center;justify-content:center;font-size:24px;color:#02140a;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.6);transition:transform .2s;animation:fabPop .4s .5s backwards;}
#fab:hover{transform:scale(1.08);}
#fab:active{transform:scale(.95);}
#fab.hidden{display:none;}
@keyframes fabPop{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
#fabMenu{position:fixed;left:18px;bottom:78px;z-index:299;display:flex;flex-direction:column;gap:8px;align-items:flex-start;}
#fabMenu.hidden{display:none;}
.fab-item{display:flex;align-items:center;gap:8px;cursor:pointer;animation:fadeUp .2s ease forwards;opacity:0;}
.fab-item-btn{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 16px rgba(0,0,0,.5);border:none;cursor:pointer;transition:transform .15s;}
.fab-item-btn:hover{transform:scale(1.1);}
.fab-item-label{font-size:12px;background:rgba(8,6,8,.9);color:var(--text);padding:4px 10px;border-radius:20px;border:1px solid var(--border);white-space:nowrap;}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:8px;font-family:var(--fb);font-size:12px;font-weight:600;cursor:pointer;border:none;transition:opacity .15s,transform .15s;white-space:nowrap;}
.btn:active{opacity:.8;transform:scale(.97);}
.btn-primary{background:linear-gradient(135deg,var(--accent-dim),var(--accent));color:#001520;}
.btn-ghost{background:rgba(255,255,255,.06);color:var(--text);border:1px solid rgba(255,255,255,.1);}
.btn-ghost:hover{background:rgba(255,255,255,.1);}
.btn-danger{background:rgba(224,92,122,.12);color:var(--danger);border:1px solid rgba(224,92,122,.22);}
.btn-success{background:rgba(82,196,140,.12);color:var(--success);border:1px solid rgba(82,196,140,.22);}
.btn-info{background:rgba(90,180,224,.12);color:var(--info);border:1px solid rgba(90,180,224,.22);}
.btn-article{background:rgba(167,139,250,.12);color:var(--article);border:1px solid rgba(167,139,250,.22);}
.btn-sm{padding:5px 9px;font-size:11px;border-radius:6px;}
.btn.hidden{display:none!important;}

/* Modal */
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);z-index:800;display:flex;align-items:flex-end;justify-content:center;animation:fadeIn .2s ease;}
.modal{background:var(--card);border:1px solid var(--border);border-radius:20px 20px 0 0;padding:22px;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;animation:slideUp .3s cubic-bezier(.32,.72,0,1);}
.modal-title{font-family:var(--fd);font-size:19px;color:var(--accent);margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;}
.form-group{margin-bottom:13px;}
.form-label{display:block;font-size:12px;color:var(--muted);margin-bottom:5px;font-weight:500;}
.form-input,.form-textarea,.form-select{width:100%;padding:9px 11px;background:var(--surface);border:1px solid rgba(255,255,255,.1);border-radius:var(--rs);color:var(--text);font-family:var(--fb);font-size:13px;outline:none;transition:border-color .2s;}
.form-input:focus,.form-textarea:focus,.form-select:focus{border-color:rgba(0,212,255,.15);}
.form-textarea{resize:vertical;min-height:65px;}
.form-select{cursor:pointer;}
.form-select option{background:var(--card);}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
.file-drop{border:1px dashed rgba(0,212,255,.15);border-radius:var(--rs);padding:18px;text-align:center;cursor:pointer;transition:background .2s,border-color .2s;font-size:12px;color:var(--muted);}
.file-drop:hover{background:rgba(0,212,255,.04);border-color:rgba(0,212,255,.15);}
.file-drop.has-file{background:rgba(82,196,140,.06);border-color:rgba(82,196,140,.3);color:var(--success);}
.file-drop input[type=file]{display:none;}
.modal-footer{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;}

/* Tab panels */
.tab-panel{display:none;}
.tab-panel.active{display:block;}

/* Search banner */
#searchBanner{display:none;align-items:center;justify-content:space-between;background:var(--surface);border:1px solid var(--border);border-radius:var(--rs);padding:9px 14px;margin-bottom:14px;font-size:13px;color:var(--muted);}
#searchBanner.show{display:flex;}
#clearSearch{background:none;border:none;color:var(--accent);cursor:pointer;font-family:var(--fb);font-size:12px;}

/* Toast */
#toastWrap{position:fixed;top:68px;left:50%;transform:translateX(-50%);z-index:9000;display:flex;flex-direction:column;gap:7px;pointer-events:none;min-width:230px;max-width:320px;}
.toast{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:9px 14px;font-size:13px;display:flex;align-items:center;gap:8px;box-shadow:var(--shadow);animation:toastIn .25s ease;pointer-events:auto;}
.toast.success{border-color:rgba(82,196,140,.3);}
.toast.error{border-color:rgba(224,92,122,.3);}
.toast.info{border-color:rgba(90,180,224,.3);}
@keyframes toastIn{from{transform:translateY(-8px);opacity:0;}to{transform:translateY(0);opacity:1;}}
@keyframes toastOut{from{opacity:1;}to{opacity:0;transform:scale(.95);}}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{transform:translateY(30px);opacity:0;}}

/* Admin / user badges */
#adminBadge{display:none;align-items:center;gap:4px;font-size:11px;color:var(--success);background:rgba(82,196,140,.1);border:1px solid rgba(82,196,140,.22);border-radius:20px;padding:4px 9px;}
#adminBadge.show{display:flex;}
.user-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--info);background:rgba(90,180,224,.1);border:1px solid rgba(90,180,224,.22);border-radius:20px;padding:4px 9px;}

/* Filter buttons */
.filter-btn{padding:5px 13px;border-radius:20px;border:1px solid var(--border);background:var(--surface);color:var(--muted);font-family:var(--fb);font-size:12px;cursor:pointer;transition:all .2s;}
.filter-btn:hover{border-color:rgba(0,212,255,.15);color:var(--text);}
.filter-btn.active{background:rgba(0,212,255,.1);border-color:var(--accent-dim);color:var(--accent);font-weight:600;}

/* Account Menu */
#accountMenuBtn{background:linear-gradient(135deg,var(--accent-dim),var(--accent));border:none;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;transition:transform .2s,box-shadow .2s;flex-shrink:0;}
#accountMenuBtn:hover{transform:scale(1.08);box-shadow:0 0 0 3px var(--accent-glow);}
#accountDropdown{position:absolute;top:46px;left:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);min-width:210px;box-shadow:var(--shadow);z-index:9999;overflow:hidden;display:none;transform-origin:top right;}
#accountDropdown.open{display:block;animation:acctFadeIn .18s ease;}
#acctUserSection{padding:10px 14px;border-bottom:1px solid var(--border);}
#acctUserInfo{font-size:12px;color:var(--muted);line-height:1.5;}
.acct-item{display:block;width:100%;padding:10px 14px;background:none;border:none;color:var(--text);font-family:var(--fb);font-size:13px;text-align:right;cursor:pointer;transition:background .15s;}
.acct-item:hover{background:rgba(255,255,255,.06);}
.acct-logout{color:var(--danger) !important;}
.acct-divider{height:1px;background:var(--border);margin:4px 0;}
@keyframes acctFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

@media(max-width:600px){
  .h-title{display:none;}
  main{padding:16px 13px 90px;}
  .folders-grid,.top-books-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:11px;}
  .articles-grid{grid-template-columns:1fr;}
  .books-grid{grid-template-columns:1fr;}
  .form-row{grid-template-columns:1fr;}
  #sheet{padding:16px 14px;}
  .art-title-big{font-size:22px;}
  .art-hero{height:160px;font-size:48px;}
}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}
</style>
</head>
<body>

<!-- Splash -->
<div id="splash">
  <div class="spl-logo">المكتبة الرقمية</div>
  <div class="spl-sub">Digital Library</div>
  <div class="spl-bar-wrap"><div class="spl-bar" id="splashBar"></div></div>
</div>

<!-- Header -->
<header>
  <div class="h-brand" id="hBrand">
    <div class="h-logo-icon">📚</div>
    <div class="h-title">المكتبة الرقمية</div>
  </div>
  <div class="h-center">
    <div class="srch-wrap">
      <span class="srch-icon">🔍</span>
      <input id="searchInput" type="search" placeholder="ابحث في المكتبة…" autocomplete="off">
    </div>
  </div>
  <div class="h-right">
    <div id="adminBadge">✓ مدير</div>
    <div id="userBadgeWrap"></div>
    <div id="accountMenuWrap" style="position:relative">
      <button id="accountMenuBtn" title="الحساب">👤</button>
      <div id="accountDropdown">
        <div id="acctUserSection"><div id="acctUserInfo">غير مسجل الدخول</div></div>
        <button id="acctUserBtn" class="acct-item">👤 دخول / تسجيل مستخدم</button>
        <button id="acctAdminBtn" class="acct-item">🔑 دخول المدير</button>
        <div class="acct-divider"></div>
        <button id="acctMyLib" class="acct-item hidden">📖 مكتبتي</button>
        <button id="acctLogout" class="acct-item acct-logout hidden">🚪 تسجيل الخروج الكامل</button>
      </div>
    </div>
    <button id="userBtn" style="display:none">دخول المستخدم</button>
    <button id="adminBtn" style="display:none">المدير</button>
  </div>
</header>

<!-- Nav tabs -->
<div class="nav-tabs">
  <div class="nav-tab active" data-tab="home" id="navHome">🏠 الرئيسية</div>
  <div class="nav-tab" data-tab="admin" id="adminFoldersTab" style="display:none">📂 المجلدات الرسمية</div>
  <div class="nav-tab" data-tab="users" id="usersLibTab" style="display:none">👥 مكتبات المستخدمين</div>
  <div class="nav-tab" data-tab="articles" id="navArticles">✍️ المقالات</div>
  <div class="nav-tab" data-tab="mylib" id="myLibTab" style="display:none">📖 مكتبتي</div>
</div>

<!-- Stats bar -->
<div class="stats-bar" id="statsBar"></div>

<main>
  <div id="searchBanner">
    <span>نتائج البحث: <strong id="searchQuery"></strong></span>
    <button id="clearSearch">مسح</button>
  </div>

  <div class="tab-panel active" id="tab-home">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:10px;flex-wrap:wrap;">
      <div class="sec-head" style="margin-bottom:0">📁 جميع الملفات</div>
      <div id="homeFilterBar" style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="filter-btn active" data-filter="">الكل</button>
        <button class="filter-btn" data-filter="admin">🏛 رسمي</button>
        <button class="filter-btn" data-filter="user">👤 مستخدمين</button>
      </div>
    </div>
    <div class="top-books-grid" id="topBooksGrid"></div>
  </div>

  <div class="tab-panel" id="tab-admin">
    <div class="sec-head">📂 المجلدات الرسمية</div>
    <div class="folders-grid" id="adminFoldersGrid"></div>
  </div>

  <div class="tab-panel" id="tab-users">
    <div class="sec-head">👥 مكتبات المستخدمين</div>
    <div class="users-grid" id="usersGrid"></div>
  </div>

  <div class="tab-panel" id="tab-articles">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:8px;flex-wrap:wrap;">
      <div class="sec-head" style="margin-bottom:0;flex:1">✍️ المقالات</div>
      <button id="writeArticleBtn" class="btn btn-article btn-sm" style="display:none">✍️ كتابة مقالة</button>
    </div>
    <div class="articles-grid" id="articlesGrid"></div>
  </div>

  <div class="tab-panel" id="tab-mylib">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:8px;flex-wrap:wrap;">
      <div class="sec-head" style="margin-bottom:0" id="myLibHeading">مكتبتي</div>
      <div style="display:flex;gap:7px;">
        <button class="btn btn-success btn-sm" id="addFolderMyLib">＋ مجلد جديد</button>
        <button class="btn btn-danger btn-sm" id="deleteLibraryBtn">🗑 حذف مكتبتي كاملاً</button>
      </div>
    </div>
    <div class="folders-grid" id="myFoldersGrid"></div>
  </div>
</main>

<!-- Bottom sheet -->
<div id="sheet">
  <div class="sh-drag"></div>
  <button id="sheetClose">✕</button>
  <img id="sheetImg" src="" alt="">
  <div class="sh-body">
    <div class="sh-folder" id="sheetFolder"></div>
    <div id="sheetTitle"></div>
    <div id="sheetAuthor"></div>
    <div id="sheetDesc"></div>
    <div class="sh-rating" id="sheetRating"></div>
    <div class="sh-btns">
      <button id="readBtn" class="btn btn-primary" style="display:none">📖 قراءة</button>
      <button id="downloadBtn" class="btn btn-primary">⬇️ تنزيل</button>
      <button id="deleteBookBtn" class="btn btn-danger btn-sm hidden">🗑 حذف</button>
    </div>
  </div>
</div>

<!-- FAB -->
<div id="fab" class="hidden" title="إضافة">+</div>
<div id="fabMenu" class="hidden">
  <div class="fab-item" style="animation-delay:0ms" id="fabAddFolder">
    <button class="fab-item-btn" style="background:linear-gradient(135deg,#27ae60,#2ecc71);color:#02140a">📂</button>
    <span class="fab-item-label">مجلد جديد</span>
  </div>
  <div class="fab-item" style="animation-delay:60ms" id="fabWriteArticle">
    <button class="fab-item-btn" style="background:linear-gradient(135deg,#6d28d9,#a78bfa);color:#f0ebff">✍️</button>
    <span class="fab-item-label">كتابة مقالة</span>
  </div>
</div>

<!-- Toast -->
<div id="toastWrap"></div>

<!-- Article Reader -->
<div id="articleReaderOverlay" class="hidden">
  <div id="articleReaderBar">
    <div id="articleReaderTitle">✍️ مقالة</div>
    <button id="articleEditBtn" style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.25);color:var(--accent);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s;white-space:nowrap;display:none">✏️ تعديل</button>
    <button id="articleDeleteBtn" style="display:none">🗑 حذف</button>
    <button id="articleCloseBtn">✕ إغلاق</button>
  </div>
  <div id="articleReaderBody"></div>
</div>

<script id="__SNAP__" type="application/json">${snapshot}</script>
<script id="__ARTS__" type="application/json">${articlesSnapshot}</script>
</body>
</html>` + getClientScript(owner, repo, colorSwatchesHtml);
}

/* ═══════════════════════════════════════════════════════════════════
   Client Script — محسَّن
   ═══════════════════════════════════════════════════════════════════ */
export function getClientScript(owner, repo, colorSwatchesHtml) {
  var o  = JSON.stringify(owner);
  var r  = JSON.stringify(repo);
  var sw = JSON.stringify(colorSwatchesHtml);
  return "<script>\n" +
    "(function(){\n" +
    "'use strict';\n" +
    "\n" +
    "window.onerror=function(msg,src,line,col,err){ console.error('[GL CRASH]',msg,'at',src,line+':'+col,err); };\n" +
    "window.onunhandledrejection=function(e){ console.error('[GL PROMISE]',e.reason); };\n" +
    "\n" +
    "/* ── Data ──────────────────────────────────────────────────── */\n" +
    "var SNAP, ARTICLES;\n" +
    "try {\n" +
    "  var snapEl=document.getElementById('__SNAP__'), artsEl=document.getElementById('__ARTS__');\n" +
    "  SNAP     = JSON.parse(snapEl.textContent);\n" +
    "  ARTICLES = JSON.parse(artsEl.textContent);\n" +
    "  console.log('[GL] SNAP OK — books:', SNAP&&SNAP.allBooks&&SNAP.allBooks.length);\n" +
    "} catch(e){ console.error('[GL] FATAL: data parse failed', e); }\n" +
    "\n" +
    "// تحديث التقييمات من السيرفر فور تحميل الصفحة\n" +
    "(function refreshRatings(){\n" +
    "  if(!SNAP||!SNAP.allBooks||!SNAP.allBooks.length) return;\n" +
    "  var ids=SNAP.allBooks.map(function(b){ return b.id; });\n" +
    "  fetch('/api/ratings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bookIds:ids})})\n" +
    "  .then(function(r){ return r.json(); })\n" +
    "  .then(function(map){\n" +
    "    SNAP.allBooks.forEach(function(b){\n" +
    "      var r=map[b.id]; b.rating=r?(r.avg||0):0; b.ratingCount=r?(r.count||0):0;\n" +
    "    });\n" +
    "    renderHome();\n" +
    "  }).catch(function(){});\n" +
    "})();\n" +
    "\n" +
    "var OWNER=" + o + ";\n" +
    "var REPO=" + r + ";\n" +
    "var RAW='https://raw.githubusercontent.com/'+OWNER+'/'+REPO+'/HEAD';\n" +
    "\n" +
    "var ARTICLE_COLORS=['#c49a24','#6d28d9','#0f766e','#b91c1c','#1d4ed8','#be185d','#15803d','#92400e','#1e40af','#7c3aed'];\n" +
    "var ARTICLE_EMOJIS=['📝','✍️','📖','🔬','💡','🌟','📚','🎓','🔭','⚗️','🧠','🌍'];\n" +
    "\n" +
    "/* ── State ─────────────────────────────────────────────────── */\n" +
    "var adminPass=null, currentUser=null, currentBook=null, activeOverlay=null, fabOpen=false;\n" +
    "var articlesData=ARTICLES?ARTICLES.slice():[];\n" +
    "\n" +
    "/* ── Session persistence ────────────────────────────────────── */\n" +
    "function saveUserSession(u)  { try{ localStorage.setItem('gl_user',JSON.stringify(u)); }catch(e){} }\n" +
    "function clearUserSession()  { try{ localStorage.removeItem('gl_user'); }catch(e){} }\n" +
    "function loadUserSession()   { try{ var s=localStorage.getItem('gl_user'); return s?JSON.parse(s):null; }catch(e){ return null; } }\n" +
    "function saveAdminSession(p) { try{ localStorage.setItem('gl_admin',p); }catch(e){} }\n" +
    "function clearAdminSession() { try{ localStorage.removeItem('gl_admin'); }catch(e){} }\n" +
    "function loadAdminSession()  { try{ return localStorage.getItem('gl_admin')||null; }catch(e){ return null; } }\n" +
    "\n" +
    "/* ── DOM helper ─────────────────────────────────────────────── */\n" +
    "function $(id){ return document.getElementById(id); }\n" +
    "\n" +
    "/* ── Tabs ───────────────────────────────────────────────────── */\n" +
    "function switchTab(name){\n" +
    "  document.querySelectorAll('.tab-panel').forEach(function(el){ el.classList.remove('active'); });\n" +
    "  document.querySelectorAll('.nav-tab').forEach(function(el){ el.classList.remove('active'); });\n" +
    "  var panel=$('tab-'+name); if(panel) panel.classList.add('active');\n" +
    "  var tab=document.querySelector('.nav-tab[data-tab=\"'+name+'\"]'); if(tab) tab.classList.add('active');\n" +
    "  if(name==='mylib') renderMyLib();\n" +
    "}\n" +
    "function goHome(){ switchTab('home'); }\n" +
    "\n" +
    "/* ── Stats bar + Splash ─────────────────────────────────────── */\n" +
    "var splashBar=$('splashBar'), splash=$('splash');\n" +
    "var splashProgress=0;\n" +
    "function advanceSplash(pct){ splashProgress=Math.max(splashProgress,pct); splashBar.style.width=splashProgress+'%'; }\n" +
    "advanceSplash(20);\n" +
    "setTimeout(function(){ advanceSplash(60); },200);\n" +
    "setTimeout(function(){\n" +
    "  advanceSplash(100);\n" +
    "  setTimeout(function(){ splash.classList.add('out'); },400);\n" +
    "},700);\n" +
    "if(SNAP&&SNAP.stats){\n" +
    "  $('statsBar').innerHTML='<span>📚 <strong>'+SNAP.stats.totalBooks+'</strong> ملف</span><span>📂 <strong>'+SNAP.stats.totalFolders+'</strong> مجلد</span><span>👥 <strong>'+SNAP.stats.totalUsers+'</strong> مستخدم</span><span>✍️ <strong>'+(ARTICLES?ARTICLES.length:0)+'</strong> مقالة</span>';\n" +
    "}\n" +
    "\n" +
    "/* ── FAB + Sheet refs ───────────────────────────────────────── */\n" +
    "var fab=$('fab'), fabMenu=$('fabMenu'), sheet=$('sheet');\n" +
    "var sheetImg=$('sheetImg'), sheetTitle=$('sheetTitle'), sheetAuthor=$('sheetAuthor');\n" +
    "var sheetDesc=$('sheetDesc'), sheetFolder=$('sheetFolder'), sheetRating=$('sheetRating');\n" +
    "var readBtn=$('readBtn'), downloadBtn=$('downloadBtn'), deleteBookBtn=$('deleteBookBtn');\n" +
    "var adminBadge=$('adminBadge'), userBadgeWrap=$('userBadgeWrap'), searchInput=$('searchInput');\n" +
    "fab.addEventListener('click',function(){\n" +
    "  fabOpen=!fabOpen;\n" +
    "  fabMenu.classList.toggle('hidden',!fabOpen);\n" +
    "  fab.textContent=fabOpen?'✕':'+';\n" +
    "  fab.style.transform=fabOpen?'rotate(45deg)':'';\n" +
    "  if(fabOpen){\n" +
    "    fabMenu.querySelectorAll('.fab-item').forEach(function(el,i){\n" +
    "      el.style.opacity='0'; el.style.transform='translateY(10px)';\n" +
    "      setTimeout(function(){ el.style.opacity='1'; el.style.transform='translateY(0)'; el.style.transition='all .2s'; },i*60);\n" +
    "    });\n" +
    "  }\n" +
    "});\n" +
    "function closeFabMenu(){ fabOpen=false; fabMenu.classList.add('hidden'); fab.textContent='+'; fab.style.transform=''; }\n" +
    "$('fabAddFolder').addEventListener('click',function(){ closeFabMenu(); var type=currentUser?'user':(adminPass?'admin':null); if(type) showAddFolderModal(type); });\n" +
    "$('fabWriteArticle').addEventListener('click',function(){ closeFabMenu(); showWriteArticleModal(); });\n" +
    "document.addEventListener('click',function(e){ if(fabOpen&&!fab.contains(e.target)&&!fabMenu.contains(e.target)) closeFabMenu(); });\n" +
    "$('writeArticleBtn').addEventListener('click',function(){ showWriteArticleModal(); });\n" +
    "\n" +
    "/* ── refreshIndex: تحديث البيانات بدون إعادة تحميل الصفحة ────── */\n" +
    "function refreshIndex(){\n" +
    "  fetch('/api/index')\n" +
    "    .then(function(r){ return r.json(); })\n" +
    "    .then(function(newSnap){\n" +
    "      if(!newSnap || newSnap.error) return;\n" +
    "      // تحديث SNAP في الذاكرة\n" +
    "      SNAP = newSnap;\n" +
    "      // إعادة رسم الواجهة\n" +
    "      try{ renderHome(); }catch(e){}\n" +
    "      try{ renderAdminFolders(); }catch(e){}\n" +
    "      try{ renderUsers(); }catch(e){}\n" +
    "      // تحديث stats bar\n" +
    "      if(SNAP && SNAP.stats){\n" +
    "        $('statsBar').innerHTML='<span>📚 <strong>'+SNAP.stats.totalBooks+'</strong> ملف</span><span>📂 <strong>'+SNAP.stats.totalFolders+'</strong> مجلد</span><span>👥 <strong>'+SNAP.stats.totalUsers+'</strong> مستخدم</span><span>✍️ <strong>'+(ARTICLES?ARTICLES.length:0)+'</strong> مقالة</span>';\n" +
    "      }\n" +
    "      // تحديث مكتبة المستخدم إن كانت مفتوحة\n" +
    "      if(currentUser) try{ renderMyLib(); }catch(e){}\n" +
    "    })\n" +
    "    .catch(function(){ toast('تعذّر تحديث البيانات','error'); });\n" +
    "}\n" +
    "\n" +
    "function renderHome(filter, nsFilter){\n" +
    "  filter=filter||''; nsFilter=nsFilter||'';\n" +
    "  var grid=$('topBooksGrid'); grid.innerHTML='';\n" +
    "  var books=(SNAP&&SNAP.allBooks)?SNAP.allBooks.slice():[];\n" +
    "  if(filter) books=books.filter(function(b){ return b.name.toLowerCase().indexOf(filter)>=0||(b.author||'').toLowerCase().indexOf(filter)>=0||(b.desc||'').toLowerCase().indexOf(filter)>=0; });\n" +
    "  if(nsFilter==='admin') books=books.filter(function(b){ return b.owner==='__admin__'; });\n" +
    "  if(nsFilter==='user')  books=books.filter(function(b){ return b.owner!=='__admin__'; });\n" +
    "  if(!books.length){ grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">📭</span>لا توجد ملفات بعد</div>'; return; }\n" +
    "  books.forEach(function(book, i){\n" +
    "    var card=document.createElement('div'); card.className='top-book-card'; card.style.animationDelay=(i*45)+'ms'; card._bookId=book.id;\n" +
    "    var cover=book.cover?rawUrl(book.cover):bookPlaceholder(book.name);\n" +
    "    var rankClass=i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-other';\n" +
    "    var ownerLabel=book.owner==='__admin__'?'🏛 رسمي':('👤 '+esc(book.owner));\n" +
    "    card.innerHTML=\n" +
    "      '<img class=\"tbc-cover\" src=\"'+cover+'\" alt=\"'+esc(book.name)+'\" loading=\"lazy\">'+\n" +
    "      '<div class=\"tbc-body\">'+\n" +
    "        '<div class=\"rank-badge '+rankClass+'\">'+(i+1)+'</div>'+\n" +
    "        '<div class=\"tbc-name\">'+esc(book.name)+'</div>'+\n" +
    "        (book.author?'<div class=\"tbc-author\">'+esc(book.author)+'</div>':'')+\n" +
    "        '<div class=\"tbc-owner\">'+ownerLabel+'</div>'+\n" +
    "        '<div class=\"stars\">'+renderStarsStatic(book.rating)+\n" +
    "          '<span class=\"rating-val\" style=\"font-size:11px;color:var(--accent);font-weight:700\">'+(book.rating?book.rating.toFixed(1):'—')+'</span> '+\n" +
    "          '<span class=\"rating-count\">'+(book.ratingCount?'('+book.ratingCount+')':'')+'</span>'+\n" +
    "        '</div>'+\n" +
    "      '</div>';\n" +
    "    card.addEventListener('click',function(){ openSheet(book); });\n" +
    "    grid.appendChild(card);\n" +
    "  });\n" +
    "}\n" +
    "(function(){\n" +
    "  var currentNsFilter='';\n" +
    "  var btns=document.querySelectorAll('#homeFilterBar .filter-btn');\n" +
    "  btns.forEach(function(btn){\n" +
    "    btn.addEventListener('click',function(){\n" +
    "      btns.forEach(function(b){ b.classList.remove('active'); }); btn.classList.add('active');\n" +
    "      currentNsFilter=btn.dataset.filter||'';\n" +
    "      var sv=searchInput?searchInput.value.trim().toLowerCase():'';\n" +
    "      renderHome(sv,currentNsFilter);\n" +
    "    });\n" +
    "  });\n" +
    "  window.getCurrentNsFilter=function(){ return currentNsFilter; };\n" +
    "})();\n" +
    "\n" +
    "/* ── Admin folders ──────────────────────────────────────────── */\n" +
    "function renderAdminFolders(filter){\n" +
    "  filter=filter||''; var grid=$('adminFoldersGrid'); grid.innerHTML='';\n" +
    "  var folders=(SNAP&&SNAP.adminFolders)?SNAP.adminFolders:{};\n" +
    "  var shown=0;\n" +
    "  Object.keys(folders).forEach(function(k,i){\n" +
    "    var info=folders[k];\n" +
    "    if(filter&&k.toLowerCase().indexOf(filter)<0&&!info.books.some(function(b){ return b.name.toLowerCase().indexOf(filter)>=0; })) return;\n" +
    "    shown++;\n" +
    "    var card=document.createElement('div'); card.className='folder-card'; card.style.animationDelay=(i*50)+'ms';\n" +
    "    var cover=info.cover?rawUrl(info.cover):folderPlaceholder(k);\n" +
    "    card.innerHTML='<img class=\"fc-thumb\" src=\"'+cover+'\" alt=\"'+esc(k)+'\" loading=\"lazy\"><div class=\"fc-body\"><div class=\"fc-name\">'+esc(k)+'</div><div class=\"fc-meta\"><span class=\"fc-dot\"></span>'+info.books.length+' كتاب</div></div>';\n" +
    "    card.addEventListener('click',function(){ openFolderOverlay(k,info.books,'admin'); });\n" +
    "    grid.appendChild(card);\n" +
    "  });\n" +
    "  if(!shown) grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">📭</span>لا توجد مجلدات</div>';\n" +
    "}\n" +
    "\n" +
    "/* ── Users ──────────────────────────────────────────────────── */\n" +
    "function renderUsers(filter){\n" +
    "  filter=filter||''; var grid=$('usersGrid'); grid.innerHTML='';\n" +
    "  var users=(SNAP&&SNAP.users)?SNAP.users:{};\n" +
    "  var keys=Object.keys(users);\n" +
    "  if(!keys.length){ grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">👥</span>لا يوجد مستخدمون بعد. سجّل الآن!</div>'; return; }\n" +
    "  keys.forEach(function(u,i){\n" +
    "    var info=users[u];\n" +
    "    if(filter&&u.toLowerCase().indexOf(filter)<0&&info.displayName.toLowerCase().indexOf(filter)<0) return;\n" +
    "    var card=document.createElement('div'); card.className='user-card'; card.style.animationDelay=(i*50)+'ms';\n" +
    "    var initial=((info.displayName||u)[0]||'?').toUpperCase();\n" +
    "    card.innerHTML='<div class=\"uc-avatar\">'+esc(initial)+'</div><div class=\"uc-name\">'+esc(info.displayName||u)+'</div><div class=\"uc-meta\">@'+esc(u)+' · '+((info.books&&info.books.length)||0)+' كتاب · '+Object.keys(info.folders||{}).length+' مجلد</div>';\n" +
    "    card.addEventListener('click',function(){ openUserPage(u); });\n" +
    "    grid.appendChild(card);\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Articles ───────────────────────────────────────────────── */\n" +
    "function articleEmoji(article){\n" +
    "  var h=article.id?article.id.charCodeAt(0)%ARTICLE_EMOJIS.length:0;\n" +
    "  return ARTICLE_EMOJIS[h];\n" +
    "}\n" +
    "function renderArticles(filter){\n" +
    "  filter=filter||''; var grid=$('articlesGrid'); grid.innerHTML='';\n" +
    "  var canWrite=!!(currentUser||adminPass);\n" +
    "  $('writeArticleBtn').style.display=canWrite?'':'none';\n" +
    "  var arts=articlesData;\n" +
    "  if(filter) arts=arts.filter(function(a){ return a.title.toLowerCase().indexOf(filter)>=0||(a.summary||'').toLowerCase().indexOf(filter)>=0||(a.authorDisplay||'').toLowerCase().indexOf(filter)>=0||(a.tags||[]).some(function(t){ return t.toLowerCase().indexOf(filter)>=0; }); });\n" +
    "  if(!arts.length){ grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">✍️</span>'+(filter?'لا توجد نتائج':'لا توجد مقالات بعد. كن أول من يكتب!')+'</div>'; return; }\n" +
    "  arts.forEach(function(article,i){\n" +
    "    var card=document.createElement('div'); card.className='article-card'; card.style.animationDelay=(i*55)+'ms';\n" +
    "    var color=article.coverColor||'#c49a24';\n" +
    "    var emoji=articleEmoji(article);\n" +
    "    var tagsHtml=(article.tags||[]).slice(0,4).map(function(t){ return '<span class=\"ac-tag\">'+esc(t)+'</span>'; }).join('');\n" +
    "    var dateStr=article.created_at?new Date(article.created_at).toLocaleDateString('ar-SA'):'';\n" +
    "    var ratingHtml=article.rating?'<div class=\"ac-rating-row\">'+renderStarsStatic(article.rating)+'<span class=\"ac-rating-score\">'+article.rating.toFixed(1)+'</span><span class=\"ac-rating-cnt\">('+( article.ratingCount||0)+')</span></div>':'';\n" +
    "    card.innerHTML=\n" +
    "      '<div class=\"ac-banner\" style=\"background:linear-gradient(135deg,'+color+'22,'+color+'44)\"><span style=\"position:relative;z-index:1;font-size:44px\">'+emoji+'</span><div style=\"position:absolute;bottom:10px;right:14px;z-index:1;font-size:10px;color:rgba(255,255,255,.5)\">'+dateStr+'</div></div>'+\n" +
    "      '<div class=\"ac-body\"><div class=\"ac-title\">'+esc(article.title)+'</div>'+(article.summary?'<div class=\"ac-summary\">'+esc(article.summary)+'</div>':'')+(tagsHtml?'<div class=\"ac-tags\">'+tagsHtml+'</div>':'')+'<div class=\"ac-footer\"><div class=\"ac-author\"><span style=\"font-size:14px\">'+(article.author==='__admin__'?'🏛':'👤')+'</span>'+esc(article.authorDisplay||article.author)+'</div>'+ratingHtml+'</div></div>';\n" +
    "    card.addEventListener('click',function(){ openArticleReader(article); });\n" +
    "    grid.appendChild(card);\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ═══════════════════════════════════════════════════════════════\n" +
    "   RatingWidget — كلاس موحّد للكتب والمقالات (v5)\n" +
    "   ═══════════════════════════════════════════════════════════════ */\n" +
    "function RatingWidget(container, opts){\n" +
    "  // opts: { itemId, isArticle, voterId, initVote, initAvg, initCount, compact }\n" +
    "  var self     = this;\n" +
    "  self.itemId  = opts.itemId;\n" +
    "  self.isArt   = !!opts.isArticle;\n" +
    "  self.voterId = opts.voterId;\n" +
    "  self.vote    = opts.initVote  || 0;\n" +
    "  self.avg     = opts.initAvg   || 0;\n" +
    "  self.count   = opts.initCount || 0;\n" +
    "  self.timer   = null;\n" +
    "  self.inFlight= false; // منع إرسال متزامن\n" +
    "\n" +
    "  // بناء الـ HTML بنفس class names الأصلية\n" +
    "  self._render = function(){\n" +
    "    var starsHtml='';\n" +
    "    for(var s=1;s<=5;s++) starsHtml+='<span class=\"star rw-star '+(s<=self.vote?'filled':'')+'\" data-s=\"'+s+'\">★</span>';\n" +
    "    var avgStarsHtml='';\n" +
    "    for(var s=1;s<=5;s++){\n" +
    "      var pct=Math.round(Math.max(0,Math.min(1,self.avg-(s-1)))*100);\n" +
    "      avgStarsHtml+='<span class=\"star-disp\" style=\"--pct:'+pct+'%\">★</span>';\n" +
    "    }\n" +
    "    container.innerHTML=\n" +
    "      '<div class=\"rating-wrap\">'+\n" +
    "        '<div class=\"rating-avg-block\">'+\n" +
    "          '<span class=\"rating-big-num\" id=\"rwBigNum\">'+(self.avg?self.avg.toFixed(1):'—')+'</span>'+\n" +
    "          '<div class=\"rating-avg-stars\">'+avgStarsHtml+'</div>'+\n" +
    "          '<span class=\"rating-count-label\" id=\"rwCount\">'+self.count+' تقييم</span>'+\n" +
    "        '</div>'+\n" +
    "        '<div class=\"rating-user-block\">'+\n" +
    "          '<div class=\"rating-user-label\" id=\"rwLbl\">'+(self.vote?'تقييمك: ':'قيّم الآن:')+'</div>'+\n" +
    "          '<div class=\"stars\" id=\"rwStars\">'+starsHtml+'</div>'+\n" +
    "          '<span id=\"rwMsg\" style=\"font-size:11px;color:var(--accent);min-height:16px;display:block\"></span>'+\n" +
    "        '</div>'+\n" +
    "      '</div>';\n" +
    "    self._wireStars();\n" +
    "  };\n" +
    "\n" +
    "  // تحديث عرض المتوسط بدون إعادة بناء كاملة\n" +
    "  self._updateAvg = function(avg, count){\n" +
    "    self.avg=avg; self.count=count;\n" +
    "    var nb=container.querySelector('#rwBigNum');\n" +
    "    if(nb){ nb.textContent=avg?avg.toFixed(1):'—'; nb.classList.remove('bump'); void nb.offsetWidth; nb.classList.add('bump'); }\n" +
    "    var nc=container.querySelector('#rwCount'); if(nc) nc.textContent=count+' تقييم';\n" +
    "    container.querySelectorAll('.star-disp').forEach(function(sd,i){\n" +
    "      var pct=Math.round(Math.max(0,Math.min(1,avg-i))*100);\n" +
    "      sd.style.setProperty('--pct',pct+'%');\n" +
    "    });\n" +
    "  };\n" +
    "\n" +
    "  // إضاءة النجوم عند hover\n" +
    "  self._hi = function(n){\n" +
    "    container.querySelectorAll('.rw-star').forEach(function(st,i){ st.classList.toggle('filled',i<n); });\n" +
    "  };\n" +
    "\n" +
    "  // إرسال التقييم مع debounce + in-flight guard\n" +
    "  self._send = function(starsVal){\n" +
    "    clearTimeout(self.timer);\n" +
    "    self.timer=setTimeout(function(){\n" +
    "      if(self.inFlight) return; // تجاهل إذا كان طلب سابق لم يُكتمل\n" +
    "      self.inFlight=true;\n" +
    "      var msgEl=container.querySelector('#rwMsg');\n" +
    "      if(msgEl){ msgEl.textContent='جارٍ الحفظ…'; msgEl.style.color='var(--muted)'; }\n" +
    "      var endpoint=self.isArt?'/api/rate-article':'/api/rate';\n" +
    "      var body=self.isArt\n" +
    "        ?{articleId:self.itemId,stars:starsVal,voterId:self.voterId}\n" +
    "        :{bookId:self.itemId,stars:starsVal,voterId:self.voterId};\n" +
    "      fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})\n" +
    "      .then(function(r){ return r.json(); })\n" +
    "      .then(function(data){\n" +
    "        self.inFlight=false;\n" +
    "        if(data.ok){\n" +
    "          self._updateAvg(data.avg,data.count);\n" +
    "          var lbl=container.querySelector('#rwLbl'); if(lbl) lbl.textContent=starsVal?'تقييمك: ':'قيّم الآن:';\n" +
    "          if(msgEl){ msgEl.textContent=starsVal?'✓ تم حفظ تقييمك':'✓ تم إلغاء التقييم'; msgEl.style.color='var(--success)'; msgEl.className=''; }\n" +
    "          // مزامنة البيانات المحلية\n" +
    "          if(!self.isArt){\n" +
    "            // تحديث SNAP للكتاب\n" +
    "            if(SNAP&&SNAP.allBooks){\n" +
    "              SNAP.allBooks.forEach(function(b){ if(b.id===self.itemId){ b.rating=data.avg; b.ratingCount=data.count; } });\n" +
    "            }\n" +
    "            _updateBookCardInGrid(self.itemId,data.avg,data.count);\n" +
    "            var vk='gl_vote_'+self.itemId;\n" +
    "            try{ starsVal?localStorage.setItem(vk,String(starsVal)):localStorage.removeItem(vk); }catch(e){}\n" +
    "          } else {\n" +
    "            // تحديث articlesData للمقالة\n" +
    "            articlesData.forEach(function(a){ if(a.id===self.itemId){ a.rating=data.avg; a.ratingCount=data.count; } });\n" +
    "          }\n" +
    "          // مسح رسالة النجاح بعد 2.5 ثانية\n" +
    "          setTimeout(function(){ if(msgEl) msgEl.textContent=''; },2500);\n" +
    "        } else {\n" +
    "          if(msgEl){ msgEl.textContent='فشل التقييم'; msgEl.style.color='var(--danger)'; msgEl.className=''; }\n" +
    "        }\n" +
    "      })\n" +
    "      .catch(function(){\n" +
    "        self.inFlight=false;\n" +
    "        if(msgEl){ msgEl.textContent='خطأ في الاتصال'; msgEl.style.color='var(--danger)'; msgEl.className=''; }\n" +
    "      });\n" +
    "    },350);\n" +
    "  };\n" +
    "\n" +
    "  self._wireStars = function(){\n" +
    "    var stars=container.querySelectorAll('.rw-star');\n" +
    "    stars.forEach(function(star){\n" +
    "      star.addEventListener('mouseenter',function(){ self._hi(Number(star.dataset.s)); });\n" +
    "      star.addEventListener('mouseleave',function(){ self._hi(self.vote); });\n" +
    "      star.addEventListener('click',function(){\n" +
    "        var s=Number(star.dataset.s);\n" +
    "        star.classList.remove('pop'); void star.offsetWidth; star.classList.add('pop');\n" +
    "        if(s===self.vote){\n" +
    "          self.vote=0; self._hi(0);\n" +
    "          var lbl=container.querySelector('#rwLbl'); if(lbl) lbl.textContent='قيّم الآن:';\n" +
    "          self._send(0);\n" +
    "        } else {\n" +
    "          self.vote=s; self._hi(s);\n" +
    "          self._send(s);\n" +
    "        }\n" +
    "      });\n" +
    "    });\n" +
    "    // دعم اللمس على الجوّال\n" +
    "    var starsWrap=container.querySelector('#rwStars');\n" +
    "    if(starsWrap){\n" +
    "      starsWrap.addEventListener('touchmove',function(e){\n" +
    "        e.preventDefault();\n" +
    "        var touch=e.touches[0], el=document.elementFromPoint(touch.clientX,touch.clientY);\n" +
    "        if(el&&el.dataset.s) self._hi(Number(el.dataset.s));\n" +
    "      },{passive:false});\n" +
    "      starsWrap.addEventListener('touchend',function(e){\n" +
    "        var touch=e.changedTouches[0], el=document.elementFromPoint(touch.clientX,touch.clientY);\n" +
    "        if(el&&el.dataset.s){\n" +
    "          var s=Number(el.dataset.s);\n" +
    "          el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');\n" +
    "          if(s===self.vote){ self.vote=0; self._hi(0); self._send(0); }\n" +
    "          else { self.vote=s; self._hi(s); self._send(s); }\n" +
    "        }\n" +
    "      },{passive:true});\n" +
    "    }\n" +
    "  };\n" +
    "\n" +
    "  // تهيئة\n" +
    "  self._render();\n" +
    "}\n" +
    "\n" +
    "/* ── Sheet rating ───────────────────────────────────────────── */\n" +
    "function renderSheetRating(book){\n" +
    "  var voterId=currentUser?currentUser.username:getAnonId();\n" +
    "  // عرض التقييم المخزون محلياً فوراً بينما يُجلب الصوت من السيرفر\n" +
    "  var cachedVote=0;\n" +
    "  try{ cachedVote=parseInt(localStorage.getItem('gl_vote_'+book.id)||'0',10)||0; }catch(e){}\n" +
    "  // عرض أولي فوري بالبيانات المتاحة\n" +
    "  new RatingWidget(sheetRating,{\n" +
    "    itemId:book.id, isArticle:false, voterId:voterId,\n" +
    "    initVote:cachedVote, initAvg:book.rating||0, initCount:book.ratingCount||0\n" +
    "  });\n" +
    "  // تحديث بصوت المستخدم الحقيقي من السيرفر في الخلفية\n" +
    "  apiFetch('/api/vote',{bookId:book.id,voterId:voterId}).then(function(res){\n" +
    "    if(res.stars!==undefined && res.stars!==cachedVote){\n" +
    "      // إعادة بناء الـ widget بالبيانات الصحيحة\n" +
    "      new RatingWidget(sheetRating,{\n" +
    "        itemId:book.id, isArticle:false, voterId:voterId,\n" +
    "        initVote:res.stars||0, initAvg:res.avg||book.rating||0, initCount:res.count||book.ratingCount||0\n" +
    "      });\n" +
    "    }\n" +
    "  }).catch(function(){});\n" +
    "}\n" +
    "\n" +
    "/* ── Article Reader ─────────────────────────────────────────── */\n" +
    "function openArticleReader(article){\n" +
    "  var overlay=$('articleReaderOverlay'), body=$('articleReaderBody'), delBtn=$('articleDeleteBtn'), editBtn=$('articleEditBtn');\n" +
    "  $('articleReaderTitle').textContent=article.title;\n" +
    "  var canEdit=(adminPass)||(currentUser&&article.author===currentUser.username);\n" +
    "  var canDelete=canEdit;\n" +
    "  delBtn.style.display=canDelete?'inline-block':'none';\n" +
    "  editBtn.style.display=canEdit?'inline-block':'none';\n" +
    "  delBtn.onclick=function(){ confirmDeleteArticle(article); };\n" +
    "  editBtn.onclick=function(){ showEditArticleModal(article); };\n" +
    "  var color=article.coverColor||'#c49a24', emoji=articleEmoji(article);\n" +
    "  var dateStr=article.created_at?new Date(article.created_at).toLocaleDateString('ar-SA',{year:'numeric',month:'long',day:'numeric'}):'';\n" +
    "  var tagsHtml=(article.tags||[]).map(function(t){ return '<span class=\"ac-tag\" style=\"font-size:12px;padding:3px 9px\">'+esc(t)+'</span>'; }).join('');\n" +
    "  var authorInitial=((article.authorDisplay||article.author||'?')[0]||'?').toUpperCase();\n" +
    "  var contentHtml=article.content||'';\n" +
    "  if(contentHtml&&!contentHtml.trim().startsWith('<')) contentHtml=mdToHtml(contentHtml);\n" +
    "  body.innerHTML=\n" +
    "    '<div class=\"art-hero\" style=\"background:linear-gradient(135deg,'+color+'33,'+color+'66)\"><span style=\"position:relative;z-index:1\">'+emoji+'</span></div>'+\n" +
    "    '<div class=\"art-content-wrap\">'+\n" +
    "      '<h1 class=\"art-title-big\">'+esc(article.title)+'</h1>'+\n" +
    "      '<div class=\"art-meta-row\"><div class=\"art-author-badge\"><div class=\"art-author-avatar\">'+esc(authorInitial)+'</div><span>'+esc(article.authorDisplay||article.author)+'</span></div><span class=\"art-date\">📅 '+dateStr+'</span></div>'+\n" +
    "      (tagsHtml?'<div class=\"art-tags-row\">'+tagsHtml+'</div>':'')+\n" +
    "      '<div class=\"art-body\">'+contentHtml+'</div>'+\n" +
    "      '<div id=\"artRatingBar\"><span style=\"color:var(--muted);font-size:12px;padding:14px 18px;display:block\">جارٍ تحميل التقييم…</span></div>'+\n" +
    "    '</div>';\n" +
    "  overlay.classList.remove('hidden');\n" +
    "  document.body.style.overflow='hidden';\n" +
    "  body.scrollTop=0;\n" +
    "  // تحميل تقييم المقالة\n" +
    "  var artVoterId=currentUser?currentUser.username:getAnonId();\n" +
    "  apiFetch('/api/vote',{articleId:article.id,voterId:artVoterId}).then(function(res){\n" +
    "    var bar=document.getElementById('artRatingBar');\n" +
    "    if(bar) new RatingWidget(bar,{\n" +
    "      itemId:article.id, isArticle:true, voterId:artVoterId,\n" +
    "      initVote:res.stars||0, initAvg:res.avg||article.rating||0, initCount:res.count||article.ratingCount||0\n" +
    "    });\n" +
    "  }).catch(function(){\n" +
    "    var bar=document.getElementById('artRatingBar');\n" +
    "    if(bar) new RatingWidget(bar,{\n" +
    "      itemId:article.id, isArticle:true, voterId:artVoterId,\n" +
    "      initVote:0, initAvg:article.rating||0, initCount:article.ratingCount||0\n" +
    "    });\n" +
    "  });\n" +
    "}\n" +
    "$('articleCloseBtn').addEventListener('click',function(){\n" +
    "  $('articleReaderOverlay').classList.add('hidden'); document.body.style.overflow='';\n" +
    "});\n" +
    "\n" +
    "function confirmDeleteArticle(article){\n" +
    "  if(!confirm('حذف المقالة \"'+article.title+'\"؟')) return;\n" +
    "  var body=adminPass?{articleId:article.id,password:adminPass}:{articleId:article.id,username:currentUser.username,password:currentUser.password};\n" +
    "  apiFetch('/api/article/delete',body).then(function(res){\n" +
    "    if(res.ok){ articlesData=articlesData.filter(function(a){ return a.id!==article.id; }); $('articleReaderOverlay').classList.add('hidden'); document.body.style.overflow=''; renderArticles(); toast('تم حذف المقالة','success'); }\n" +
    "    else toast(res.error||'فشل الحذف','error');\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Edit Article ───────────────────────────────────────────── */\n" +
    "function showEditArticleModal(article){\n" +
    "  if(!currentUser&&!adminPass){ toast('يجب تسجيل الدخول أولاً','error'); return; }\n" +
    "  var swatchesHtml=" + sw + ";\n" +
    "  var bd=mkModal(\n" +
    "    '<div class=\"modal-title\">✏️ تعديل المقالة <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">عنوان المقالة *</label><input type=\"text\" class=\"form-input\" id=\"artTitle\" value=\"'+esc(article.title)+'\"></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">ملخص قصير</label><input type=\"text\" class=\"form-input\" id=\"artSummary\" value=\"'+esc(article.summary||'')+'\"></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">الوسوم (مفصولة بفاصلة)</label><input type=\"text\" class=\"form-input\" id=\"artTags\" value=\"'+esc((article.tags||[]).join(', '))+'\"></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">لون الغلاف</label><div class=\"color-swatches\" id=\"colorSwatches\">'+swatchesHtml+'</div></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">محتوى المقالة *</label>'+\n" +
    "    '<div class=\"article-editor\">'+\n" +
    "      '<div class=\"editor-tabs\"><div class=\"editor-tab active\" id=\"edTabWrite\" data-etab=\"write\">✏️ كتابة</div><div class=\"editor-tab\" id=\"edTabPreview\" data-etab=\"preview\">👁 معاينة</div></div>'+\n" +
    "      '<div class=\"editor-toolbar\">'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"bold\"><b>ب</b></button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"italic\"><i>م</i></button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"underline\"><u>ت</u></button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"h1\">H1</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"h2\">H2</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"h3\">H3</button>'+\n" +
    "        '<span class=\"tb-sep\"></span>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"insertUnorderedList\">• قائمة</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"insertOrderedList\">1. قائمة</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"blockquote\">اقتباس</button>'+\n" +
    "      '</div>'+\n" +
    "      '<div id=\"editorWritePane\" class=\"rich-editor-wrap\"><div id=\"richEditor\" contenteditable=\"true\" data-placeholder=\"محتوى المقالة…\"></div><div class=\"char-count\" id=\"charCount\">0 حرف</div></div>'+\n" +
    "      '<div id=\"editorPreviewPane\" style=\"display:none\"><div class=\"art-body editor-preview\" id=\"editorPreviewContent\"></div></div>'+\n" +
    "    '</div></div>'+\n" +
    "    '<div class=\"modal-footer\"><button class=\"btn btn-ghost\" id=\"mCancel\">إلغاء</button><button class=\"btn btn-article\" id=\"mSave\">💾 حفظ التعديلات</button></div>'\n" +
    "  );\n" +
    "  var close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close);\n" +
    "  bd.querySelector('#mCancel').addEventListener('click',close);\n" +
    "  bd.addEventListener('click',function(e){ if(e.target===bd) close(); });\n" +
    "  // Set initial color\n" +
    "  var selectedColor=article.coverColor||ARTICLE_COLORS[0];\n" +
    "  bd.querySelectorAll('.color-swatch').forEach(function(sw){\n" +
    "    if(sw.dataset.color===selectedColor) sw.classList.add('selected');\n" +
    "    sw.addEventListener('click',function(){\n" +
    "      bd.querySelectorAll('.color-swatch').forEach(function(s){ s.classList.remove('selected'); });\n" +
    "      sw.classList.add('selected'); selectedColor=sw.dataset.color;\n" +
    "    });\n" +
    "  });\n" +
    "  // Pre-fill rich editor with existing content\n" +
    "  var richEditor=bd.querySelector('#richEditor');\n" +
    "  var existing=article.content||'';\n" +
    "  richEditor.innerHTML=existing.trim().startsWith('<')?existing:mdToHtml(existing);\n" +
    "  bd.querySelector('#charCount').textContent=(richEditor.innerText||'').length+' حرف';\n" +
    "  richEditor.addEventListener('input',function(){ bd.querySelector('#charCount').textContent=(richEditor.innerText||'').length+' حرف'; });\n" +
    "  // Toolbar\n" +
    "  bd.querySelectorAll('.tb-btn[data-cmd]').forEach(function(btn){\n" +
    "    btn.addEventListener('mousedown',function(e){ e.preventDefault(); document.execCommand(btn.dataset.cmd,false,btn.dataset.val||null); richEditor.focus(); });\n" +
    "  });\n" +
    "  // Preview tabs\n" +
    "  bd.querySelectorAll('.editor-tab[data-etab]').forEach(function(tab){\n" +
    "    tab.addEventListener('click',function(){\n" +
    "      var t=tab.dataset.etab, wp=bd.querySelector('#editorWritePane'), pp=bd.querySelector('#editorPreviewPane');\n" +
    "      var tw=bd.querySelector('#edTabWrite'), tp=bd.querySelector('#edTabPreview');\n" +
    "      if(t==='write'){ wp.style.display=''; pp.style.display='none'; tw.classList.add('active'); tp.classList.remove('active'); }\n" +
    "      else { wp.style.display='none'; pp.style.display=''; tw.classList.remove('active'); tp.classList.add('active'); bd.querySelector('#editorPreviewContent').innerHTML=richEditor.innerHTML; }\n" +
    "    });\n" +
    "  });\n" +
    "  bd.querySelector('#mSave').addEventListener('click',function(){\n" +
    "    var title=bd.querySelector('#artTitle').value.trim();\n" +
    "    var summary=bd.querySelector('#artSummary').value.trim();\n" +
    "    var tagsRaw=bd.querySelector('#artTags').value.trim();\n" +
    "    var content=richEditor.innerHTML.trim();\n" +
    "    var tags=tagsRaw?tagsRaw.split(',').map(function(t){ return t.trim(); }).filter(Boolean):[];\n" +
    "    if(!title){ toast('أدخل عنوان المقالة','error'); return; }\n" +
    "    if(!content||content==='<br>'){ toast('أدخل محتوى المقالة','error'); return; }\n" +
    "    var btn=bd.querySelector('#mSave'); btn.disabled=true; btn.textContent='جاري الحفظ…';\n" +
    "    var payload={articleId:article.id,title:title,summary:summary,tags:tags,content:content,coverColor:selectedColor};\n" +
    "    if(adminPass) payload.password=adminPass;\n" +
    "    else { payload.username=currentUser.username; payload.password=currentUser.password; }\n" +
    "    apiFetch('/api/article/update',payload).then(function(res){\n" +
    "      if(res.ok){\n" +
    "        // Update in-memory data\n" +
    "        var idx=articlesData.findIndex(function(a){ return a.id===article.id; });\n" +
    "        if(idx>=0){ articlesData[idx]=Object.assign({},articlesData[idx],{title:title,summary:summary,tags:tags,content:content,coverColor:selectedColor}); }\n" +
    "        // Refresh reader title\n" +
    "        var readerTitle=$('articleReaderTitle'); if(readerTitle) readerTitle.textContent=title;\n" +
    "        close(); renderArticles();\n" +
    "        // Re-open reader with updated data so user sees changes immediately\n" +
    "        var updated=idx>=0?articlesData[idx]:article;\n" +
    "        openArticleReader(updated);\n" +
    "        toast('تم حفظ التعديلات ✓','success');\n" +
    "      } else { toast(res.error||'فشل الحفظ','error'); btn.disabled=false; btn.textContent='💾 حفظ التعديلات'; }\n" +
    "    });\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Write Article ──────────────────────────────────────────── */\n" +
    "function showWriteArticleModal(){\n" +
    "  if(!currentUser&&!adminPass){ toast('يجب تسجيل الدخول أولاً','error'); return; }\n" +
    "  var swatchesHtml=" + sw + ";\n" +
    "  var bd=mkModal(\n" +
    "    '<div class=\"modal-title\">✍️ كتابة مقالة جديدة <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">عنوان المقالة *</label><input type=\"text\" class=\"form-input\" id=\"artTitle\" placeholder=\"اكتب عنواناً مميزاً…\"></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">ملخص قصير (اختياري)</label><input type=\"text\" class=\"form-input\" id=\"artSummary\" placeholder=\"وصف مختصر يظهر في البطاقة…\"></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">الوسوم (مفصولة بفاصلة)</label><input type=\"text\" class=\"form-input\" id=\"artTags\" placeholder=\"تكنولوجيا، علوم، أدب…\"></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">لون الغلاف</label><div class=\"color-swatches\" id=\"colorSwatches\">'+swatchesHtml+'</div></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">محتوى المقالة * <span style=\"color:var(--muted);font-weight:400\">(نص غني)</span></label>'+\n" +
    "    '<div class=\"article-editor\">'+\n" +
    "      '<div class=\"editor-tabs\"><div class=\"editor-tab active\" id=\"edTabWrite\" data-etab=\"write\">✏️ كتابة</div><div class=\"editor-tab\" id=\"edTabPreview\" data-etab=\"preview\">👁 معاينة</div></div>'+\n" +
    "      '<div class=\"editor-toolbar\">'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"bold\"><b>ب</b></button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"italic\"><i>م</i></button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"underline\"><u>ت</u></button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"h1\">H1</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"h2\">H2</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"h3\">H3</button>'+\n" +
    "        '<span class=\"tb-sep\"></span>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"insertUnorderedList\">• قائمة</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"insertOrderedList\">1. قائمة</button>'+\n" +
    "        '<button class=\"tb-btn\" data-cmd=\"formatBlock\" data-val=\"blockquote\">اقتباس</button>'+\n" +
    "        '<span class=\"tb-sep\"></span>'+\n" +
    "        '<button class=\"tb-btn\" id=\"edLinkBtn\">🔗 رابط</button>'+\n" +
    "        '<button class=\"tb-btn\" id=\"imgUploadBtn\" style=\"color:var(--accent)\">🖼 صورة</button>'+\n" +
    "        '<input type=\"file\" id=\"editorImgInput\" accept=\"image/*\" style=\"display:none\">'+\n" +
    "      '</div>'+\n" +
    "      '<div id=\"editorWritePane\" class=\"rich-editor-wrap\"><div id=\"richEditor\" contenteditable=\"true\" data-placeholder=\"اكتب مقالتك هنا… يمكنك نسخ ولصق وسحب الصور\"></div><div class=\"char-count\" id=\"charCount\">0 حرف</div></div>'+\n" +
    "      '<div id=\"editorPreviewPane\" style=\"display:none\"><div class=\"art-body editor-preview\" id=\"editorPreviewContent\"></div></div>'+\n" +
    "    '</div></div>'+\n" +
    "    '<div class=\"modal-footer\"><button class=\"btn btn-ghost\" id=\"mCancel\">إلغاء</button><button class=\"btn btn-article\" id=\"mPublish\">🚀 نشر المقالة</button></div>'\n" +
    "  );\n" +
    "  var close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close);\n" +
    "  bd.querySelector('#mCancel').addEventListener('click',close);\n" +
    "  bd.addEventListener('click',function(e){ if(e.target===bd) close(); });\n" +
    "  var selectedColor=ARTICLE_COLORS[0];\n" +
    "  bd.querySelector('#colorSwatches').querySelectorAll('.color-swatch').forEach(function(sw){\n" +
    "    if(sw.dataset.color===selectedColor) sw.classList.add('selected');\n" +
    "    sw.addEventListener('click',function(){\n" +
    "      bd.querySelectorAll('.color-swatch').forEach(function(s){ s.classList.remove('selected'); });\n" +
    "      sw.classList.add('selected'); selectedColor=sw.dataset.color;\n" +
    "    });\n" +
    "  });\n" +
    "  var richEditor=bd.querySelector('#richEditor'), imgInput=bd.querySelector('#editorImgInput'), selectedImg=null;\n" +
    "  richEditor.addEventListener('input',function(){ bd.querySelector('#charCount').textContent=(richEditor.innerText||'').length+' حرف'; });\n" +
    "\n" +
    "  // ربط أزرار toolbar بـ addEventListener (لا onclick)\n" +
    "  bd.querySelectorAll('.tb-btn[data-cmd]').forEach(function(btn){\n" +
    "    btn.addEventListener('mousedown',function(e){\n" +
    "      e.preventDefault(); // يمنع فقدان التحديد\n" +
    "      document.execCommand(btn.dataset.cmd, false, btn.dataset.val||null);\n" +
    "      richEditor.focus();\n" +
    "    });\n" +
    "  });\n" +
    "  // ربط تبويبات المحرر\n" +
    "  bd.querySelectorAll('.editor-tab[data-etab]').forEach(function(tab){\n" +
    "    tab.addEventListener('click',function(){\n" +
    "      var t=tab.dataset.etab;\n" +
    "      var wp=bd.querySelector('#editorWritePane'), pp=bd.querySelector('#editorPreviewPane');\n" +
    "      var tw=bd.querySelector('#edTabWrite'), tp=bd.querySelector('#edTabPreview');\n" +
    "      if(t==='write'){ wp.style.display=''; pp.style.display='none'; tw.classList.add('active'); tp.classList.remove('active'); }\n" +
    "      else { wp.style.display='none'; pp.style.display=''; tw.classList.remove('active'); tp.classList.add('active'); bd.querySelector('#editorPreviewContent').innerHTML=richEditor.innerHTML; }\n" +
    "    });\n" +
    "  });\n" +
    "  // رابط URL\n" +
    "  bd.querySelector('#edLinkBtn').addEventListener('mousedown',function(e){\n" +
    "    e.preventDefault();\n" +
    "    var url=prompt('رابط URL:'); if(!url) return;\n" +
    "    var text=prompt('نص الرابط:','اضغط هنا');\n" +
    "    document.execCommand('insertHTML',false,'<a href=\"'+url+'\" target=\"_blank\" rel=\"noopener\">'+esc(text||url)+'</a>');\n" +
    "    richEditor.focus();\n" +
    "  });\n" +
    "\n" +
    "  // Image toolbar\n" +
    "  var imgToolbar=document.createElement('div'); imgToolbar.className='img-toolbar'; imgToolbar.style.display='none';\n" +
    "  imgToolbar.innerHTML='<button id=\"imgSm\">🔽 صغير</button><button id=\"imgLg\">🔼 كبير</button><button id=\"imgRight\">⬅ يمين</button><button id=\"imgCenter\">↔ وسط</button><button id=\"imgLeft\">➡ يسار</button><button id=\"imgDel\" style=\"color:var(--danger)\">🗑 حذف</button>';\n" +
    "  bd.querySelector('#editorWritePane').appendChild(imgToolbar);\n" +
    "  function showImgToolbar(img){ imgToolbar.style.display='flex'; imgToolbar.style.top=(img.offsetTop-imgToolbar.offsetHeight-6)+'px'; imgToolbar.style.right='8px'; }\n" +
    "  function hideImgToolbar(){ imgToolbar.style.display='none'; }\n" +
    "  imgToolbar.querySelector('#imgSm').onclick=function(e){ e.stopPropagation(); if(selectedImg){ var w=parseInt(selectedImg.style.width)||100; selectedImg.style.width=(w>40?w-20:20)+'%'; showImgToolbar(selectedImg); } };\n" +
    "  imgToolbar.querySelector('#imgLg').onclick=function(e){ e.stopPropagation(); if(selectedImg){ var w=parseInt(selectedImg.style.width)||100; selectedImg.style.width=(w<100?w+20:100)+'%'; showImgToolbar(selectedImg); } };\n" +
    "  imgToolbar.querySelector('#imgRight').onclick=function(e){ e.stopPropagation(); if(selectedImg){ selectedImg.style.marginLeft='auto'; selectedImg.style.marginRight='0'; showImgToolbar(selectedImg); } };\n" +
    "  imgToolbar.querySelector('#imgCenter').onclick=function(e){ e.stopPropagation(); if(selectedImg){ selectedImg.style.margin='10px auto'; showImgToolbar(selectedImg); } };\n" +
    "  imgToolbar.querySelector('#imgLeft').onclick=function(e){ e.stopPropagation(); if(selectedImg){ selectedImg.style.marginLeft='0'; selectedImg.style.marginRight='auto'; showImgToolbar(selectedImg); } };\n" +
    "  imgToolbar.querySelector('#imgDel').onclick=function(e){ e.stopPropagation(); if(selectedImg){ selectedImg.remove(); hideImgToolbar(); selectedImg=null; } };\n" +
    "  richEditor.addEventListener('click',function(e){ if(!e.target.classList.contains('inserted-img')){ if(selectedImg){ selectedImg.classList.remove('selected'); selectedImg=null; } hideImgToolbar(); } });\n" +
    "  richEditor.addEventListener('dragover',function(e){ e.preventDefault(); richEditor.style.outline='2px dashed var(--accent)'; });\n" +
    "  richEditor.addEventListener('dragleave',function(){ richEditor.style.outline=''; });\n" +
    "  richEditor.addEventListener('drop',function(e){ e.preventDefault(); richEditor.style.outline=''; var files=e.dataTransfer.files; if(files&&files.length>0) uploadAndInsertImage(files[0]); });\n" +
    "  richEditor.addEventListener('paste',function(e){ var items=e.clipboardData&&e.clipboardData.items; if(!items) return; for(var i=0;i<items.length;i++){ if(items[i].type.startsWith('image/')){ e.preventDefault(); uploadAndInsertImage(items[i].getAsFile()); return; } } });\n" +
    "  bd.querySelector('#imgUploadBtn').addEventListener('click',function(){ imgInput.click(); });\n" +
    "  imgInput.addEventListener('change',function(){ if(imgInput.files[0]) uploadAndInsertImage(imgInput.files[0]); });\n" +
    "\n" +
    "  function uploadAndInsertImage(file){\n" +
    "    if(!file||!file.type.startsWith('image/')) return;\n" +
    "    toast('جارٍ رفع الصورة…','info');\n" +
    "    var ext=file.name.split('.').pop()||'jpg';\n" +
    "    var reader=new FileReader();\n" +
    "    reader.onload=function(e){\n" +
    "      var b64=e.target.result;\n" +
    "      var payload={imageBase64:b64,imageExt:ext};\n" +
    "      if(adminPass) payload.password=adminPass;\n" +
    "      else if(currentUser){ payload.username=currentUser.username; payload.password=currentUser.password; }\n" +
    "      else { insertImgInEditor(b64); return; }\n" +
    "      apiFetch('/api/article/upload-image',payload).then(function(res){\n" +
    "        if(res.ok){ insertImgInEditor(res.url); toast('تم رفع الصورة ✓','success'); } else insertImgInEditor(b64);\n" +
    "      }).catch(function(){ insertImgInEditor(b64); });\n" +
    "    };\n" +
    "    reader.readAsDataURL(file);\n" +
    "  }\n" +
    "  function insertImgInEditor(src){\n" +
    "    richEditor.focus();\n" +
    "    var img=document.createElement('img');\n" +
    "    img.src=src; img.className='inserted-img';\n" +
    "    img.style.cssText='max-width:100%;display:block;margin:10px auto;border-radius:8px;cursor:pointer;user-select:none;';\n" +
    "    img.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); if(selectedImg&&selectedImg!==img) selectedImg.classList.remove('selected'); selectedImg=img; img.classList.add('selected'); showImgToolbar(img); });\n" +
    "    img.draggable=true;\n" +
    "    img.addEventListener('dragstart',function(){ selectedImg=img; });\n" +
    "    var sel=window.getSelection();\n" +
    "    if(sel&&sel.rangeCount>0&&richEditor.contains(sel.anchorNode)){\n" +
    "      var range=sel.getRangeAt(0); range.deleteContents(); range.insertNode(img);\n" +
    "    } else { richEditor.appendChild(img); }\n" +
    "    bd.querySelector('#charCount').textContent=(richEditor.innerText||'').length+' حرف';\n" +
    "  }\n" +
    "\n" +
    "  bd.querySelector('#mPublish').addEventListener('click',function(){\n" +
    "    var title=bd.querySelector('#artTitle').value.trim();\n" +
    "    var summary=bd.querySelector('#artSummary').value.trim();\n" +
    "    var tagsRaw=bd.querySelector('#artTags').value.trim();\n" +
    "    var content=richEditor.innerHTML.trim();\n" +
    "    var tags=tagsRaw?tagsRaw.split(',').map(function(t){ return t.trim(); }).filter(Boolean):[];\n" +
    "    if(!title){ toast('أدخل عنوان المقالة','error'); return; }\n" +
    "    if(!content||content==='<br>'){ toast('أدخل محتوى المقالة','error'); return; }\n" +
    "    var btn=bd.querySelector('#mPublish'); btn.disabled=true; btn.textContent='جاري النشر…';\n" +
    "    var payload={title:title,summary:summary,tags:tags,content:content,coverColor:selectedColor};\n" +
    "    if(adminPass) payload.password=adminPass;\n" +
    "    else { payload.username=currentUser.username; payload.password=currentUser.password; }\n" +
    "    apiFetch('/api/article/create',payload).then(function(res){\n" +
    "      if(res.ok){\n" +
    "        close(); toast('تم نشر المقالة! 🎉','success');\n" +
    "        fetch('/api/articles').then(function(r){ return r.ok?r.json():articlesData; }).then(function(data){ articlesData=data; switchTab('articles'); renderArticles(); }).catch(function(){ switchTab('articles'); renderArticles(); });\n" +
    "      } else { toast(res.error||'فشل النشر','error'); btn.disabled=false; btn.textContent='🚀 نشر المقالة'; }\n" +
    "    });\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Markdown → HTML ────────────────────────────────────────── */\n" +
    "function mdToHtml(md){\n" +
    "  if(!md) return '';\n" +
    "  var html=escHtml(md);\n" +
    "  html=html.replace(/```([\\s\\S]*?)```/g,'<pre><code>$1</code></pre>');\n" +
    "  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');\n" +
    "  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');\n" +
    "  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');\n" +
    "  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');\n" +
    "  html=html.replace(/^---$/gm,'<hr>');\n" +
    "  html=html.replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>');\n" +
    "  html=html.replace(/\\*\\*\\*(.+?)\\*\\*\\*/g,'<strong><em>$1</em></strong>');\n" +
    "  html=html.replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>');\n" +
    "  html=html.replace(/\\*(.+?)\\*/g,'<em>$1</em>');\n" +
    "  html=html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g,'<a href=\"$2\" target=\"_blank\" rel=\"noopener\">$1</a>');\n" +
    "  html=html.replace(/((?:^- .+\\n?)+)/gm,function(match){ var items=match.trim().split('\\n').map(function(l){ return '<li>'+l.replace(/^- /,'')+'</li>'; }).join(''); return '<ul>'+items+'</ul>'; });\n" +
    "  html=html.replace(/((?:^\\d+\\. .+\\n?)+)/gm,function(match){ var items=match.trim().split('\\n').map(function(l){ return '<li>'+l.replace(/^\\d+\\. /,'')+'</li>'; }).join(''); return '<ol>'+items+'</ol>'; });\n" +
    "  html=html.split(/\\n{2,}/).map(function(block){ block=block.trim(); if(!block) return ''; if(/^<(h[1-3]|ul|ol|blockquote|hr|pre)/.test(block)) return block; return '<p>'+block.replace(/\\n/g,'<br>')+'</p>'; }).join('\\n');\n" +
    "  return html;\n" +
    "}\n" +
    "function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;'); }\n" +
    "\n" +
    "/* ── My Library ─────────────────────────────────────────────── */\n" +
    "function renderMyLib(){\n" +
    "  if(!currentUser) return;\n" +
    "  $('myLibHeading').textContent='مكتبة '+(currentUser.displayName||currentUser.username);\n" +
    "  var grid=$('myFoldersGrid'); grid.innerHTML='';\n" +
    "  var userInfo=SNAP.users[currentUser.username];\n" +
    "  if(!userInfo){ grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">📭</span>مكتبتك فارغة. أضف مجلداً للبدء!</div>'; return; }\n" +
    "  var folders=userInfo.folders||{}, keys=Object.keys(folders);\n" +
    "  if(!keys.length){ grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">📂</span>لا توجد مجلدات. أضف مجلداً!</div>'; return; }\n" +
    "  keys.forEach(function(k,i){\n" +
    "    var info=folders[k], card=document.createElement('div'); card.className='folder-card'; card.style.animationDelay=(i*50)+'ms';\n" +
    "    var cover=info.cover?rawUrl(info.cover):folderPlaceholder(k);\n" +
    "    card.innerHTML='<img class=\"fc-thumb\" src=\"'+cover+'\" alt=\"'+esc(k)+'\" loading=\"lazy\"><div class=\"fc-body\"><div class=\"fc-name\">'+esc(k)+'</div><div class=\"fc-meta\"><span class=\"fc-dot\"></span>'+info.books.length+' كتاب</div></div>';\n" +
    "    card.addEventListener('click',function(){ openFolderOverlay(k,info.books,'user',currentUser.username); });\n" +
    "    grid.appendChild(card);\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── User page ──────────────────────────────────────────────── */\n" +
    "function openUserPage(username){\n" +
    "  var userInfo=SNAP.users[username]; if(!userInfo) return;\n" +
    "  if(activeOverlay) activeOverlay.remove();\n" +
    "  var overlay=document.createElement('div'); overlay.className='overlay';\n" +
    "  var initial=((userInfo.displayName||username)[0]||'?').toUpperCase();\n" +
    "  overlay.innerHTML='<div class=\"ov-header\"><div class=\"ov-title\" style=\"display:flex;align-items:center;gap:10px\"><div style=\"width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dim),var(--gold));display:flex;align-items:center;justify-content:center;font-weight:900;color:#001520\">'+esc(initial)+'</div>'+esc(userInfo.displayName||username)+'</div><div class=\"ov-acts\"><button id=\"closeUserPage\" class=\"btn btn-ghost btn-sm\">✕ إغلاق</button></div></div><div class=\"ov-body\"><div class=\"folders-grid\" id=\"userPageFolders\"></div></div>';\n" +
    "  document.body.appendChild(overlay); activeOverlay=overlay;\n" +
    "  overlay.querySelector('#closeUserPage').addEventListener('click',function(){ overlay.remove(); activeOverlay=null; });\n" +
    "  var fgrid=overlay.querySelector('#userPageFolders');\n" +
    "  var folders=userInfo.folders||{}, keys=Object.keys(folders);\n" +
    "  if(!keys.length){ fgrid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">📭</span>لا توجد مجلدات</div>'; return; }\n" +
    "  keys.forEach(function(k,i){\n" +
    "    var info=folders[k], card=document.createElement('div'); card.className='folder-card'; card.style.animationDelay=(i*50)+'ms';\n" +
    "    var cover=info.cover?rawUrl(info.cover):folderPlaceholder(k);\n" +
    "    card.innerHTML='<img class=\"fc-thumb\" src=\"'+cover+'\" alt=\"'+esc(k)+'\" loading=\"lazy\"><div class=\"fc-body\"><div class=\"fc-name\">'+esc(k)+'</div><div class=\"fc-meta\"><span class=\"fc-dot\"></span>'+info.books.length+' كتاب</div></div>';\n" +
    "    card.addEventListener('click',function(){ openFolderOverlay(k,info.books,'user',username); });\n" +
    "    fgrid.appendChild(card);\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Folder overlay ─────────────────────────────────────────── */\n" +
    "function openFolderOverlay(folderName,books,namespace,ownerUsername){\n" +
    "  if(activeOverlay) activeOverlay.remove();\n" +
    "  var isMyFolder=namespace==='user'&&currentUser&&ownerUsername===currentUser.username;\n" +
    "  var isAdmin=namespace==='admin'&&adminPass;\n" +
    "  var overlay=document.createElement('div'); overlay.className='overlay';\n" +
    "  overlay.innerHTML=\n" +
    "    '<div class=\"ov-header\"><div class=\"ov-title\">'+esc(folderName)+'</div><div class=\"ov-acts\">'+\n" +
    "    (isMyFolder||isAdmin?'<button id=\"addBookBtn\" class=\"btn btn-success btn-sm\">＋ كتاب</button>':'')+\n" +
    "    (isMyFolder||isAdmin?'<button id=\"delFolBtn\" class=\"btn btn-danger btn-sm\">🗑 المجلد</button>':'')+\n" +
    "    '<button id=\"closeOv\" class=\"btn btn-ghost btn-sm\">✕ إغلاق</button></div></div>'+\n" +
    "    '<div class=\"ov-search-wrap\"><input id=\"bookSearch\" type=\"search\" placeholder=\"بحث في '+esc(folderName)+'…\" autocomplete=\"off\"></div>'+\n" +
    "    '<div class=\"ov-body\"><div class=\"books-grid\" id=\"booksGrid\"></div></div>';\n" +
    "  document.body.appendChild(overlay); activeOverlay=overlay;\n" +
    "  overlay.querySelector('#closeOv').addEventListener('click',function(){ overlay.remove(); activeOverlay=null; });\n" +
    "  overlay.querySelector('#bookSearch').addEventListener('input',function(e){ renderBooks(e.target.value.trim().toLowerCase()); });\n" +
    "  if(overlay.querySelector('#addBookBtn')) overlay.querySelector('#addBookBtn').addEventListener('click',function(){ if(isAdmin) showAddBookModal(folderName,'admin'); else if(isMyFolder) showAddBookModal(folderName,'user'); });\n" +
    "  if(overlay.querySelector('#delFolBtn')) overlay.querySelector('#delFolBtn').addEventListener('click',function(){ if(isAdmin) confirmDeleteFolder(folderName,books,'admin',null,overlay); else if(isMyFolder) confirmDeleteFolder(folderName,books,'user',currentUser.username,overlay); });\n" +
    "  function renderBooks(filter){\n" +
    "    filter=filter||''; var grid=overlay.querySelector('#booksGrid'); grid.innerHTML='';\n" +
    "    var filtered=filter?books.filter(function(b){ return b.name.toLowerCase().indexOf(filter)>=0||(b.author||'').toLowerCase().indexOf(filter)>=0||(b.desc||'').toLowerCase().indexOf(filter)>=0; }):books;\n" +
    "    if(!filtered.length){ grid.innerHTML='<div class=\"empty-state\"><span class=\"emoji\">📭</span>لا توجد كتب</div>'; return; }\n" +
    "    filtered.forEach(function(b,i){\n" +
    "      var card=document.createElement('div'); card.className='book-card'; card.style.animationDelay=(i*40)+'ms'; card._bookId=b.id;\n" +
    "      var cover=b.cover?rawUrl(b.cover):bookPlaceholder(b.name);\n" +
    "      card.innerHTML=\n" +
    "        '<img class=\"bk-thumb\" src=\"'+cover+'\" alt=\"'+esc(b.name)+'\" loading=\"lazy\">'+\n" +
    "        '<div class=\"bk-info\"><div class=\"bk-name\">'+esc(b.name)+'</div>'+\n" +
    "        (b.author?'<div class=\"bk-author\">'+esc(b.author)+'</div>':'')+\n" +
    "        (b.desc?'<div class=\"bk-desc\">'+esc(b.desc)+'</div>':'')+\n" +
    "        '<div class=\"bk-tags\">'+(b.year?'<span class=\"bk-tag\">'+esc(b.year)+'</span>':'')+(b.size?'<span class=\"bk-tag\">'+fmtSize(b.size)+'</span>':'')+'<span class=\"bk-tag bk-ext\">'+esc((b.fileExt||'bin').toUpperCase())+'</span>'+'<span class=\"bk-tag\">'+renderStarsStatic(b.rating)+' '+(b.rating?b.rating.toFixed(1):'—')+'</span></div></div>'+\n" +
    "        '<div class=\"bk-qa\"><button class=\"btn btn-primary btn-sm\" data-a=\"dl\">⬇️ تنزيل</button></div>';\n" +
    "      card.querySelector('[data-a=\"dl\"]').addEventListener('click',function(e){ e.stopPropagation(); downloadBook(b); });\n" +
    "      card.addEventListener('click',function(){ openSheet(b); });\n" +
    "      grid.appendChild(card);\n" +
    "    });\n" +
    "  }\n" +
    "  renderBooks();\n" +
    "  setTimeout(function(){ overlay.querySelector('#bookSearch').focus(); },80);\n" +
    "}\n" +
    "\n" +
    "/* ── Bottom sheet ───────────────────────────────────────────── */\n" +
    "function openSheet(book){\n" +
    "  currentBook=book;\n" +
    "  sheetImg.src=book.cover?rawUrl(book.cover):bookPlaceholder(book.name);\n" +
    "  sheetTitle.textContent=book.name;\n" +
    "  sheetAuthor.textContent=book.author?'✍️ '+book.author:'';\n" +
    "  sheetDesc.textContent=book.desc||'';\n" +
    "  var extLabel='<span style=\"display:inline-block;background:rgba(90,180,224,.15);color:var(--info);border-radius:4px;padding:1px 7px;font-size:11px;font-weight:700;margin-right:6px\">'+(book.fileExt||'bin').toUpperCase()+'</span>';\n" +
    "  sheetFolder.innerHTML=extLabel+(book.owner==='__admin__'?'🏛 ':'👤 ')+(book.owner==='__admin__'?'مجلد رسمي':esc(book.owner))+' › '+esc(book.folder);\n" +
    "  var mediaWrap=$('sheetMedia')||document.createElement('div');\n" +
    "  mediaWrap.id='sheetMedia'; mediaWrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;'; mediaWrap.innerHTML='';\n" +
    "  if(book.mediaFiles&&book.mediaFiles.length){\n" +
    "    book.mediaFiles.forEach(function(mf){\n" +
    "      if(['jpg','jpeg','png','webp','gif'].includes((mf.ext||'').toLowerCase())){\n" +
    "        var img=document.createElement('img'); img.src=rawUrl(mf.path);\n" +
    "        img.style.cssText='width:70px;height:70px;object-fit:cover;border-radius:8px;border:1px solid var(--border);cursor:pointer';\n" +
    "        img.onclick=function(){ window.open(rawUrl(mf.path),'_blank'); };\n" +
    "        mediaWrap.appendChild(img);\n" +
    "      } else {\n" +
    "        var btn=document.createElement('a'); btn.href=rawUrl(mf.path); btn.target='_blank';\n" +
    "        btn.style.cssText='width:70px;height:70px;background:var(--surface);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;text-decoration:none;font-size:20px;cursor:pointer';\n" +
    "        btn.innerHTML='🎬<span style=\"font-size:9px;color:var(--muted)\">فيديو</span>';\n" +
    "        mediaWrap.appendChild(btn);\n" +
    "      }\n" +
    "    });\n" +
    "    if(!$('sheetMedia')) sheetDesc.after(mediaWrap);\n" +
    "  }\n" +
    "  renderSheetRating(book);\n" +
    "  var canDelete=(adminPass&&book.owner==='__admin__')||(currentUser&&book.owner===currentUser.username);\n" +
    "  deleteBookBtn.classList.toggle('hidden',!canDelete);\n" +
    "  deleteBookBtn.onclick=function(){ confirmDeleteBook(book); };\n" +
    "  readBtn.onclick=function(){ sheet.classList.remove('show'); downloadBook(book); };\n" +
    "  downloadBtn.onclick=function(){ downloadBook(book); };\n" +
    "  sheet.classList.add('show');\n" +
    "}\n" +
    "$('sheetClose').addEventListener('click',function(){ sheet.classList.remove('show'); });\n" +
    "sheet.addEventListener('click',function(e){ if(e.target===sheet) sheet.classList.remove('show'); });\n" +
    "var ty0=0;\n" +
    "sheet.addEventListener('touchstart',function(e){ ty0=e.touches[0].clientY; },{passive:true});\n" +
    "sheet.addEventListener('touchend',function(e){ if(e.changedTouches[0].clientY-ty0>80) sheet.classList.remove('show'); },{passive:true});\n" +
    "\n" +
    "/* ── Live card update ─────────────────────────────────────────── */\n" +
    "function _updateBookCardInGrid(bookId,avg,count){\n" +
    "  var grids=[document.getElementById('topBooksGrid'),document.getElementById('booksGrid')];\n" +
    "  grids.forEach(function(g){\n" +
    "    if(!g) return;\n" +
    "    g.querySelectorAll('.top-book-card,.book-card').forEach(function(card){\n" +
    "      if(card._bookId!==bookId) return;\n" +
    "      var starsWrap=card.querySelector('.stars');\n" +
    "      if(starsWrap){\n" +
    "        var rounded=Math.round(avg||0);\n" +
    "        starsWrap.querySelectorAll('.star').forEach(function(st,i){ st.classList.toggle('filled',i<rounded); });\n" +
    "        var rv=starsWrap.querySelector('.rating-val'); if(rv) rv.textContent=avg?avg.toFixed(1):'—';\n" +
    "        var rc=starsWrap.querySelector('.rating-count'); if(rc) rc.textContent=count?'('+count+')':'';\n" +
    "      }\n" +
    "    });\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Download ───────────────────────────────────────────────── */\n" +
    "function downloadBook(book){\n" +
    "  var a=document.createElement('a'); a.href=rawUrl(book.path); a.download=book.name+'.'+(book.fileExt||'bin');\n" +
    "  document.body.appendChild(a); a.click(); a.remove();\n" +
    "}\n" +
    "\n" +
    "/* ── Search ─────────────────────────────────────────────────── */\n" +
    "var searchTimer=null;\n" +
    "searchInput.addEventListener('input',function(){\n" +
    "  clearTimeout(searchTimer);\n" +
    "  searchTimer=setTimeout(function(){\n" +
    "    var val=searchInput.value.trim().toLowerCase();\n" +
    "    var banner=$('searchBanner');\n" +
    "    if(val.length>=2){ banner.classList.add('show'); $('searchQuery').textContent=val; switchTab('home'); renderHome(val,window.getCurrentNsFilter?window.getCurrentNsFilter():''); }\n" +
    "    else { banner.classList.remove('show'); renderHome('',window.getCurrentNsFilter?window.getCurrentNsFilter():''); }\n" +
    "  },200);\n" +
    "});\n" +
    "$('clearSearch').addEventListener('click',function(){ searchInput.value=''; $('searchBanner').classList.remove('show'); renderHome(); });\n" +
    "\n" +
    "/* ── Account Menu ───────────────────────────────────────────── */\n" +
    "var accountMenuBtn=$('accountMenuBtn'), accountDropdown=$('accountDropdown'), acctOpen=false;\n" +
    "function toggleAccountMenu(e){ e.stopPropagation(); acctOpen=!acctOpen; accountDropdown.classList.toggle('open',acctOpen); if(acctOpen) updateAcctMenu(); }\n" +
    "function closeAccountMenu(){ acctOpen=false; accountDropdown.classList.remove('open'); }\n" +
    "function updateAcctMenu(){\n" +
    "  var info=$('acctUserInfo');\n" +
    "  if(adminPass&&currentUser) info.innerHTML='<strong style=\"color:var(--gold)\">👤 '+esc(currentUser.displayName||currentUser.username)+'</strong><br><span style=\"color:var(--gold-dim);font-size:11px\">🔑 مدير نشط</span>';\n" +
    "  else if(currentUser) info.innerHTML='<strong style=\"color:var(--gold)\">👤 '+esc(currentUser.displayName||currentUser.username)+'</strong><br><span style=\"font-size:11px\">@'+esc(currentUser.username)+'</span>';\n" +
    "  else if(adminPass) info.innerHTML='<strong style=\"color:var(--gold)\">🔑 المدير</strong><br><span style=\"font-size:11px;color:var(--muted)\">وضع الإدارة</span>';\n" +
    "  else info.innerHTML='<span style=\"color:var(--muted)\">غير مسجل الدخول</span>';\n" +
    "  $('acctUserBtn').style.display=currentUser?'none':'';\n" +
    "  $('acctAdminBtn').textContent=adminPass?'🔑 تسجيل خروج المدير':'🔑 دخول المدير';\n" +
    "  $('acctMyLib').classList.toggle('hidden',!currentUser);\n" +
    "  $('acctLogout').classList.toggle('hidden',!currentUser&&!adminPass);\n" +
    "  var aft=$('adminFoldersTab'); if(aft) aft.style.display=adminPass?'':'none';\n" +
    "  var ult=$('usersLibTab'); if(ult) ult.style.display=(adminPass||currentUser)?'':'none';\n" +
    "}\n" +
    "accountMenuBtn.addEventListener('click',toggleAccountMenu);\n" +
    "document.addEventListener('click',function(e){ if(acctOpen&&!accountMenuBtn.contains(e.target)&&!accountDropdown.contains(e.target)) closeAccountMenu(); });\n" +
    "$('acctUserBtn').addEventListener('click',function(){ closeAccountMenu(); showUserAuthModal(); });\n" +
    "$('acctAdminBtn').addEventListener('click',function(){\n" +
    "  closeAccountMenu();\n" +
    "  if(adminPass){ adminPass=null; clearAdminSession(); fab.classList.add('hidden'); adminBadge.classList.remove('show'); $('adminBtn').textContent='المدير'; $('writeArticleBtn').style.display='none'; toast('تم تسجيل خروج المدير','info'); updateAcctMenu(); }\n" +
    "  else showAdminLoginModal();\n" +
    "});\n" +
    "$('acctMyLib').addEventListener('click',function(){ closeAccountMenu(); switchTab('mylib'); });\n" +
    "$('acctLogout').addEventListener('click',function(){\n" +
    "  closeAccountMenu();\n" +
    "  if(currentUser){ currentUser=null; clearUserSession(); userBadgeWrap.innerHTML=''; $('myLibTab').style.display='none'; $('writeArticleBtn').style.display='none'; switchTab('home'); toast('تم تسجيل خروج المستخدم','info'); }\n" +
    "  if(adminPass){ adminPass=null; clearAdminSession(); fab.classList.add('hidden'); adminBadge.classList.remove('show'); $('writeArticleBtn').style.display='none'; }\n" +
    "  updateAcctMenu();\n" +
    "});\n" +
    "$('adminBtn').addEventListener('click',function(){\n" +
    "  if(adminPass){ adminPass=null; clearAdminSession(); fab.classList.add('hidden'); adminBadge.classList.remove('show'); $('adminBtn').textContent='المدير'; $('writeArticleBtn').style.display='none'; toast('تم تسجيل خروج المدير','info'); }\n" +
    "  else showAdminLoginModal();\n" +
    "});\n" +
    "\n" +
    "function showAdminLoginModal(){\n" +
    "  var bd=mkModal('<div class=\"modal-title\">دخول المدير <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div><div class=\"form-group\"><label class=\"form-label\">كلمة المرور</label><input type=\"password\" class=\"form-input\" id=\"adminPassIn\" placeholder=\"●●●●●●\" autocomplete=\"current-password\"></div><div class=\"modal-footer\"><button class=\"btn btn-ghost\" id=\"mCancel\">إلغاء</button><button class=\"btn btn-primary\" id=\"mConfirm\">دخول</button></div>');\n" +
    "  var passIn=bd.querySelector('#adminPassIn'), close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close); bd.querySelector('#mCancel').addEventListener('click',close);\n" +
    "  bd.addEventListener('click',function(e){ if(e.target===bd) close(); }); setTimeout(function(){ passIn.focus(); },50);\n" +
    "  var login=function(){\n" +
    "    var pass=passIn.value; if(!pass) return;\n" +
    "    fetch('/api/admin/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pass})})\n" +
    "    .then(function(r){ return r.json(); }).then(function(data){\n" +
    "      if(data.ok){ adminPass=pass; saveAdminSession(pass); fab.classList.remove('hidden'); adminBadge.classList.add('show'); $('adminBtn').textContent='خروج المدير'; close(); toast('مرحباً بك في لوحة المدير ✓','success'); updateAcctMenu(); }\n" +
    "      else { toast('كلمة مرور خاطئة','error'); passIn.value=''; passIn.focus(); }\n" +
    "    });\n" +
    "  };\n" +
    "  bd.querySelector('#mConfirm').addEventListener('click',login);\n" +
    "  passIn.addEventListener('keydown',function(e){ if(e.key==='Enter') login(); });\n" +
    "}\n" +
    "\n" +
    "/* ── User auth ──────────────────────────────────────────────── */\n" +
    "$('userBtn').addEventListener('click',function(){\n" +
    "  if(currentUser){ currentUser=null; clearUserSession(); userBadgeWrap.innerHTML=''; $('userBtn').textContent='دخول المستخدم'; $('myLibTab').style.display='none'; fab.classList.add('hidden'); $('writeArticleBtn').style.display='none'; switchTab('home'); toast('تم تسجيل الخروج','info'); }\n" +
    "  else showUserAuthModal();\n" +
    "});\n" +
    "function showUserAuthModal(){\n" +
    "  var bd=mkModal(\n" +
    "    '<div class=\"modal-title\">حساب المستخدم <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div>'+\n" +
    "    '<div style=\"display:flex;gap:8px;margin-bottom:16px\"><button class=\"btn btn-primary\" id=\"tabLogin\" style=\"flex:1\">دخول</button><button class=\"btn btn-ghost\" id=\"tabReg\" style=\"flex:1\">تسجيل حساب جديد</button></div>'+\n" +
    "    '<div id=\"loginForm\"><div class=\"form-group\"><label class=\"form-label\">اسم المستخدم</label><input type=\"text\" class=\"form-input\" id=\"uLoginName\" autocomplete=\"username\"></div><div class=\"form-group\"><label class=\"form-label\">كلمة المرور</label><input type=\"password\" class=\"form-input\" id=\"uLoginPass\" autocomplete=\"current-password\"></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" id=\"doLogin\">دخول</button></div></div>'+\n" +
    "    '<div id=\"regForm\" style=\"display:none\"><div class=\"form-group\"><label class=\"form-label\">اسم المستخدم (بالإنجليزية)*</label><input type=\"text\" class=\"form-input\" id=\"uRegName\" placeholder=\"my_library\" autocomplete=\"username\"></div><div class=\"form-group\"><label class=\"form-label\">الاسم المعروض</label><input type=\"text\" class=\"form-input\" id=\"uRegDisplay\" placeholder=\"مكتبة أحمد\"></div><div class=\"form-group\"><label class=\"form-label\">كلمة المرور*</label><input type=\"password\" class=\"form-input\" id=\"uRegPass\" autocomplete=\"new-password\"></div><div class=\"modal-footer\"><button class=\"btn btn-primary\" id=\"doRegister\">إنشاء الحساب</button></div></div>'\n" +
    "  );\n" +
    "  var close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close); bd.addEventListener('click',function(e){ if(e.target===bd) close(); });\n" +
    "  bd.querySelector('#tabLogin').addEventListener('click',function(){ bd.querySelector('#loginForm').style.display=''; bd.querySelector('#regForm').style.display='none'; bd.querySelector('#tabLogin').className='btn btn-primary'; bd.querySelector('#tabReg').className='btn btn-ghost'; });\n" +
    "  bd.querySelector('#tabReg').addEventListener('click',function(){ bd.querySelector('#loginForm').style.display='none'; bd.querySelector('#regForm').style.display=''; bd.querySelector('#tabLogin').className='btn btn-ghost'; bd.querySelector('#tabReg').className='btn btn-primary'; });\n" +
    "  bd.querySelector('#doLogin').addEventListener('click',function(){\n" +
    "    var username=bd.querySelector('#uLoginName').value.trim(), password=bd.querySelector('#uLoginPass').value;\n" +
    "    if(!username||!password){ toast('أدخل البيانات','error'); return; }\n" +
    "    apiFetch('/api/user/login',{username:username,password:password}).then(function(res){\n" +
    "      if(res.ok){ currentUser={username:res.username,password:password,displayName:res.displayName}; saveUserSession(currentUser); onUserLoggedIn(); close(); toast('مرحباً '+res.displayName+' ✓','success'); }\n" +
    "      else toast(res.error||'فشل الدخول','error');\n" +
    "    });\n" +
    "  });\n" +
    "  bd.querySelector('#doRegister').addEventListener('click',function(){\n" +
    "    var username=bd.querySelector('#uRegName').value.trim(), displayName=bd.querySelector('#uRegDisplay').value.trim(), password=bd.querySelector('#uRegPass').value;\n" +
    "    if(!username||!password){ toast('أدخل البيانات المطلوبة','error'); return; }\n" +
    "    apiFetch('/api/user/register',{username:username,password:password,displayName:displayName}).then(function(res){\n" +
    "      if(res.ok){ currentUser={username:res.username,password:password,displayName:res.displayName}; saveUserSession(currentUser); onUserLoggedIn(); close(); toast('تم إنشاء حسابك! مرحباً '+res.displayName,'success'); }\n" +
    "      else toast(res.error||'فشل التسجيل','error');\n" +
    "    });\n" +
    "  });\n" +
    "}\n" +
    "function onUserLoggedIn(){\n" +
    "  userBadgeWrap.innerHTML='<span class=\"user-badge\">👤 '+esc(currentUser.displayName||currentUser.username)+'</span>';\n" +
    "  $('userBtn').textContent='خروج'; $('myLibTab').style.display=''; fab.classList.remove('hidden');\n" +
    "  updateAcctMenu(); switchTab('mylib');\n" +
    "}\n" +
    "\n" +
    "/* ── Delete library ─────────────────────────────────────────── */\n" +
    "$('deleteLibraryBtn').addEventListener('click',function(){ if(currentUser) showDeleteLibraryModal(); });\n" +
    "function showDeleteLibraryModal(){\n" +
    "  var bd=mkModal(\n" +
    "    '<div class=\"modal-title\" style=\"color:var(--danger)\">⚠️ حذف المكتبة كاملاً <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div>'+\n" +
    "    '<p style=\"font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.8\">سيتم حذف <strong style=\"color:var(--text)\">جميع مجلداتك وكتبك</strong> نهائياً.</p>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">اكتب اسم المستخدم: <strong style=\"color:var(--gold)\">'+esc(currentUser?currentUser.username:'')+'</strong></label><input type=\"text\" class=\"form-input\" id=\"confirmNameIn\" placeholder=\"اكتب الاسم هنا\" autocomplete=\"off\" spellcheck=\"false\"></div>'+\n" +
    "    '<div class=\"modal-footer\"><button class=\"btn btn-ghost\" id=\"mCancel\">إلغاء</button><button class=\"btn btn-danger\" id=\"mDeleteLib\" disabled>حذف مكتبتي نهائياً 🗑</button></div>'\n" +
    "  );\n" +
    "  var nameIn=bd.querySelector('#confirmNameIn'), delBtn=bd.querySelector('#mDeleteLib'), close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close); bd.querySelector('#mCancel').addEventListener('click',close);\n" +
    "  bd.addEventListener('click',function(e){ if(e.target===bd) close(); }); setTimeout(function(){ nameIn.focus(); },50);\n" +
    "  nameIn.addEventListener('input',function(){ delBtn.disabled=nameIn.value.trim()!==(currentUser?currentUser.username:''); });\n" +
    "  delBtn.addEventListener('click',function(){\n" +
    "    if(nameIn.value.trim()!==(currentUser?currentUser.username:'')) return;\n" +
    "    delBtn.disabled=true; delBtn.textContent='جاري الحذف…';\n" +
    "    deleteEntireLibrary().then(function(){\n" +
    "      close(); currentUser=null; clearUserSession(); userBadgeWrap.innerHTML=''; $('userBtn').textContent='دخول المستخدم';\n" +
    "      $('myLibTab').style.display='none'; fab.classList.add('hidden'); switchTab('users'); toast('تم حذف مكتبتك بالكامل','success');\n" +
    "    }).catch(function(e){ toast('خطأ: '+e.message,'error'); delBtn.disabled=false; delBtn.textContent='حذف مكتبتي نهائياً 🗑'; });\n" +
    "  });\n" +
    "}\n" +
    "function deleteEntireLibrary(){\n" +
    "  var uname=currentUser.username, userInfo=SNAP.users[uname], paths=[];\n" +
    "  if(userInfo){\n" +
    "    Object.values(userInfo.folders||{}).forEach(function(folder){\n" +
    "      (folder.books||[]).forEach(function(book){ paths.push(book.path); if(book.cover) paths.push(book.cover); paths.push('_users/'+uname+'/'+folder.name+'/'+book.name+'__meta.json'); });\n" +
    "      paths.push('_users/'+uname+'/'+folder.name+'/.gitkeep');\n" +
    "    });\n" +
    "  }\n" +
    "  paths.push('_users/'+uname+'__profile.json');\n" +
    "  return Promise.allSettled(paths.map(function(p){ return apiFetch('/api/user/delete',{username:currentUser.username,password:currentUser.password,path:p}); }));\n" +
    "}\n" +
    "\n" +
    "/* ── Add folder ─────────────────────────────────────────────── */\n" +
    "function showAddFolderModal(type){\n" +
    "  var bd=mkModal('<div class=\"modal-title\">مجلد جديد <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div><div class=\"form-group\"><label class=\"form-label\">اسم المجلد</label><input type=\"text\" class=\"form-input\" id=\"folNameIn\" placeholder=\"مثال: البرمجة باستخدام بايثون\"></div><div class=\"modal-footer\"><button class=\"btn btn-ghost\" id=\"mCancel\">إلغاء</button><button class=\"btn btn-primary\" id=\"mCreate\">إنشاء</button></div>');\n" +
    "  var nameIn=bd.querySelector('#folNameIn'), close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close); bd.querySelector('#mCancel').addEventListener('click',close);\n" +
    "  bd.addEventListener('click',function(e){ if(e.target===bd) close(); }); setTimeout(function(){ nameIn.focus(); },50);\n" +
    "  var create=function(){\n" +
    "    var name=nameIn.value.trim(); if(!name){ toast('أدخل اسم المجلد','error'); return; }\n" +
    "    var p=type==='admin'?apiFetch('/api/admin/create-folder',{password:adminPass,name:name}):apiFetch('/api/user/create-folder',{username:currentUser.username,password:currentUser.password,name:name});\n" +
    "    p.then(function(res){ if(res.ok){ toast(res.message||'تم ✓','success'); close(); refreshIndex(); } else toast(res.error||'فشل','error'); });\n" +
    "  };\n" +
    "  bd.querySelector('#mCreate').addEventListener('click',create);\n" +
    "  nameIn.addEventListener('keydown',function(e){ if(e.key==='Enter') create(); });\n" +
    "}\n" +
    "window.showAddFolderModal=showAddFolderModal;\n" +
    "\n" +
    "/* ── Add book ───────────────────────────────────────────────── */\n" +
    "function showAddBookModal(folder,type){\n" +
    "  var bd=mkModal(\n" +
    "    '<div class=\"modal-title\">إضافة ملف ← '+esc(folder)+' <button class=\"btn btn-ghost btn-sm\" id=\"mClose\">✕</button></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">اسم الملف / العنوان *</label><input type=\"text\" class=\"form-input\" id=\"bkName\" placeholder=\"عنوان الملف\"></div>'+\n" +
    "    '<div class=\"form-row\"><div class=\"form-group\"><label class=\"form-label\">المؤلف / المصدر</label><input type=\"text\" class=\"form-input\" id=\"bkAuthor\"></div><div class=\"form-group\"><label class=\"form-label\">السنة</label><input type=\"text\" class=\"form-input\" id=\"bkYear\" placeholder=\"2024\"></div></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">وصف تفصيلي</label><textarea class=\"form-textarea\" id=\"bkDesc\" placeholder=\"اكتب وصفاً للملف…\" style=\"min-height:90px\"></textarea></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">الملف الرئيسي * <span style=\"color:var(--muted);font-size:11px\">(أي نوع: PDF, EXE, DOCX, PY, CPP, MP4…)</span></label><div class=\"file-drop\" id=\"pdfDrop\"><input type=\"file\" id=\"pdfFile\"><div id=\"pdfLbl\">اسحب الملف هنا أو انقر 📁</div></div></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">صورة الغلاف (اختياري)</label><div class=\"file-drop\" id=\"covDrop\"><input type=\"file\" id=\"covFile\" accept=\"image/*\"><div id=\"covLbl\">صورة الغلاف 🖼</div></div></div>'+\n" +
    "    '<div class=\"form-group\"><label class=\"form-label\">صور / فيديوهات توضيحية <span style=\"color:var(--muted);font-size:11px\">(اختياري، حتى 5 ملفات)</span></label><div class=\"file-drop\" id=\"mediaDrop\" style=\"min-height:60px\"><input type=\"file\" id=\"mediaFiles\" accept=\"image/*,video/*\" multiple><div id=\"mediaLbl\">اسحب الصور/الفيديوهات هنا 🎬</div></div><div id=\"mediaPreview\" style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:8px\"></div></div>'+\n" +
    "    '<div id=\"upProg\" style=\"display:none;font-size:12px;color:var(--muted);padding:6px 0\">جاري الرفع…</div>'+\n" +
    "    '<div class=\"modal-footer\"><button class=\"btn btn-ghost\" id=\"mCancel\">إلغاء</button><button class=\"btn btn-primary\" id=\"mUpload\">رفع ⬆️</button></div>'\n" +
    "  );\n" +
    "  var close=function(){ bd.remove(); };\n" +
    "  bd.querySelector('#mClose').addEventListener('click',close); bd.querySelector('#mCancel').addEventListener('click',close);\n" +
    "  bd.addEventListener('click',function(e){ if(e.target===bd) close(); });\n" +
    "  setupDrop(bd.querySelector('#pdfDrop'),bd.querySelector('#pdfFile'),bd.querySelector('#pdfLbl'));\n" +
    "  setupDrop(bd.querySelector('#covDrop'),bd.querySelector('#covFile'),bd.querySelector('#covLbl'));\n" +
    "  var mediaInput=bd.querySelector('#mediaFiles'), mediaPreview=bd.querySelector('#mediaPreview'), mediaDrop=bd.querySelector('#mediaDrop'), mediaLbl=bd.querySelector('#mediaLbl');\n" +
    "  var allMediaFiles=[];\n" +
    "  function addMediaFiles(newFiles){\n" +
    "    for(var i=0;i<newFiles.length;i++){\n" +
    "      if(allMediaFiles.length>=5) break;\n" +
    "      var f=newFiles[i], dup=allMediaFiles.some(function(x){ return x.name===f.name&&x.size===f.size; });\n" +
    "      if(!dup) allMediaFiles.push(f);\n" +
    "    }\n" +
    "    updateMediaPreviews(allMediaFiles);\n" +
    "  }\n" +
    "  mediaDrop.addEventListener('click',function(){ mediaInput.click(); });\n" +
    "  mediaDrop.addEventListener('dragover',function(e){ e.preventDefault(); mediaDrop.style.background='rgba(0,212,255,.15)'; });\n" +
    "  mediaDrop.addEventListener('dragleave',function(){ mediaDrop.style.background=''; });\n" +
    "  mediaDrop.addEventListener('drop',function(e){ e.preventDefault(); mediaDrop.style.background=''; if(e.dataTransfer.files.length) addMediaFiles(e.dataTransfer.files); });\n" +
    "  mediaInput.addEventListener('change',function(){ if(mediaInput.files.length) addMediaFiles(mediaInput.files); mediaInput.value=''; });\n" +
    "  function updateMediaPreviews(files){\n" +
    "    mediaPreview.innerHTML='';\n" +
    "    var count=Math.min(files.length,5);\n" +
    "    mediaLbl.textContent=count+' ملف توضيحي'+(count>=5?' (الحد الأقصى)':'');\n" +
    "    for(var i=0;i<count;i++){\n" +
    "      (function(f,idx){\n" +
    "        var wrap=document.createElement('div'); wrap.style.cssText='position:relative;display:inline-block';\n" +
    "        var removeBtn=document.createElement('button');\n" +
    "        removeBtn.textContent='✕'; removeBtn.style.cssText='position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:var(--danger);color:#fff;border:none;cursor:pointer;font-size:10px;line-height:18px;padding:0;z-index:1';\n" +
    "        removeBtn.onclick=function(e){ e.stopPropagation(); allMediaFiles.splice(idx,1); updateMediaPreviews(allMediaFiles); };\n" +
    "        if(f.type.startsWith('image/')){\n" +
    "          var img=document.createElement('img'); img.style.cssText='width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid var(--border);display:block';\n" +
    "          var fr=new FileReader(); fr.onload=function(ev){ img.src=ev.target.result; }; fr.readAsDataURL(f);\n" +
    "          wrap.appendChild(img);\n" +
    "        } else {\n" +
    "          var d=document.createElement('div'); d.style.cssText='width:60px;height:60px;background:var(--surface);border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:20px';\n" +
    "          d.textContent='🎬'; wrap.appendChild(d);\n" +
    "        }\n" +
    "        wrap.appendChild(removeBtn); mediaPreview.appendChild(wrap);\n" +
    "      })(files[i],i);\n" +
    "    }\n" +
    "  }\n" +
    "  bd.querySelector('#mUpload').addEventListener('click',function(){\n" +
    "    var name=bd.querySelector('#bkName').value.trim(), mainFile=bd.querySelector('#pdfFile').files[0];\n" +
    "    if(!name){ toast('أدخل اسم الملف','error'); return; } if(!mainFile){ toast('اختر الملف الرئيسي','error'); return; }\n" +
    "    bd.querySelector('#upProg').style.display=''; bd.querySelector('#mUpload').disabled=true;\n" +
    "    var fileExt=(mainFile.name.match(/\\.([^.]+)$/)||['','bin'])[1].toLowerCase();\n" +
    "    toB64(mainFile).then(function(fileBase64){\n" +
    "      var covFile=bd.querySelector('#covFile').files[0];\n" +
    "      return (covFile?toB64(covFile):Promise.resolve(null)).then(function(covBase64){\n" +
    "        var mFiles=allMediaFiles.slice(0,5);\n" +
    "        return Promise.all(mFiles.map(function(f){ var mExt=(f.name.match(/\\.([^.]+)$/)||['','bin'])[1].toLowerCase(); return toB64(f).then(function(b64){ return {base64:b64,name:f.name,ext:mExt}; }); })).then(function(mediaFiles){\n" +
    "          var body={folder:folder,name:name,author:bd.querySelector('#bkAuthor').value.trim(),year:bd.querySelector('#bkYear').value.trim(),desc:bd.querySelector('#bkDesc').value.trim(),fileBase64:fileBase64,fileExt:fileExt,mediaFiles:mediaFiles};\n" +
    "          if(covBase64) body.coverBase64=covBase64;\n" +
    "          var p=type==='admin'?apiFetch('/api/admin/upload-book',Object.assign({password:adminPass},body)):apiFetch('/api/user/upload-book',Object.assign({username:currentUser.username,password:currentUser.password},body));\n" +
    "          return p;\n" +
    "        });\n" +
    "      });\n" +
    "    }).then(function(res){\n" +
    "      if(res.ok){ toast(res.message||'تم الرفع ✓','success'); close(); refreshIndex(); }\n" +
    "      else toast(res.error||'فشل الرفع','error');\n" +
    "    }).catch(function(e){ toast('خطأ: '+e.message,'error'); })\n" +
    "    .finally(function(){ bd.querySelector('#upProg').style.display='none'; bd.querySelector('#mUpload').disabled=false; });\n" +
    "  });\n" +
    "}\n" +
    "\n" +
    "/* ── Delete book / folder ───────────────────────────────────── */\n" +
    "var _deleteInProgress = false; // منع الضغط المزدوج\n" +
    "function confirmDeleteBook(book){\n" +
    "  if(_deleteInProgress){ toast('جارٍ تنفيذ عملية سابقة…','info'); return; }\n" +
    "  if(!confirm('حذف الملف \"'+book.name+'\"؟')) return;\n" +
    "  var isAdmin=book.owner==='__admin__';\n" +
    "  if(isAdmin && !adminPass){ toast('يجب تسجيل دخول المدير','error'); return; }\n" +
    "  if(!isAdmin && !currentUser){ toast('يجب تسجيل الدخول','error'); return; }\n" +
    "  _deleteInProgress=true;\n" +
    "  var delFn=function(path){\n" +
    "    return isAdmin\n" +
    "      ? apiFetch('/api/admin/delete',{password:adminPass,path:path})\n" +
    "      : apiFetch('/api/user/delete',{username:currentUser.username,password:currentUser.password,path:path});\n" +
    "  };\n" +
    "  toast('جارٍ الحذف…','info');\n" +
    "  delFn(book.path).then(function(res){\n" +
    "    if(res && res.error && res.error!=='تم الحذف'){\n" +
    "      toast('فشل الحذف: '+res.error,'error'); return;\n" +
    "    }\n" +
    "    var extraPaths=[];\n" +
    "    if(book.cover) extraPaths.push(book.cover);\n" +
    "    var base=book.path.replace(/\\.[^.]+$/,'');\n" +
    "    extraPaths.push(base+'__meta.json');\n" +
    "    ['__cover.jpg','__cover.jpeg','__cover.png','__cover.webp'].forEach(function(s){ extraPaths.push(base+s); });\n" +
    "    if(book.mediaFiles) book.mediaFiles.forEach(function(mf){ if(mf.path) extraPaths.push(mf.path); });\n" +
    "    Promise.allSettled(extraPaths.map(delFn));\n" +
    "    toast('تم الحذف بنجاح ✓','success');\n" +
    "    sheet.classList.remove('show');\n" +
    "    refreshIndex();\n" +
    "  }).catch(function(e){ toast('فشل الحذف: '+(e.message||e),'error'); })\n" +
    "  .finally(function(){ _deleteInProgress=false; });\n" +
    "}\n" +
    "function confirmDeleteFolder(folderName,books,namespace,ownerUsername,overlay){\n" +
    "  if(_deleteInProgress){ toast('جارٍ تنفيذ عملية سابقة…','info'); return; }\n" +
    "  if(!confirm('حذف المجلد \"'+folderName+'\" وكل محتوياته؟')) return;\n" +
    "  if(namespace==='admin' && !adminPass){ toast('يجب تسجيل دخول المدير','error'); return; }\n" +
    "  if(namespace==='user' && !currentUser){ toast('يجب تسجيل الدخول','error'); return; }\n" +
    "  _deleteInProgress=true;\n" +
    "  var prefix=namespace==='admin'?'_admin/'+folderName:'_users/'+ownerUsername+'/'+folderName;\n" +
    "  var paths=[];\n" +
    "  (books||[]).forEach(function(b){\n" +
    "    paths.push(b.path); if(b.cover) paths.push(b.cover);\n" +
    "    var base=b.path.replace(/\\.[^.]+$/,''); paths.push(base+'__meta.json');\n" +
    "    ['__cover.jpg','__cover.jpeg','__cover.png','__cover.webp'].forEach(function(suf){ paths.push(base+suf); });\n" +
    "    if(b.mediaFiles) b.mediaFiles.forEach(function(mf){ if(mf.path) paths.push(mf.path); });\n" +
    "  });\n" +
    "  paths.push(prefix+'/.gitkeep');\n" +
    "  var delFn=function(path){ return namespace==='admin'?apiFetch('/api/admin/delete',{password:adminPass,path:path}):apiFetch('/api/user/delete',{username:currentUser.username,password:currentUser.password,path:path}); };\n" +
    "  toast('جارٍ حذف المجلد…','info');\n" +
    "  Promise.allSettled(paths.map(delFn)).then(function(){\n" +
    "    toast('تم حذف المجلد بنجاح ✓','success');\n" +
    "    if(overlay){ overlay.remove(); activeOverlay=null; }\n" +
    "    refreshIndex();\n" +
    "  }).finally(function(){ _deleteInProgress=false; });\n" +
    "}\n" +
    "\n" +
    "/* ── Helpers ────────────────────────────────────────────────── */\n" +
    "function rawUrl(path){ return RAW+'/'+encodeURIComponent(path); }\n" +
    "function folderPlaceholder(text){\n" +
    "  var hue=hashStr(text);\n" +
    "  var svg=['<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"225\">','<defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">','<stop offset=\"0%\" stop-color=\"hsl('+hue+',25%,7%)\"/>','<stop offset=\"100%\" stop-color=\"hsl('+hue+',30%,11%)\"/>','</linearGradient></defs>','<rect width=\"100%\" height=\"100%\" fill=\"url(#g)\"/>','<text x=\"50%\" y=\"52%\" fill=\"hsl('+hue+',50%,60%)\" font-size=\"20\" font-family=\"serif\" text-anchor=\"middle\" dominant-baseline=\"middle\" opacity=\".85\">'+esc(text)+'</text>','</svg>'].join('');\n" +
    "  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);\n" +
    "}\n" +
    "function bookPlaceholder(text){\n" +
    "  var hue=hashStr(text);\n" +
    "  var svg=['<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 160 160\">','<defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">','<stop offset=\"0%\" stop-color=\"hsl('+hue+',30%,8%)\"/>','<stop offset=\"100%\" stop-color=\"hsl('+hue+',35%,14%)\"/>','</linearGradient></defs>','<rect width=\"100%\" height=\"100%\" fill=\"url(#g)\"/>','<rect x=\"8\" y=\"8\" width=\"144\" height=\"144\" fill=\"none\" rx=\"8\" stroke=\"hsl('+hue+',40%,35%)\" stroke-width=\"1\" opacity=\".5\"/>','<text x=\"50%\" y=\"48%\" fill=\"hsl('+hue+',50%,65%)\" font-size=\"30\" font-family=\"serif\" text-anchor=\"middle\" dominant-baseline=\"middle\" opacity=\".6\">📄</text>','<text x=\"50%\" y=\"72%\" fill=\"hsl('+hue+',50%,65%)\" font-size=\"10\" font-family=\"sans-serif\" text-anchor=\"middle\" dominant-baseline=\"middle\" opacity=\".8\">'+esc(text.slice(0,14))+'</text>','</svg>'].join('');\n" +
    "  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);\n" +
    "}\n" +
    "function renderStarsStatic(rating){\n" +
    "  var v=parseFloat(rating)||0;\n" +
    "  return [1,2,3,4,5].map(function(s){\n" +
    "    var pct=Math.round(Math.max(0,Math.min(1,v-(s-1)))*100);\n" +
    "    return '<span class=\"star-disp\" style=\"--pct:'+pct+'%;font-size:12px;pointer-events:none\">★</span>';\n" +
    "  }).join('');\n" +
    "}\n" +
    "function hashStr(str){\n" +
    "  var h=5381;\n" +
    "  for(var i=0;i<str.length;i++){ h=((h<<5)+h)+str.charCodeAt(i); h=h&h; }\n" +
    "  return (h>>>0)%360;\n" +
    "}\n" +
    "function esc(s){ return String(s||'').replace(/[&<>\"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[m]; }); }\n" +
    "function fmtSize(bytes){ if(!bytes) return ''; if(bytes<1024*1024) return (bytes/1024).toFixed(0)+' KB'; return (bytes/1024/1024).toFixed(1)+' MB'; }\n" +
    "function toB64(file){ return new Promise(function(res,rej){ var r=new FileReader(); r.onload=function(){ res(r.result); }; r.onerror=function(){ rej(new Error('فشل قراءة الملف')); }; r.readAsDataURL(file); }); }\n" +
    "function mkModal(innerHTML){ var bd=document.createElement('div'); bd.className='modal-backdrop'; bd.innerHTML='<div class=\"modal\">'+innerHTML+'</div>'; document.body.appendChild(bd); return bd; }\n" +
    "function setupDrop(zone,input,label){\n" +
    "  zone.addEventListener('click',function(){ input.click(); });\n" +
    "  input.addEventListener('change',function(){ if(input.files[0]){ label.textContent='✓ '+input.files[0].name; zone.classList.add('has-file'); } });\n" +
    "  zone.addEventListener('dragover',function(e){ e.preventDefault(); zone.style.background='rgba(0,212,255,.15)'; });\n" +
    "  zone.addEventListener('dragleave',function(){ zone.style.background=''; });\n" +
    "  zone.addEventListener('drop',function(e){ e.preventDefault(); zone.style.background=''; var f=e.dataTransfer.files[0]; if(f){ var dt=new DataTransfer(); dt.items.add(f); input.files=dt.files; label.textContent='✓ '+f.name; zone.classList.add('has-file'); } });\n" +
    "}\n" +
    "function apiFetch(path,body){ return fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){ return r.json(); }).catch(function(){ return {error:'خطأ في الاتصال'}; }); }\n" +
    "function toast(msg,type){\n" +
    "  type=type||'info';\n" +
    "  var colors={success:'var(--success)',error:'var(--danger)',info:'var(--info)'},icons={success:'✓',error:'✗',info:'ℹ'};\n" +
    "  var el=document.createElement('div'); el.className='toast '+type;\n" +
    "  el.innerHTML='<span style=\"color:'+colors[type]+';font-weight:700\">'+icons[type]+'</span> '+esc(msg);\n" +
    "  $('toastWrap').appendChild(el);\n" +
    "  setTimeout(function(){ el.style.animation='toastOut .3s ease forwards'; setTimeout(function(){ el.remove(); },300); },3500);\n" +
    "}\n" +
    "function openPdfReader(book){ downloadBook(book); }\n" +
    "function getAnonId(){\n" +
    "  try{ var id=localStorage.getItem('gl_anon'); if(!id){ id='anon_'+Math.random().toString(36).slice(2,10); localStorage.setItem('gl_anon',id); } return id; }\n" +
    "  catch(e){ if(!window.__anonId) window.__anonId='anon_'+Math.random().toString(36).slice(2); return window.__anonId; }\n" +
    "}\n" +
    "\n" +
    "document.addEventListener('keydown',function(e){\n" +
    "  if(!$('articleReaderOverlay').classList.contains('hidden')){ if(e.key==='Escape') $('articleCloseBtn').click(); return; }\n" +
    "  if(e.key==='Escape'){\n" +
    "    if(sheet.classList.contains('show')){ sheet.classList.remove('show'); return; }\n" +
    "    if(activeOverlay){ activeOverlay.remove(); activeOverlay=null; }\n" +
    "  }\n" +
    "  if(e.key==='/'&&document.activeElement!==searchInput){ e.preventDefault(); searchInput.focus(); }\n" +
    "});\n" +
    "\n" +
    "/* ── ربط التنقل ─────────────────────────────────────────────── */\n" +
    "// Nav tabs\n" +
    "document.querySelectorAll('.nav-tab[data-tab]').forEach(function(el){\n" +
    "  el.addEventListener('click',function(){ switchTab(el.getAttribute('data-tab')); });\n" +
    "});\n" +
    "// شعار الموقع → الرئيسية\n" +
    "var hBrand=$('hBrand'); if(hBrand) hBrand.addEventListener('click',function(){ switchTab('home'); });\n" +
    "// زر إضافة مجلد في مكتبتي\n" +
    "var addFolderMyLib=$('addFolderMyLib');\n" +
    "if(addFolderMyLib) addFolderMyLib.addEventListener('click',function(){ showAddFolderModal('user'); });\n" +
    "\n" +
    "/* ── Initial render ─────────────────────────────────────────── */\n" +
    "try{ renderHome(); }catch(e){ console.error('[GL] renderHome FAILED',e); }\n" +
    "try{ renderAdminFolders(); }catch(e){ console.error('[GL] renderAdminFolders FAILED',e); }\n" +
    "try{ renderUsers(); }catch(e){ console.error('[GL] renderUsers FAILED',e); }\n" +
    "try{ renderArticles(); }catch(e){ console.error('[GL] renderArticles FAILED',e); }\n" +
    "\n" +
    "/* ── Restore sessions ───────────────────────────────────────── */\n" +
    "(function restoreSessions(){\n" +
    "  var savedAdmin=loadAdminSession();\n" +
    "  if(savedAdmin){\n" +
    "    fetch('/api/admin/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:savedAdmin})})\n" +
    "      .then(function(r){ return r.json(); }).then(function(data){\n" +
    "        if(data.ok){ adminPass=savedAdmin; fab.classList.remove('hidden'); adminBadge.classList.add('show'); $('adminBtn').textContent='خروج المدير'; updateAcctMenu(); }\n" +
    "        else if(data.ok===false) clearAdminSession();\n" +
    "      }).catch(function(){});\n" +
    "  }\n" +
    "  var savedUser=loadUserSession();\n" +
    "  if(savedUser){\n" +
    "    fetch('/api/user/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:savedUser.username,password:savedUser.password})})\n" +
    "      .then(function(r){ return r.json(); }).then(function(res){\n" +
    "        if(res.ok){ currentUser={username:res.username,password:savedUser.password,displayName:res.displayName}; saveUserSession(currentUser); onUserLoggedIn(); }\n" +
    "        else if(res.error==='المستخدم غير موجود'||res.error==='كلمة مرور خاطئة') clearUserSession();\n" +
    "      }).catch(function(){});\n" +
    "  }\n" +
    "})();\n" +
    "\n" +
    "})();\n" +
    "" +
  "<\/script>";
}
//
