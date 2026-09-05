/**
 * GodLock.uk one-screen HTTPS engine. Paper/dark-clean. Phone-first.
 * Not a forum. Author: Aziel Eliab.
 */
import {
  headMeta, BANNER, DOWNLOAD, GITHUB, CANON_HOST, CATALOG, LIBRARY, LIBRARY_AZIEL,
  AZIEL_ELIAB_PATH, AZIEL_CORPUS_PATH, SOFTWARE_PATH,
} from "./seo.js";
import { hideInternalDetermination } from "./publicCopy.js";

export const CSS = `
:root{--bg:#12100c;--paper:#1b1712;--ink:#efe6d6;--muted:#a89880;--line:#3a3228;--gold:#c9a227;--yes:#7dcea0;--no:#e07a7a;--rev:#e0b15a;--card:#19150f;--royal:#6b3fa0;--royal-deep:#4a2870}
*{box-sizing:border-box}
html,body{background:var(--bg);color:var(--ink)}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;line-height:1.5}
.wrap{max-width:720px;margin:auto;padding:24px 18px 80px}
.brandrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px}
.brand{font-size:26px;font-weight:800;letter-spacing:-.02em}
.nav2{margin:0 0 14px;font-size:14px}
.nav2 .sep{color:var(--muted);margin:0 8px}
.nav2 a.aziel,.nav2 a.aziel:visited{color:var(--royal);font-weight:700}
.nav2 a.aziel:hover{color:var(--royal-deep)}
.about-aziel,.about-aziel p,.about-prose,.about-sign{color:var(--royal)}
.about-aziel h1,.about-aziel h2{color:var(--royal)}
.about-aziel a{color:var(--royal)}
.about-aziel a:hover{color:var(--gold)}
.about-sign{font-weight:700;margin-top:18px}
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
.author{color:var(--muted);margin:0 0 14px;font-size:14px}
.banner{background:#1a140c;border:1px solid #8a5a2b;border-radius:12px;padding:12px 14px;margin:0 0 16px;color:#f0d0a8;font-size:15px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:0 0 16px}
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
pre.verify{white-space:pre-wrap;word-break:break-word;background:#16130f;border:1px solid var(--line);border-radius:12px;padding:14px;overflow:auto;color:var(--ink)}
.ok{color:var(--yes);font-weight:700}
.bad{color:var(--no);font-weight:700}
a{color:var(--gold)}
footer{margin-top:36px;color:var(--muted);font-size:14px}
@media (max-width:720px){
  .wrap{padding:16px 14px 72px}
  .stats{grid-template-columns:1fr 1fr}
  .brand{width:100%}
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

function pillClass(label) {
  const l = String(label || "");
  if (l === "Yes") return "yes";
  if (l === "No") return "no";
  if (l === "Interesting") return "interesting";
  return "review";
}

export { AZIEL_ELIAB_PATH, AZIEL_CORPUS_PATH, SOFTWARE_PATH };

export const AZIEL_MANIFESTO = [
  "I made this because a debate with no record becomes a pulpit, and a pulpit with no score becomes a private religion. Intelligent design was never the point by itself. The point was whether a claim could stand in the open, be answered, and leave something behind that was not just my voice.",
  "Questions over answers, or the mouth outruns the mind. Document over declare, or speech becomes a throne. Formality before familiarity, or warmth is mistaken for proof. Trust is an output. It is grown from a chain you can audit, not granted at the door. I am not always right. That is not a confession. It is the method.",
  "A claim that cannot be scored is a sermon wearing work clothes. Intelligent design and design-flaw sit at the same table. No creed inherits a private lane. Later readings bury earlier ones as the evidence hardens. The receipt is the argument that survives the speaker.",
  "All paths lead home. Morality over legality: a statute can bless a harm and still be called law. Law keeps order. Morality keeps the soul from calling order holy. Let us pray there is a God. If there is, the record is how we stay correctable before Him. If there is not, the record is how we stay correctable before each other.",
];

export const AZIEL_SIGNATURE = "— Aziel Eliab";

export function topNav(path) {
  const here = String(path || "/");
  const items = [
    { href: "/", label: "Engine" },
    { href: SOFTWARE_PATH, label: "Software" },
    { href: "/verify", label: "Verify" },
    { href: AZIEL_ELIAB_PATH, label: "Aziel Eliab", aziel: true },
    { href: AZIEL_CORPUS_PATH, label: "Aziel Corpus Library", aziel: true },
  ];
  return `<nav class="nav2">${items.map((it, i) => {
    const current = here === it.href;
    const cls = [it.aziel ? "aziel" : "", current ? "current" : ""].filter(Boolean).join(" ");
    const attrs = (cls ? ` class="${cls}"` : "") + (current ? ' aria-current="page"' : "");
    const link = `<a href="${esc(it.href)}"${attrs}>${esc(it.label)}</a>`;
    return i ? `<span class="sep">|</span>${link}` : link;
  }).join("")}</nav>`;
}

export function page(title, body, { path, kind, extraHeaders } = {}) {
  const p = path || "/";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — GodLock</title>${headMeta({ title, path: p, kind })}<style>${CSS}</style></head><body><div class="wrap">
<div class="brandrow"><div class="brand">GodLock</div><span class="pill">HTTPS engine</span></div>
<p class="author">Author Aziel Eliab</p>
${topNav(p)}
<div class="banner">${esc(hideInternalDetermination(BANNER))}</div>
${body}
<footer>Aziel Eliab · GodLock is a product name · <a href="${esc(SOFTWARE_PATH)}">Software</a> · <a href="${esc(LIBRARY_AZIEL)}">Aziel Eliab — Digital Library</a> · <a href="${esc(GITHUB)}">GitHub</a> · <a href="${esc(CANON_HOST)}">godlock.uk</a></footer>
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
    if(live&&j.live_nodes!=null)live.textContent=String(j.live_nodes);
    if(usesEl&&j.uses!=null)usesEl.textContent=String(j.uses);
    if(views&&j.views!=null)views.textContent=String(j.views);
    if(dl&&j.downloads!=null)dl.textContent=String(j.downloads);
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

export function homeBody({ stats, latest, prior, error }) {
  const s = stats || {};
  const live = s.live_nodes != null ? s.live_nodes : 0;
  const views = s.views != null ? s.views : 0;
  const uses = s.uses != null ? s.uses : 0;
  const downloads = s.downloads != null ? s.downloads : 0;
  const score = s.current_score != null ? s.current_score : 50;
  const residual = s.residual != null ? s.residual : 50;
  const err = error ? `<p class="bad">${esc(error)}</p>` : "";
  const latestHtml = latest && !latest.isolated ? answerCard(latest, true) : "";
  const list = (prior || []).map((r) => {
    return `<li><span class="pill ${pillClass(r.label)}">${esc(r.label)}</span>
      <a href="/receipt/${esc(r.id)}">${esc(publicText(r.summary, r.label))}</a>
      <div class="muted">${esc(when(r.created_utc))}</div>
      <div class="hash">${esc(r.content_sha256 || "")}</div></li>`;
  }).join("") || `<p class="muted">No public receipts yet. Submit a challenge.</p>`;
  return `
