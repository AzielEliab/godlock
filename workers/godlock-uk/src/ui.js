/**
 * GodLock.uk public board chrome. Paper/cream, phone-first.
 * Author: Aziel Eliab.
 */
import { headMeta, defaultDescription, BANNER, DOWNLOAD, GITHUB, CANON_HOST } from "./seo.js";

export const CSS = `
:root{--paper:#f6f3ee;--ink:#1c1916;--btn:#1f3a44;--card:#fffcf7;--line:#e2d9cc;--muted:#6b645c;--cream:#fffaf3}
*{box-sizing:border-box}
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;background:var(--paper);color:var(--ink);line-height:1.5}
.wrap{max-width:720px;margin:auto;padding:28px 22px 80px}
.brand{font-size:23px;font-weight:800;letter-spacing:-.02em;line-height:1.2}
.nav1,.nav2,.row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.nav1{margin-bottom:6px}
.nav2{margin:8px 0 22px;gap:2px 0}
.nav2 a,.quiet a{color:var(--ink);text-decoration:none;font-size:15px;padding:10px 11px;min-height:44px;display:inline-flex;align-items:center;border-radius:10px}
.nav2 a:hover{background:#ece6dc}
.nav2 .sep{color:#c4b9aa;padding:0 2px}
.muted{color:var(--muted)}
.pill{background:#ece6dc;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:650}
.pill.ok{background:#e4eee6;color:#1a5a32}
.banner{background:var(--cream);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 18px;font-size:15px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:22px;margin:18px 0;box-shadow:0 1px 0 #00000008}
.button,button{background:var(--btn);color:#fff;border:0;padding:12px 16px;border-radius:10px;text-decoration:none;cursor:pointer;min-height:44px;display:inline-flex;align-items:center;justify-content:center;font-size:15px;font-weight:600}
.button.ghost,a.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.search,input,select,textarea{padding:12px 14px;border:1px solid #d3c8b8;border-radius:10px;background:#fff;color:var(--ink);font:inherit}
.search{min-width:0;width:100%;flex:1 1 auto}
input,select,textarea{width:100%;min-height:44px}
textarea{min-height:140px;resize:vertical}
.hero{padding:4px 0 8px}
.hero h1{font-size:28px;margin:0 0 8px;letter-spacing:-.03em}
.hero-search{display:flex;gap:10px;flex-wrap:wrap;align-items:stretch;margin:12px 0}
.hero-search .search{flex:1 1 220px}
.hero-search button{flex:0 0 auto}
.doc{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin:14px 0}
.doc h2,.doc h3{margin:4px 0 8px;font-size:20px;letter-spacing:-.02em}
.doc .meta{color:var(--muted);font-size:14px;margin:0 0 10px}
.doc p{margin:8px 0 12px;white-space:pre-wrap;word-break:break-word}
.kind{display:inline-block;font-size:12px;font-weight:750;padding:4px 10px;border-radius:999px;letter-spacing:.02em;background:#e7eeea;color:var(--btn)}
.kind.question{background:var(--btn);color:var(--paper)}
.pw-row{display:flex;gap:8px;align-items:center;margin:6px 0;flex-wrap:wrap}
.pw-row input[type=password],.pw-row input[type=text]{flex:1;min-width:0}
label.showpw{font-size:14px;color:var(--muted);white-space:nowrap;min-height:44px;display:inline-flex;align-items:center;gap:8px}
.ok{color:#176a38;font-weight:700}
.bad{color:#a51d2d;font-weight:700}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
.metric{font-size:26px;font-weight:800}
.empty{color:var(--muted);padding:28px 8px;text-align:center}
.hash{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;word-break:break-all}
pre.verify{white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;overflow:auto}
.actions{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0 0}
@media (max-width:720px){
  .wrap{padding:16px 14px 64px}
  .brand{width:100%;font-size:20px}
  .search,.hero-search .search{width:100%;min-width:0}
  .hero-search{flex-direction:column}
  .hero-search button,.button,button{width:100%}
  .nav1,.nav2{width:100%}
  .doc,.card{padding:16px}
}
`;

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export function pwField(name = "password") {
  const id = "pw_" + name.replace(/[^a-z0-9]/gi, "");
  return `<div class="pw-row"><input id="${id}" name="${name}" type="password" required placeholder="password" autocomplete="current-password"><label class="showpw"><input type="checkbox" onclick="var e=document.getElementById('${id}');e.type=this.checked?'text':'password'"> Show password</label></div>`;
}

function when(iso) {
  const s = String(iso || "");
  return s ? s.replace("T", " ").replace(/\.\d+Z$/, " UTC").replace(/Z$/, " UTC") : "";
}

