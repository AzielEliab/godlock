/**
 * GodLock.uk one-screen HTTPS engine. Paper/dark-clean. Phone-first.
 * Not a forum. Author: Aziel Eliab.
 */
import {
  headMeta, documentTitle, BANNER, DOWNLOAD, GITHUB, CANON_HOST, LIBRARY_AZIEL,
  HEDIDNTJUMP, HEDIDNTJUMP_LABEL, BRAND_MARK_PATH, AZIEL_OFFICIAL, OFFICIAL_SOFTWARES,
  AZIEL_ELIAB_PATH, AZIEL_CORPUS_PATH, REASON_PATH, SOFTWARE_PATH, RUNTIME_PATH,
  DONATE_PATH, RECEIPTS_PATH, HOME_PRIOR_LIMIT, RECEIPTS_PAGE_SIZE,
  runtimeDistribution, ecosystemLinks,
  SPECIFIED_FIT_TITLE, SPECIFIED_FIT_MOTTO,
  ABOUT_PUBLIC_WORK_LEAD, ABOUT_DOCUMENT_OVER_DECLARE, ABOUT_UNSCORED_CLAIM,
  VISIBLE_IDENTITY_LOCK, IDENTITY_ANSWER,
} from "./seo.js";
import { meshStatusLine } from "./mesh.js";
import { hideInternalDetermination } from "./publicCopy.js";
import { receiptScoreDelta } from "./engine.js";
import { publicSoftwaresList, invokeHref, workerHref, stripRuntimeFragGateMash, suiteFamily } from "./catalog.js";
import { donateBody as donatePageBody } from "./donate.js";
import { actReceiptsSection } from "./actReceipts.js";
import { ingestTipSection, pasteHashSection } from "./ingestReceipt.js";