<div class="stats">
  <div class="stat"><b id="stat-live-nodes">${esc(live)}</b><span>Live Nodes</span></div>
  <div class="stat"><b id="stat-views">${esc(views)}</b><span>Views</span></div>
  <div class="stat"><b id="stat-uses">${esc(uses)}</b><span>Uses</span></div>
  <div class="stat"><b id="stat-downloads">${esc(downloads)}</b><span>Downloads</span></div>
</div>
<div class="scorebox">
  <div><div class="n">${esc(score)}%</div><div class="k">Current confidence</div></div>
  <div><div class="n">${esc(residual)}%</div><div class="k">Residual uncertainty</div></div>
</div>
<p class="muted">Answers open with Yes, No, Let's review, or Interesting. Intelligent-design disputes are processed under the same rules. Score floor 33.3 · ceiling 99.7.</p>
${err}
<form class="challenge" id="challenge-form" method="post" action="/submit">
  <textarea id="challenge" name="text" maxlength="8000" placeholder="Submit a challenge. Intelligent-design disputes are processed under the same rules."></textarea>
  <div class="actions">
    <button type="submit">Submit</button>
    <a class="button ghost" href="/verify">Verify</a>
    <a class="button ghost" href="${esc(SOFTWARE_PATH)}">Software</a>
    <a class="button ghost" href="${esc(DOWNLOAD)}">Download</a>
  </div>
