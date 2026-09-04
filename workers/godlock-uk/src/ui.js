/**
 * GodLock.uk one-screen HTTPS engine. Paper/dark-clean. Phone-first.
 * Not a forum. Author: Aziel Eliab.
 */
import { headMeta, BANNER, DOWNLOAD, GITHUB, CANON_HOST } from "./seo.js";

export const CSS = `
:root{--bg:#12100c;--paper:#1b1712;--ink:#efe6d6;--muted:#a89880;--line:#3a3228;--gold:#c9a227;--yes:#7dcea0;--no:#e07a7a;--rev:#e0b15a;--card:#19150f}
*{box-sizing:border-box}
html,body{background:var(--bg);color:var(--ink)}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;line-height:1.5}
.wrap{max-width:720px;margin:auto;padding:24px 18px 80px}
.brandrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px}
.brand{font-size:26px;font-weight:800;letter-spacing:-.02em}
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
  const t = String(s == null ? "" : s).trim();
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

export function page(title, body, { path, kind, extraHeaders } = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — GodLock</title>${headMeta({ title, path: path || "/", kind })}<style>${CSS}</style></head><body><div class="wrap">
<div class="brandrow"><div class="brand">GodLock</div><span class="pill">HTTPS engine</span></div>
<p class="author">Author Aziel Eliab</p>
<div class="banner">${esc(BANNER)}</div>
${body}
<footer>Aziel Eliab · GodLock is a product name · <a href="${esc(GITHUB)}">GitHub</a> · <a href="${esc(CANON_HOST)}">godlock.uk</a></footer>
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
    var sub=document.getElementById("stat-submissions");
    var views=document.getElementById("stat-views");
    var dl=document.getElementById("stat-downloads");
    if(live&&j.live_nodes!=null)live.textContent=String(j.live_nodes);
    var submissions=j.submissions!=null?j.submissions:j.uses;
    if(sub&&submissions!=null)sub.textContent=String(submissions);
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
  const submissions = s.submissions != null ? s.submissions : (s.uses != null ? s.uses : 0);
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
  <div class="stat"><b id="stat-submissions">${esc(submissions)}</b><span>Submissions</span></div>
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

export function receiptBody({ id, row, entries }) {
  if (!row || row.isolated) {
    return `<div class="card"><h2>Not found</h2><p>No public receipt for ${esc(id)}.</p><p><a class="button" href="/">Back</a></p></div>`;
  }
  const chain = (entries || []).map((e) => {
    return `<article class="card"><p class="muted">#${esc(e.sequence)} · ${esc(e.action)} · ${esc(when(e.timestamp_utc))}</p><p class="hash">entry ${esc(e.entry_hash)}</p><p class="hash muted">prev ${esc(e.previous_hash)}</p><pre class="verify">${esc(JSON.stringify(e.payload, null, 2))}</pre></article>`;
  }).join("");
  return `${answerCard(row, false)}${chain || ""}<p class="actions"><a class="button" href="/">Back</a></p>`;
}