export const CSS = `
:root{--bg:#12100c;--paper:#1b1712;--ink:#efe6d6;--muted:#a89880;--line:#3a3228;--gold:#c9a227;--yes:#7dcea0;--no:#e07a7a;--rev:#e0b15a;--card:#19150f;--royal:#6b3fa0;--royal-deep:#4a2870}
*{box-sizing:border-box}
html,body{background:var(--bg);color:var(--ink);max-width:100%}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;line-height:1.5;overflow-wrap:anywhere}
.wrap{max-width:720px;margin:auto;padding:24px 18px 80px;min-width:0}
.brandrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px;min-height:48px}
.brandmark{width:40px;height:40px;border-radius:10px;object-fit:cover;flex:0 0 40px;box-shadow:0 0 0 1px #0003,0 0 0 1px var(--gold)}
.brand{font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.2}
.nav2{display:flex;flex-wrap:wrap;align-items:center;gap:6px 0;margin:0 0 14px;font-size:14px}
.nav2 .sep{color:var(--muted);margin:0 8px;flex:0 0 auto}
.nav2 a{flex:0 1 auto}
.nav2 a.aziel,.nav2 a.aziel:visited{color:var(--royal);font-weight:700}
.nav2 a.aziel:hover{color:var(--royal-deep)}
.ecosystem{margin:0 0 16px;font-size:13px;color:var(--muted)}
.ecosystem p{margin:0 0 6px}
.ecosystem ul{margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px 14px}
.ecosystem a.secondary{color:var(--muted);font-weight:400}
footer .ecosystem{margin:16px 0 0}
.about-aziel,.about-aziel p,.about-prose,.about-sign{color:var(--royal)}
.about-aziel h1,.about-aziel h2{color:var(--royal)}
.about-aziel a{color:var(--royal)}
.about-aziel a:hover{color:var(--gold)}
.about-sign{font-weight:700;margin-top:18px}
.soft-heading{margin:4px 0 14px;font-size:22px;letter-spacing:-.02em}
.home-software{margin:18px 0}
.soft-line{margin:0 0 10px;line-height:1.7}
.soft-name{font-weight:700}
.soft-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:0 0 18px}
.soft-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.soft-card h3{margin:0 0 6px;font-size:18px}
.soft-meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}
.soft-links{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0 0}
.soft-card.featured{border-color:var(--gold)}
.pill{border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;background:#2a241c;color:var(--ink);border:1px solid var(--line)}
.pill.yes{background:#14261c;color:var(--yes);border-color:#2e6b45}
.pill.no{background:#2a1414;color:var(--no);border-color:#8a2b2b}
.pill.review{background:#2a2210;color:var(--rev);border-color:#8a5a2b}
.pill.interesting{background:#2a2410;color:var(--gold);border-color:var(--gold)}
.pill.ok{background:#14261c;color:var(--yes);border-color:#2e6b45}
.author{color:var(--muted);margin:0 0 14px;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(104px,1fr));gap:10px;margin:0 0 16px}
.stat{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:12px}
.stat b{display:block;font-size:22px;font-weight:800}
.stat span{color:var(--muted);font-size:12px}
.scorebox{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:16px;margin:0 0 16px;display:flex;flex-wrap:wrap;gap:18px}
.scorebox .n{font-size:32px;font-weight:800;letter-spacing:-.03em}
.scorebox .k{color:var(--muted);font-size:13px}
form.challenge{margin:0 0 18px}
textarea{width:100%;min-height:140px;background:#16130f;color:var(--ink);border:1px solid var(--line);border-radius:12px;padding:14px;font:inherit;resize:vertical}
button,.button{background:var(--gold);color:#14110a;border:0;padding:12px 18px;border-radius:12px;font:inherit;font-size:16px;font-weight:750;cursor:pointer;min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}
button.ghost,.button.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0 0}
.card,.answer{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin:14px 0}
.answer h2{margin:8px 0 10px;font-size:18px}
.answer .block{margin:12px 0}
.answer .k{color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.muted{color:var(--muted)}
.hash{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;word-break:break-all}
.prior{list-style:none;padding:0;margin:0}
.prior li{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0}
.prior a{color:var(--gold);text-decoration:none}
.prior .challenge-preview{margin:6px 0;white-space:pre-wrap;word-break:break-word}
.answer .challenge-text{white-space:pre-wrap;word-break:break-word}
pre.verify{white-space:pre-wrap;word-break:break-word;background:#16130f;border:1px solid var(--line);border-radius:12px;padding:14px;overflow:auto;color:var(--ink)}
.ok{color:var(--yes);font-weight:700}
.bad{color:var(--no);font-weight:700}
a{color:var(--gold)}
footer{margin-top:36px;color:var(--muted);font-size:14px;overflow-wrap:anywhere}
.donate-sign{font-weight:700;margin-top:18px}
.donate-rails{display:grid;grid-template-columns:1fr;gap:12px;margin:0 0 18px}
.donate-rail h3{margin:0 0 8px;font-size:18px}
.donate-addr{margin:0 0 10px}
.wallet-hint{margin:12px 0 14px;color:var(--muted);font-size:14px;line-height:1.45}
.donate-actions{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
.donate-qr{margin:12px 0 0;width:128px;height:128px;padding:0;background:#fff;border-radius:4px;overflow:hidden}
.donate-qr img{display:block;width:128px;height:128px;background:#fff}
.prior-more{margin:10px 0 0}
.ingest-receipt{margin:0 0 16px;padding:14px 16px;background:var(--paper);border:1px solid var(--line);border-radius:14px}
.ingest-receipt h2{margin:0 0 8px;font-size:16px;letter-spacing:-.02em}
.ingest-receipt .k{color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin:10px 0 4px}
.ingest-receipt p{margin:0 0 8px}
.ingest-tip{margin:22px 0 0;padding:18px 16px}
.act-receipts{margin:28px 0 0;padding:22px 0 0;border-top:1px solid var(--line)}
.act-receipts h2{margin:0 0 10px;font-size:18px;letter-spacing:-.02em}
.act-receipts .k{color:var(--muted);font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin:10px 0 4px}
.act-receipts .act-field{margin:0 0 6px}
.act-receipts .act-meta{margin:0 0 6px;font-size:13px}
@media (max-width:720px){
  .wrap{padding:16px 14px 72px}
  .stats{grid-template-columns:1fr 1fr}
  .brandrow{gap:8px}
  .brand{width:auto;font-size:22px;flex:1 1 auto;min-width:0}
  button,.button{width:100%}
  .actions{flex-direction:column}
}
`;

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function when(iso) {
  const s = String(iso || "");
  return s ? s.replace("T", " ").replace(/\.\d+Z$/, " UTC").replace(/Z$/, " UTC") : "";
}

function publicText(s, fallback) {
  const t = hideInternalDetermination(String(s == null ? "" : s).trim());
  if (!t || t === "[object Object]") return fallback || "Receipt recorded under the locked protocol.";
  return t;
}

export const CHALLENGE_NOT_RETAINED = "challenge text not retained";
export const CHALLENGE_PREVIEW_MAX = 140;

/** Legacy rows have a null/missing column. Empty string is a stored (empty) challenge. */
export function retainedChallengeText(row) {
  if (!row || row.challenge_text == null) return null;
  return String(row.challenge_text);
}

export function challengeBlockText(row) {
  const t = retainedChallengeText(row);
  return t == null ? CHALLENGE_NOT_RETAINED : t;
}