</form>
${latestHtml}
<h2>Prior receipts</h2>
<ul class="prior">${list}</ul>
`;
}

export function answerCard(row, latest) {
  if (!row) return "";
  const delta = Math.round((Number(row.score_after) - Number(row.score_before)) * 10) / 10;
  const sign = delta > 0 ? "+" : "";
  const title = latest ? "Latest answer" : "Receipt";
  return `<article class="answer">
    <span class="pill ${pillClass(row.label)}">${esc(row.label)}</span>
    <h2>${esc(title)}</h2>
    <div class="block"><div class="k">1. Summary</div><p>${esc(publicText(row.summary))}</p></div>
    <div class="block"><div class="k">2. Explanation</div><p>${esc(publicText(row.explanation))}</p></div>
    <div class="block"><div class="k">3. Score change</div><p>${esc(row.score_before)}% → ${esc(row.score_after)}% (${sign}${esc(delta)})</p></div>
    <div class="block"><div class="k">4. Residual uncertainty</div><p>${esc(row.residual)}%</p></div>
    <p class="hash muted">${esc(row.content_sha256 || "")} · <a href="/receipt/${esc(row.id)}">receipt</a></p>
  </article>`;
}

export function verifyBody({ report }) {
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
  return `<div class="card"><h2 class="${cls}">${title}</h2><p class="muted">The ledger is walked. Each entry_hash is recomputed from canonical JSON (sorted keys, comma-colon separators) without the stored hash. Isolated submissions stay in the archive and are omitted from the public feed.</p><pre class="verify">${esc(JSON.stringify(safe, null, 2))}</pre><p class="actions"><a class="button" href="/">Back</a></p></div>`;
}

export function azielEliabBody() {
  const paras = AZIEL_MANIFESTO.map((p) => `<p>${esc(p)}</p>`).join("\n");
  return `<section class="about-aziel" id="aziel-eliab"><div class="card about-prose">
${paras}
<p class="about-sign">${esc(AZIEL_SIGNATURE)}</p>
<p><a href="${esc(LIBRARY_AZIEL)}">Aziel Eliab — Digital Library</a></p>
</div></section>`;
}

export function azielEliabText() {
  return AZIEL_MANIFESTO.join("\n\n") + "\n\n" + AZIEL_SIGNATURE + "\n";
}

export const CORPUS_OPENING = [
  "Researcher. Builder. AI. A one-man dev team. Just a man. Who? Does not matter. What matters is the record.",
  "I do not ask you to believe a name. I ask you to read a record. This library is the public MASTER of the work: hashed receipts, timed files, and software that can be opened without taking the speaker on faith. If the files hold, the name was never the point.",
];

export const CORPUS_OPENING_SIGN = "\u2014 Aziel Elroi Eliab";

export const CORPUS_ABOUT = [
  "If not me, then who holds the record when names get stripped and the files get sealed? I didn\u2019t ask for the seat. The work was already sitting there undone. I build receipts so truth has a place to live that isn\u2019t someone else\u2019s story.",
  "Carry the torch: I don\u2019t own the flame. I keep it lit long enough for the next hands to find it. If the record is local, timed, and hashed, the work can outlive me. That is the point.",
  "Truth that cannot be corrected is just a private religion. So the work stays public, chained for review, not a pulpit. Later papers bury earlier ones as confidence hardens. I am not always right. That is not a confession. It is the method.",
];

export function azielCorpusLibraryBody() {
  return `<section class="about-aziel" id="aziel-corpus-library"><h1>About Aziel</h1>