export function page(title, body, { signed, path, kind, description } = {}) {
  const who = signed && signed.username ? String(signed.username) : "";
  const account = signed
    ? `<span class="pill ok">signed in as ${esc(who)}</span>`
    : `<span class="pill">anyone can view</span>`;
  const authLinks = signed
    ? `<a href="/logout">Log out</a>`
    : `<a href="/login">Log in</a><span class="sep">|</span><a href="/signup">Sign up</a>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — GodLock</title>${headMeta({ title, path: path || "/", kind, description })}<style>${CSS}</style></head><body><div class="wrap">
<div class="nav1"><div class="brand">GodLock</div><span class="pill">public board</span>${account}</div>
<nav class="nav2 quiet"><a href="/">Home</a><span class="sep">|</span><a href="/ask">Ask</a><span class="sep">|</span><a href="/archive">Archive</a><span class="sep">|</span><a href="/verify">Verify</a><span class="sep">|</span>${authLinks}</nav>
<div class="banner">${esc(BANNER)}</div>
${body}
<p class="muted" style="margin-top:36px">Author Aziel Eliab · <a href="${esc(GITHUB)}">GitHub</a> · <a href="${esc(DOWNLOAD)}">Download</a> · <a href="${esc(CANON_HOST)}">${esc(CANON_HOST.replace("https://",""))}</a></p>
</div></body></html>`;
}

export function homeBody({ q, rows, signed }) {
  const list = (rows || []).map((r) => {
    const kind = r.kind === "question" ? "Question" : "Post";
    const replies = Number(r.reply_count || 0);
    const reacts = Number(r.react_count || 0);
    return `<article class="doc"><span class="kind ${esc(r.kind)}">${kind}</span><h2><a href="/q/${esc(r.id)}">${esc(r.title || "(untitled)")}</a></h2><p class="meta">${esc(r.created_by)} · ${esc(when(r.created_utc))} · ${replies} ${replies === 1 ? "reply" : "replies"} · ${reacts} useful</p><p>${esc(String(r.body || "").slice(0, 280))}${String(r.body || "").length > 280 ? "…" : ""}</p></article>`;
  }).join("") || `<div class="empty"><strong>No questions yet.</strong> Anyone can read. Sign up to ask the first one.</div>`;
  const ask = signed
    ? `<p class="actions"><a class="button" href="/ask">Ask a question</a></p>`
    : `<p class="actions"><a class="button" href="/signup">Sign up to ask</a><a class="button ghost" href="/login">Log in</a></p>`;
  return `<section class="hero"><h1>Questions and posts</h1><p class="muted">Newest first. Every item is hash-chained into the public archive. Original bodies are never overwritten.</p>
<form class="hero-search" method="get" action="/"><input class="search" name="q" value="${esc(q || "")}" placeholder="Search questions and posts" aria-label="Search"><button>Search</button></form>${ask}</section>${list}`;
}

export function askBody({ signed, error, kind }) {
  if (!signed) {
    return `<div class="card"><h2>Sign in to ask</h2><p>Anyone can view. An account is required to post.</p><p class="actions"><a class="button" href="/login">Log in</a><a class="button ghost" href="/signup">Sign up</a></p></div>`;
  }
  const err = error ? `<p class="bad">${esc(error)}</p>` : "";
  const k = kind === "post" ? "post" : "question";
  return `<div class="card"><h2>Ask or post</h2>${err}<form method="post" action="/ask">
<label class="muted">Kind</label>
<select name="kind"><option value="question"${k === "question" ? " selected" : ""}>Question</option><option value="post"${k === "post" ? " selected" : ""}>Post</option></select>
<label class="muted" style="display:block;margin-top:12px">Title</label>
<input name="title" required maxlength="200" placeholder="Title">
<label class="muted" style="display:block;margin-top:12px">Body</label>
<textarea name="body" required maxlength="20000" placeholder="Write the question or post. It cannot be edited later."></textarea>
<p class="muted">Append-only. There is no edit or delete.</p>
<button>Publish</button>
</form></div>`;
}