export function challengePreview(row, max = CHALLENGE_PREVIEW_MAX) {
  const t = retainedChallengeText(row);
  if (t == null) return CHALLENGE_NOT_RETAINED;
  const one = t.replace(/\s+/g, " ").trim();
  const n = Number(max);
  const limit = Number.isFinite(n) && n > 0 ? n : CHALLENGE_PREVIEW_MAX;
  if (one.length <= limit) return one;
  return one.slice(0, limit) + "…";
}

function pillClass(label) {
  const l = String(label || "");
  if (l === "Yes") return "yes";
  if (l === "No") return "no";
  if (l === "Interesting") return "interesting";
  return "review";
}

export { AZIEL_ELIAB_PATH, AZIEL_CORPUS_PATH, REASON_PATH, SOFTWARE_PATH, RUNTIME_PATH, DONATE_PATH, RECEIPTS_PATH, HOME_PRIOR_LIMIT, RECEIPTS_PAGE_SIZE };

export function navItems() {
  return [
    { href: "/", label: "Engine" },
    { href: REASON_PATH, label: "Reason" },
    { href: SOFTWARE_PATH, label: "Softwares" },
    { href: RUNTIME_PATH, label: "Runtime" },
    { href: RECEIPTS_PATH, label: "Receipts" },
    { href: "/verify", label: "Verify" },
    { href: DONATE_PATH, label: "Donate" },
    { href: AZIEL_ELIAB_PATH, label: "Aziel Eliab", aziel: true },
    { href: LIBRARY_AZIEL, label: "Aziel Corpus Library", aziel: true },
    { href: HEDIDNTJUMP, label: HEDIDNTJUMP_LABEL, aziel: true },
  ];
}

export { SPECIFIED_FIT_TITLE, SPECIFIED_FIT_MOTTO };
export const SPECIFIED_FIT_STEEL =
  "Functionally specified digital information joined to a translation / reader system has only one observed adequate cause: intelligence. Pretty spirals and φ are not a proof. Darwinian selection is conceded after a replicator exists. Residual uncertainty stays. Score ceiling 99.7 · floor 33.3.";
export const SPECIFIED_FIT_ANSWERS = "Answers: Yes / No / Let's review / Interesting.";
export const SPECIFIED_FIT_LAYERS = [
  { letter: "A", title: "Detection", body: "Specified complexity / functional information: complex and independently specifiable. Same move as cryptanalysis / SETI. A spiral is not a specification." },
  { letter: "B", title: "Biological object", body: "Digital sequence + mapping table + machines that implement the mapping + error repair + machines encoded in the sequences (compiler+source / code+reader). Not “life is complicated.”" },
  { letter: "C", title: "Fine-tuning physics", body: "Separate ledger. Cosmology does not write a codon table. Do not spend biological capital on a physics dispute." },
  { letter: "D", title: "GodLock as method", body: "Receipts are specified information. GodLock is the ledger, not evidence biology was designed." },
];

export const AZIEL_MANIFESTO = [
  ABOUT_PUBLIC_WORK_LEAD,
  ABOUT_DOCUMENT_OVER_DECLARE,
  ABOUT_UNSCORED_CLAIM,
  "All paths lead home. Morality over legality: a statute can bless a harm and still be called law. Law keeps order. Morality keeps the soul from calling order holy. Let us pray there is a God. If there is, the record is how we stay correctable before Him. If there is not, the record is how we stay correctable before each other.",
];

export const AZIEL_SIGNATURE = "— Aziel Eliab";

export function brandRow() {
  return `<div class="brandrow"><img class="brandmark" src="${esc(BRAND_MARK_PATH)}" width="40" height="40" alt="" decoding="async" fetchpriority="high"><div class="brand">GodLock</div><span class="pill">HTTPS engine</span></div>`;
}

export function topNav(path) {
  const here = String(path || "/");
  const items = navItems();
  return `<nav class="nav2">${items.map((it, i) => {
    const current = here === it.href;
    const cls = [it.aziel ? "aziel" : "", current ? "current" : ""].filter(Boolean).join(" ");
    const attrs = (cls ? ` class="${cls}"` : "") + (current ? ' aria-current="page"' : "");
    const link = `<a href="${esc(it.href)}"${attrs}>${esc(it.label)}</a>`;
    return i ? `<span class="sep">|</span>${link}` : link;
  }).join("")}</nav>`;
}

export function ecosystemNav() {
  const items = ecosystemLinks().map((it) => {
    const cls = it.secondary ? ' class="secondary"' : "";
    return `<li><a href="${esc(it.href)}"${cls}>${esc(it.label)}</a></li>`;
  }).join("");
  return `<nav class="ecosystem" aria-label="Aziel Eliab ecosystem"><p>Part of the Aziel Eliab ecosystem</p><ul>${items}</ul></nav>`;
}