<div class="card about-prose">
<p>${esc(CORPUS_OPENING[0])}</p>
<p>${esc(CORPUS_OPENING[1])}</p>
<p class="about-sign">${esc(CORPUS_OPENING_SIGN)}</p>
<p>${esc(CORPUS_ABOUT[0])}</p>
<p>${esc(CORPUS_ABOUT[1])}</p>
<p>${esc(CORPUS_ABOUT[2])}</p>
<p><strong>Aziel Library</strong> (royal purple) is the operator collection of Aziel Eliab\u2019s own papers and software notes. <strong>Corpus</strong> is the public Lamb Lens shelf \u2014 anyone may browse; signed-in accounts file there. The two shelves share the same scoring and hash-chain rules; they are not the same collection.</p>
<p>The software suite is listed on <a href="${esc(LIBRARY + "/software")}">Software</a> and invoked from <a href="${esc(LIBRARY + "/runtime")}">Runtime</a> (aziel-runtime catalog). How records are scored \u2014 triad SPRE \u00d7 CLCE \u00d7 PhysLing, and ZionPattern as a separate public reading \u2014 is on <a href="${esc(LIBRARY + "/how-its-scored")}">How it\u2019s scored</a>. Source: <a href="https://github.com/AzielEliab/aziel-corpus">github.com/AzielEliab/aziel-corpus</a>.</p>
<p>I am here for the record, not the applause. If not me, then who. If not now, the seal holds. I carry the torch by leaving receipts. When the work can stand without my name on it, I am done.</p>
<p>I am temporary. The truth is not.</p>
<p class="about-sign"><strong>${esc(AZIEL_SIGNATURE)}</strong></p>
</div>
<p class="actions"><a class="button" href="${esc(LIBRARY + "/")}">Open the library</a> <a class="button ghost" href="${esc(LIBRARY_AZIEL)}">Aziel Eliab \u2014 Digital Library</a></p>
</section>`;
}

export function softwareBody({ products } = {}) {
  const list = Array.isArray(products) ? products : [];
  const featured = new Set(["godlock", "azieltether"]);
  const cards = list.map((p) => {
    const slug = String(p.slug || "");
    const feat = featured.has(slug);
    const ver = p.version ? `<span class="pill">v${esc(p.version)}</span>` : "";
    const links = [
      p.download ? `<a class="button" href="${esc(p.download)}">Download</a>` : "",
      p.github ? `<a class="button ghost" href="${esc(p.github)}">GitHub</a>` : "",
      p.skill ? `<a class="button ghost" href="${esc(p.skill)}">Skill</a>` : "",
      slug ? `<a class="button ghost" href="${esc(CATALOG + "/p/" + slug)}">Catalog</a>` : "",
    ].filter(Boolean).join("");
    return `<article class="soft-card${feat ? " featured" : ""}">${feat ? '<span class="pill interesting">Featured</span> ' : ""}<h3>${esc(p.name || slug)}</h3><div class="soft-meta">${ver}</div><p>${esc(p.one_line || "")}</p><p class="soft-links">${links}</p></article>`;
  }).join("");
  const n = list.length;
  return `<p class="muted">Aziel Eliab products from the live <a href="${esc(CATALOG + "/v1/catalog.json")}">aziel-runtime catalog</a>. GodLock.uk is not a mesh. Counted downloads stay on each product Worker.${n ? " " + esc(n) + " downloadable products." : ""}</p>
<div class="soft-grid">${cards || `<p class="muted">Catalog unavailable. <a href="${esc(CATALOG + "/")}">Open the catalog</a>.</p>`}</div>`;
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