export function threadBody({ post, replies, reacts, signed, error }) {
  if (!post) return `<div class="card"><h2>Not found</h2><p>That question or post is not in the archive.</p></div>`;
  const kind = post.kind === "question" ? "Question" : post.kind === "reply" ? "Reply" : "Post";
  const err = error ? `<p class="bad">${esc(error)}</p>` : "";
  const replyHtml = (replies || []).map((r) => {
    return `<article class="doc"><span class="kind">Reply</span><p class="meta">${esc(r.created_by)} · ${esc(when(r.created_utc))} · <a href="/receipt/${esc(r.id)}">receipt</a></p><p>${esc(r.body)}</p></article>`;
  }).join("") || `<p class="muted">No replies yet.</p>`;
  const form = signed
    ? `<div class="card"><h3>Reply</h3>${err}<form method="post" action="/q/${esc(post.id)}"><textarea name="body" required maxlength="20000" placeholder="Reply. It cannot be edited later."></textarea><p class="muted">Append-only.</p><button>Post reply</button></form></div>`
    : `<div class="card"><p>Sign in to reply.</p><p class="actions"><a class="button" href="/login">Log in</a><a class="button ghost" href="/signup">Sign up</a></p></div>`;
  const reactForm = signed
    ? `<form method="post" action="/react/${esc(post.id)}"><button class="ghost" name="kind" value="react">Mark useful (${Number(reacts || 0)})</button></form>`
    : `<span class="muted">${Number(reacts || 0)} useful</span>`;
  return `<section class="hero"><span class="kind ${esc(post.kind)}">${kind}</span><h1>${esc(post.title || "(untitled)")}</h1><p class="muted">${esc(post.created_by)} · ${esc(when(post.created_utc))} · SHA-256 ${esc(String(post.content_sha256 || "").slice(0, 12))}… · <a href="/receipt/${esc(post.id)}">receipt</a></p></section>
<article class="doc"><p>${esc(post.body)}</p><div class="actions">${reactForm}</div></article>
<h2>Replies</h2>${replyHtml}${form}`;
}

export function archiveBody({ report, recent }) {
  const head = report && report.ledger_head ? report.ledger_head : "0".repeat(64);
  const n = report && report.entries != null ? report.entries : 0;
  const rows = (recent || []).map((e) => {
    return `<article class="doc"><p class="meta">#${esc(e.sequence)} · ${esc(e.action)} · ${esc(when(e.timestamp_utc))}</p><p class="hash">entry ${esc(e.entry_hash)}</p><p class="hash muted">prev ${esc(e.previous_hash)}</p></article>`;
  }).join("") || `<p class="muted">No receipts yet.</p>`;
  return `<section class="hero"><h1>Archive</h1><p class="muted">Public hash-chain head and recent receipts. No secrets. Original posts are never overwritten.</p></section>
<div class="grid"><div class="card"><div class="metric">${esc(n)}</div><div class="muted">ledger entries</div></div><div class="card"><div class="muted">head</div><p class="hash">${esc(head)}</p></div></div>
<h2>Recent receipts</h2>${rows}`;
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
  return `<div class="card"><h2 class="${cls}">${title}</h2><p class="muted">The ledger is walked and each entry_hash is recomputed from canonical JSON (sorted keys, comma-colon separators) without the stored hash.</p><pre class="verify">${esc(JSON.stringify(safe, null, 2))}</pre></div>`;
}

export function receiptBody({ id, post, entries }) {
  if (!post && !(entries || []).length) {
    return `<div class="card"><h2>Not found</h2><p>No chain entries for ${esc(id)}.</p></div>`;
  }
  const rows = (entries || []).map((e) => {
    return `<article class="doc"><p class="meta">#${esc(e.sequence)} · ${esc(e.action)} · ${esc(when(e.timestamp_utc))}</p><p class="hash">entry ${esc(e.entry_hash)}</p><p class="hash muted">prev ${esc(e.previous_hash)}</p><pre class="verify">${esc(JSON.stringify(e.payload, null, 2))}</pre></article>`;
  }).join("");
  const title = post ? (post.title || post.id) : id;
  return `<section class="hero"><h1>Receipt</h1><p class="muted">${esc(title)} · append-only · <a href="/q/${esc((post && (post.parent_id || post.id)) || id)}">open thread</a></p></section>${rows}`;
}

export function loginBody({ error }) {
  const err = error ? `<p class="bad">${esc(error)}</p>` : "";
  return `<div class="card"><h2>Log in</h2>${err}<form method="post" action="/login"><input name="username" required placeholder="username" autocomplete="username">${pwField("password")}<button>Log in</button></form><p><a href="/signup">Sign up</a></p></div>`;
}

export function signupBody({ error }) {
  const err = error ? `<p class="bad">${esc(error)}</p>` : "";
  return `<div class="card"><h2>Sign up</h2><p class="muted">Anyone can view. An account is required to post or reply.</p>${err}<form method="post" action="/signup"><input name="username" required minlength="3" maxlength="40" placeholder="username" autocomplete="username">${pwField("password")}<button>Create account</button></form><p><a href="/login">Log in</a></p></div>`;
}