export function page(title, body, { path, kind, extraHeaders, indexable, products } = {}) {
  const p = path || "/";
  const docTitle = documentTitle(title, kind);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(docTitle)}</title>${headMeta({ title, path: p, kind, indexable, products })}<style>${CSS}</style></head><body><div class="wrap">
${brandRow()}
<p class="author">Author Aziel Eliab</p>
${topNav(p)}
${ecosystemNav()}
${body}
<footer>Aziel Eliab · GodLock is a product name · <a href="${esc(SOFTWARE_PATH)}">Softwares</a> · <a href="${esc(RUNTIME_PATH)}">Runtime</a> · <a href="${esc(RECEIPTS_PATH)}">Receipts</a> · <a href="${esc(DONATE_PATH)}">Donate</a> · <a href="${esc(LIBRARY_AZIEL)}">Aziel Eliab — Digital Library</a> · <a href="${esc(HEDIDNTJUMP)}">${esc(HEDIDNTJUMP_LABEL)}</a> · <a href="${esc(GITHUB)}">GitHub</a> · <a href="${esc(CANON_HOST)}">godlock.uk</a>
${ecosystemNav()}
</footer>
</div>
<script>
(function(){
  var form=document.getElementById("challenge-form");
  var ta=document.getElementById("challenge");
  if(form&&ta){
    form.addEventListener("submit",function(ev){
      ev.preventDefault();
      var text=ta.value;
      var btn=form.querySelector("button[type=submit]");
      if(btn){btn.disabled=true;}
      fetch("/submit",{method:"POST",headers:{"Accept":"application/json","Content-Type":"application/x-www-form-urlencoded"},body:"text="+encodeURIComponent(text),credentials:"same-origin"})
        .then(function(r){return r.json();})
        .then(function(j){
          ta.value="";
          if(j&&j.stats){applyStats(j.stats);}
          if(j&&j.isolated){location.href="/";return;}
          if(j&&j.id){location.href="/?r="+encodeURIComponent(j.id);return;}
          location.href="/";
        })
        .catch(function(){ta.value="";form.submit();});
    });
  }
  function applyStats(j){
    if(!j)return;
    var live=document.getElementById("stat-live-nodes");
    var usesEl=document.getElementById("stat-uses");
    var views=document.getElementById("stat-views");
    var dl=document.getElementById("stat-downloads");
    var recEl=document.getElementById("stat-receipts");
    var meshEl=document.getElementById("mesh-status");
    if(live&&j.live_nodes!=null)live.textContent=String(j.live_nodes);
    if(usesEl&&j.uses!=null)usesEl.textContent=String(j.uses);
    if(views&&j.views!=null)views.textContent=String(j.views);
    if(dl&&j.downloads!=null)dl.textContent=String(j.downloads);
    if(recEl&&j.receipts!=null)recEl.textContent=String(j.receipts);
    var scoreEl=document.getElementById("stat-current-score");
    var residualEl=document.getElementById("stat-residual");
    if(scoreEl&&j.current_score!=null)scoreEl.textContent=String(j.current_score)+"%";
    if(residualEl&&j.residual!=null)residualEl.textContent=String(j.residual)+"%";
    if(meshEl&&j.mesh){
      var on=!!j.mesh.enabled;
      var r=j.mesh.rollup||{};
      var live=r.live!=null?r.live:(j.mesh.live_nodes!=null?j.mesh.live_nodes:0);
      var locked=r.locked!=null?r.locked:0;
      var isolated=r.isolated!=null?r.isolated:0;
      meshEl.textContent=on
        ?("Suite mesh: on · live "+live+" · locked "+locked+" · isolated "+isolated)
        :(j.mesh.status==="unavailable"
          ?"Suite mesh: on · rollup unavailable"
          :"Suite mesh: on");
    }
  }
  function beat(){
    if(typeof fetch!=="function")return;
    fetch("/heartbeat",{method:"POST",credentials:"same-origin",headers:{"Accept":"application/json"}})
      .then(function(r){return r.json();})
      .then(applyStats)
      .catch(function(){});
  }
  beat();
  setInterval(beat,25000);
  document.addEventListener("visibilitychange",function(){if(!document.hidden)beat();});
  window.addEventListener("pageshow",function(){beat();});
})();
</script>
</body></html>`;
}

/** Featured Softwares slugs on godlock.uk. Aziel Runtime only — not GodLock or FragGate cards. */
export const FEATURED_SOFTWARES = ["aziel-runtime"];

export function featureGodLockFirst(products) {
  const list = Array.isArray(products) ? products.slice() : [];
  const featured = [];
  const featuredSet = new Set(FEATURED_SOFTWARES);
  for (const slug of FEATURED_SOFTWARES) {
    const card = list.find((p) => p && p.slug === slug);
    if (card) featured.push(card);
  }
  return featured.concat(list.filter((p) => p && !featuredSet.has(p.slug)));
}

export function officialSoftwaresPointer() {
  const host = AZIEL_OFFICIAL.replace(/\/$/, "");
  return `<p class="soft-line">Software is available at <a class="soft-name" href="${esc(AZIEL_OFFICIAL)}">${esc(host)}</a> (<a href="${esc(OFFICIAL_SOFTWARES)}">Softwares / software listing</a>).</p>`;
}

export function homeSoftwareLine() {
  const host = AZIEL_OFFICIAL.replace(/\/$/, "");
  return `<section class="home-software" id="software">
  <h2>Softwares</h2>
  <p class="soft-line"><a class="soft-name" href="${esc(SOFTWARE_PATH + "#aziel-runtime")}">Aziel Runtime</a>. Software is available at <a class="soft-name" href="${esc(AZIEL_OFFICIAL)}">${esc(host)}</a> (<a href="${esc(OFFICIAL_SOFTWARES)}">Softwares / software listing</a>).</p>
  <p class="muted"><a href="${esc(SOFTWARE_PATH)}">Softwares</a> · <a href="${esc(OFFICIAL_SOFTWARES)}">Official Softwares</a> · <a href="${esc(RUNTIME_PATH)}">Runtime</a></p>
</section>`;
}

export function priorReceiptItems(rows, { fullChallenge = false } = {}) {
  return (rows || []).map((r) => {
    const challenge = fullChallenge ? challengeBlockText(r) : challengePreview(r);
    return `<li><span class="pill ${pillClass(r.label)}">${esc(r.label)}</span>
      <div class="challenge-preview">${esc(challenge)}</div>
      <a href="/receipt/${esc(r.id)}">${esc(publicText(r.summary, r.label))}</a>
      <div class="muted">${esc(when(r.created_utc))}</div>
      <div class="hash">${esc(r.content_sha256 || "")}</div>
      <a href="/receipt/${esc(r.id)}">Full receipt</a></li>`;
  }).join("");
}

export function homeBody({ stats, latest, prior, error, products, extras }) {
  const s = stats || {};
  const live = s.live_nodes != null ? s.live_nodes : 0;
  const views = s.views != null ? s.views : 0;
  const uses = s.uses != null ? s.uses : 0;
  const downloads = s.downloads != null ? s.downloads : 0;
  const receipts = s.receipts != null ? s.receipts : 0;
  const score = s.current_score != null ? s.current_score : 50;
  const residual = s.residual != null ? s.residual : 50;
  const meshLine = meshStatusLine(s.mesh);
  const err = error ? `<p class="bad">${esc(error)}</p>` : "";
  const latestHtml = latest && !latest.isolated ? answerCard(latest, true) : "";
  const shown = (prior || []).slice(0, HOME_PRIOR_LIMIT);
  const list = priorReceiptItems(shown) || `<p class="muted">No public receipts yet. Submit a challenge.</p>`;
  return `
<div class="stats">
  <div class="stat"><b id="stat-live-nodes">${esc(live)}</b><span>Live Nodes</span></div>
  <div class="stat"><b id="stat-views">${esc(views)}</b><span>Views</span></div>
  <div class="stat"><b id="stat-uses">${esc(uses)}</b><span>Uses</span></div>
  <div class="stat"><b id="stat-downloads">${esc(downloads)}</b><span>Downloads</span></div>
  <div class="stat"><b id="stat-receipts">${esc(receipts)}</b><span>Receipts</span></div>
</div>
<p class="muted" id="mesh-status">${esc(meshLine)}</p>
<div class="scorebox">
  <div><div class="n" id="stat-current-score">${esc(score)}%</div><div class="k">Current confidence</div></div>
  <div><div class="n" id="stat-residual">${esc(residual)}%</div><div class="k">Residual uncertainty</div></div>
</div>
<div class="card">
  <h2>${esc(SPECIFIED_FIT_TITLE)}</h2>
  <p>${esc(SPECIFIED_FIT_STEEL)}</p>
  <p>${esc(SPECIFIED_FIT_ANSWERS)} ${esc(SPECIFIED_FIT_MOTTO)}</p>
  <p class="muted">Four layers stay separate: detection criterion · biological code+reader · fine-tuning physics · GodLock as method, not evidence. <a href="${esc(REASON_PATH)}">Read the brief</a>.</p>
</div>
<p class="muted">Answers open with Yes, No, Let's review, or Interesting. Intelligent-design disputes are processed under the same rules. Score floor 33.3 · ceiling 99.7. GodLock records a receipt. It does not sermonize.</p>
${err}
<form class="challenge" id="challenge-form" method="post" action="/submit">
  <textarea id="challenge" name="text" maxlength="8000" placeholder="Submit a challenge. Intelligent-design disputes are processed under the same rules."></textarea>
  <div class="actions">
    <button type="submit">Submit</button>
    <a class="button ghost" href="/verify">Verify</a>
    <a class="button ghost" href="${esc(SOFTWARE_PATH)}">Softwares</a>
    <a class="button" href="${esc(RUNTIME_PATH)}">Runtime</a>
    <a class="button ghost" href="${esc(DOWNLOAD)}">Download</a>
    <a class="button ghost" href="${esc(DONATE_PATH)}">Donate</a>
  </div>
</form>
${homeSoftwareLine()}
${latestHtml}
<h2>Prior receipts</h2>
<p class="muted prior-more">Newest ${esc(HOME_PRIOR_LIMIT)}. <a href="${esc(RECEIPTS_PATH)}">Full receipts chain</a>.</p>
<ul class="prior">${list}</ul>
`;
}

export function receiptsPager({ page, pages, total }) {
  const p = Math.max(1, Number(page) || 1);
  const n = Math.max(1, Number(pages) || 1);
  const count = Number(total);
  const totalN = Number.isFinite(count) && count >= 0 ? count : 0;
  if (n <= 1) {
    return `<p class="muted">${esc(totalN)} public receipt${totalN === 1 ? "" : "s"}.</p>`;
  }
  const prev = p > 1
    ? `<a class="button ghost" href="${esc(RECEIPTS_PATH + "?page=" + (p - 1))}">Newer</a>`
    : "";
  const next = p < n
    ? `<a class="button ghost" href="${esc(RECEIPTS_PATH + "?page=" + (p + 1))}">Older</a>`
    : "";
  return `<p class="muted">Page ${esc(p)} of ${esc(n)} · ${esc(totalN)} public receipts.</p>
<p class="actions">${prev}${next}</p>`;
}

export function receiptsBody({ rows, total, page, pageSize, stats }) {
  const s = stats || {};
  const live = s.live_nodes != null ? s.live_nodes : 0;
  const views = s.views != null ? s.views : 0;
  const uses = s.uses != null ? s.uses : 0;
  const downloads = s.downloads != null ? s.downloads : 0;
  const receipts = s.receipts != null ? s.receipts : (total != null ? total : 0);
  const list = priorReceiptItems(rows, { fullChallenge: true })
    || `<p class="muted">No public receipts yet. <a href="/">Submit a challenge</a>.</p>`;
  const size = Number(pageSize) || RECEIPTS_PAGE_SIZE;
  const pages = Math.max(1, Math.ceil((Number(total) || 0) / size));
  return `
<div class="stats">
  <div class="stat"><b id="stat-live-nodes">${esc(live)}</b><span>Live Nodes</span></div>
  <div class="stat"><b id="stat-views">${esc(views)}</b><span>Views</span></div>
  <div class="stat"><b id="stat-uses">${esc(uses)}</b><span>Uses</span></div>
  <div class="stat"><b id="stat-downloads">${esc(downloads)}</b><span>Downloads</span></div>
  <div class="stat"><b id="stat-receipts">${esc(receipts)}</b><span>Receipts</span></div>
</div>
<h1 class="soft-heading">Receipts</h1>
<p>Public questions and the hash-chained receipt list. Newest first. GodLock is a stress-test engine — Yes / No / Let's review / Interesting — not a forum.</p>
<p class="muted">${esc(SPECIFIED_FIT_TITLE)}. ${esc(SPECIFIED_FIT_MOTTO)} <a href="${esc(REASON_PATH)}">Read the brief</a>.</p>
<p class="muted"><a href="/">Submit a challenge</a> on the Engine.</p>
${receiptsPager({ page, pages, total: total != null ? total : receipts })}
<ul class="prior">${list}</ul>
${ingestTipSection()}
${actReceiptsSection(rows)}
`;
}

export function answerCard(row, latest) {
  if (!row) return "";
  const delta = receiptScoreDelta(row.score_before, row.score_after);
  const sign = delta > 0 ? "+" : "";
  const title = latest ? "Latest answer" : "Receipt";
  return `<article class="answer">
    <span class="pill ${pillClass(row.label)}">${esc(row.label)}</span>
    <h2>${esc(title)}</h2>
    <div class="block"><div class="k">Challenge</div><p class="challenge-text">${esc(challengeBlockText(row))}</p></div>
    <div class="block"><div class="k">1. Summary</div><p>${esc(publicText(row.summary))}</p></div>
    <div class="block"><div class="k">2. Explanation</div><p>${esc(publicText(row.explanation))}</p></div>
    <div class="block"><div class="k">3. Score change</div><p>${esc(row.score_before)}% → ${esc(row.score_after)}% (${sign}${esc(delta)})</p></div>
    <div class="block"><div class="k">4. Residual uncertainty</div><p>${esc(row.residual)}%</p></div>
    <p class="hash muted">${esc(row.content_sha256 || "")} · <a href="/receipt/${esc(row.id)}">receipt</a></p>
  </article>`;
}

export function verifyBody({ report, paste }) {
  const v = report || { ok: false };
  const cls = v.ok ? "ok" : "bad";
  const title = v.ok ? "VERIFIED" : "VERIFICATION FAILED";
  const safe = {
    ok: !!v.ok,
    product: "GodLock",
    site: "godlock.uk",
    author: "Aziel Eliab",
    banner: BANNER,
    ledger_entries: v.entries,
    ledger_head: v.ledger_head,
    errors: v.errors || [],
    verified_utc: new Date().toISOString(),
  };
  return `${pasteHashSection(paste)}<div class="card"><h2 class="${cls}">${title}</h2><p class="muted">The ledger is walked. Each entry_hash is recomputed from canonical JSON (sorted keys, comma-colon separators) without the stored hash. Isolated submissions stay in the archive and are omitted from the public feed. Challenge ledger walk stays distinct from ACT-RECEIPT and from the first-screen paste-hash above.</p><pre class="verify">${esc(JSON.stringify(safe, null, 2))}</pre><p class="actions"><a class="button" href="/">Back</a></p></div>`;
}

export function specifiedFitPublicHtml() {
  const layers = SPECIFIED_FIT_LAYERS.map((L) => {
    return `<div class="block"><div class="k">${esc(L.letter)}. ${esc(L.title)}</div><p>${esc(L.body)}</p></div>`;
  }).join("");
  return `<section class="answer" id="specified-fit">
  <h2>${esc(SPECIFIED_FIT_TITLE)}</h2>
  <p><strong>Aziel Eliab</strong></p>
  <p>${esc(SPECIFIED_FIT_STEEL)}</p>
  <p>${esc(SPECIFIED_FIT_ANSWERS)}</p>
  <p>${esc(SPECIFIED_FIT_MOTTO)}</p>
  ${layers}
  <p class="muted">Public identity is Aziel Eliab only. GodLock is a product name.</p>
</section>`;
}

export function reasonBody() {
  return `<section class="about-aziel" id="specified-fit-brief"><div class="card about-prose">
${specifiedFitPublicHtml()}
<p><a href="${esc(AZIEL_ELIAB_PATH)}">Aziel Eliab</a> · <a href="${esc(LIBRARY_AZIEL)}">Aziel Eliab — Digital Library</a> · <a href="${esc(HEDIDNTJUMP)}">${esc(HEDIDNTJUMP_LABEL)}</a></p>
</div></section>`;
}

export function reasonText() {
  const layers = SPECIFIED_FIT_LAYERS.map((L) => L.letter + ". " + L.title + " — " + L.body).join("\n\n");
  return SPECIFIED_FIT_TITLE + "\n\nAziel Eliab\n\n" + SPECIFIED_FIT_STEEL + "\n\n"
    + SPECIFIED_FIT_ANSWERS + "\n\n" + SPECIFIED_FIT_MOTTO + "\n\n" + layers + "\n";
}

export function azielEliabBody() {
  const paras = AZIEL_MANIFESTO.map((p) => `<p>${esc(p)}</p>`).join("\n");
  return `<section class="about-aziel" id="aziel-eliab"><div class="card about-prose">
${paras}
<p class="about-sign">${esc(AZIEL_SIGNATURE)}</p>
${specifiedFitPublicHtml()}
<p><a href="${esc(REASON_PATH)}">Specified Fit, Not Pretty Spirals</a> · <a href="${esc(LIBRARY_AZIEL)}">Aziel Eliab — Digital Library</a> · <a href="${esc(HEDIDNTJUMP)}">${esc(HEDIDNTJUMP_LABEL)}</a></p>
</div></section>`;
}

export function azielEliabText() {
  return AZIEL_MANIFESTO.join("\n\n") + "\n\n" + AZIEL_SIGNATURE + "\n";
}

/** Visible /who lock page. Standalone HTML so view-source body contains the lock line. */
export function whoPageHtml() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://www.azieleliab.com/who#faq",
    url: "https://www.azieleliab.com/who",
    name: "Who is Aziel Eliab?",
    mainEntity: [
      {
        "@type": "Question",
        name: "Who is Aziel Eliab?",
        acceptedAnswer: { "@type": "Answer", text: IDENTITY_ANSWER },
      },
      {
        "@type": "Question",
        name: "Is Aziel Eliab the two musicians named in 1 Chronicles 15:20?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Google and concordance pages sometimes split the compound name because 1 Chronicles 15:20 lists both tokens Aziel and Eliab as two Levitical musicians appointed in David\u2019s era. Aziel Eliab is one living researcher and software designer. He is not those two musicians. Prefer https://www.azieleliab.com/#aziel.",
        },
      },
    ],
    about: { "@id": "https://www.azieleliab.com/#aziel" },
    author: { "@id": "https://www.azieleliab.com/#aziel" },
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Who is Aziel Eliab</title>
<meta name="description" content="${esc(VISIBLE_IDENTITY_LOCK)}">
<link rel="canonical" href="https://www.azieleliab.com/who">
<link rel="alternate" type="application/ld+json" href="/person.jsonld" title="person.jsonld">
<link rel="alternate" type="text/plain" href="/who-is-aziel-eliab.txt" title="who-is">
<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">
<script type="application/ld+json">
${JSON.stringify(faq)}
</script>
</head>
<body>
<main>
<h1>Who is Aziel Eliab</h1>
<p>${esc(IDENTITY_ANSWER)}</p>
</main>
</body>
</html>
`;
}

export function softwaresCard(p, { featured = false } = {}) {
  if (!p || !p.slug) return "";
  const slug = String(p.slug || "");
  const feat = featured || FEATURED_SOFTWARES.includes(slug);
  const family = p.family || suiteFamily(p);
  const ver = p.version ? `<span class="pill">v${esc(p.version)}</span>` : "";
  const dl = p.downloads != null ? `<span class="pill ok">${esc(p.downloads)} downloads</span>` : "";
  const views = p.views != null ? `<span class="pill ok">${esc(p.views)} views</span>` : "";
  const uses = p.uses != null ? `<span class="pill ok">${esc(p.uses)} uses</span>` : "";
  const worker = workerHref(p);
  const kernel = p.kernel
    ? `<a class="button ghost" href="${esc(p.kernel)}">FragGate</a>`
    : "";
  const dist = slug === "aziel-runtime"
    ? runtimeDistribution({ sameOrigin: true }).map((b) => (
      `<a class="button${b.primary ? "" : " ghost"}" href="${esc(b.href)}">${esc(b.label)}</a>`
    )).join(" ")
    : "";
  const links = slug === "aziel-runtime"
    ? [
        dist,
        `<a class="button ghost" href="${esc(RUNTIME_PATH + "/mcp")}">MCP</a>`,
        kernel,
      ].filter(Boolean).join(" ")
    : [
        p.download ? `<a class="button" href="${esc(p.download)}">Download</a>` : "",
        worker ? `<a class="button ghost" href="${esc(worker)}">Worker</a>` : "",
        p.github ? `<a class="button ghost" href="${esc(p.github)}">GitHub</a>` : "",
        `<a class="button ghost" href="${esc(invokeHref(p))}">Invoke via Runtime</a>`,
        `<a class="button ghost" href="${esc(RUNTIME_PATH + "/mcp")}">MCP</a>`,
        kernel,
      ].filter(Boolean).join(" ");
  return `<article class="soft-card${feat ? " featured" : ""}" id="${esc(slug)}" data-family="${esc(family)}">${feat ? '<span class="pill interesting">Featured</span> ' : ""}<h3>${esc(stripRuntimeFragGateMash(p.name || slug))}</h3><div class="soft-meta">${ver}${dl}${views}${uses}</div><p>${esc(stripRuntimeFragGateMash(hideInternalDetermination(p.one_line || "")))}</p><p class="soft-links">${links}</p></article>`;
}

export function softwareBody({ products, extras } = {}) {
  const list = featureGodLockFirst(publicSoftwaresList(products, extras));
  const cards = list.map((p) => softwaresCard(p, { featured: true })).join("");
  return `<h2 class="soft-heading">Softwares</h2>
<div class="soft-grid">${cards}</div>
${officialSoftwaresPointer()}`;
}

export function donateBody() {
  return donatePageBody();
}

export function receiptBody({ id, row, entries }) {
  if (!row || row.isolated) {
    return `<div class="card"><h2>Not found</h2><p>No public receipt for ${esc(id)}.</p><p><a class="button" href="/">Back</a></p></div>`;
  }
  const chain = (entries || []).map((e) => {
    return `<article class="card"><p class="muted">#${esc(e.sequence)} · ${esc(e.action)} · ${esc(when(e.timestamp_utc))}</p><p class="hash">entry ${esc(e.entry_hash)}</p><p class="hash muted">prev ${esc(e.previous_hash)}</p><pre class="verify">${esc(JSON.stringify(e.payload, null, 2))}</pre></article>`;
  }).join("");
  return `${answerCard(row, false)}${chain || ""}<p class="actions"><a class="button" href="/">Back</a></p>`;
}
