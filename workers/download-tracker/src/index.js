import { handleRuntime } from "./runtime.js";
import { robotsTxt, sitemapXml, citeDoc, llmsDoc } from "./discover.js";
import { classifyRequest, readBotManagement } from "./classify.js";
import {
  isolatedKeys,
  isReservedCounterKey,
  shapeCountBody,
  shapeHumanBotFields,
} from "./stats-shape.js";

/**
 * GodLock download tracker (Cloudflare Worker).
 *
 * GET  /download?repo=AzielEliab/godlock&tag=latest&asset=...
 *      increments KV, 302 to the GitHub release asset
 *      (default https://github.com/AzielEliab/godlock/releases)
 * GET  /count   {project, views, downloads, total} — total is the download tally
 * GET  /stats   JSON totals + per-repo + per-branch breakdown
 * POST /event   forks report a download {owner,repo,branch,fork,asset}
 *
 * KV binding DOWNLOADS. Keys: project|owner|repo|branch|fork
 * CORS *. No secrets in this tree.
 */

const PROJECT = "godlock";
const KEYS = isolatedKeys(PROJECT);

const DEFAULT_ASSET = "godlock-0.1.0.tar.gz";
const DEFAULT_OWNER = "AzielEliab";
const DEFAULT_REPO = "godlock";
const DEFAULT_BRANCH = "main";
const HOST = "https://godlock-download-tracker.vibelock.workers.dev";
const GITHUB_REPO = "https://github.com/AzielEliab/godlock";
/** Same-origin rose-star brand mark (Aziel Eliab). Empty alt — no words on the mark. */
const BRAND_MARK_PATH = "/sigil.png";

const GITHUB_RELEASES = "https://github.com/AzielEliab/godlock/releases";
const GITHUB_LATEST = "https://github.com/AzielEliab/godlock/releases/latest";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}

function redirect(url) {
  return new Response(null, {
    status: 302,
    headers: { Location: url, ...corsHeaders() },
  });
}

function splitOwnerRepo(value, fallbackOwner, fallbackRepo) {
  if (typeof value === "string" && value.includes("/")) {
    const [o, r] = value.split("/").filter(Boolean);
    if (o && r) return { owner: o, repo: r };
  }
  return { owner: fallbackOwner, repo: fallbackRepo };
}

function parseDims(src) {
  const get = (k) => {
    if (src == null) return null;
    if (typeof src.get === "function") {
      const v = src.get(k);
      return v == null || v === "" ? null : v;
    }
    const v = src[k];
    return v == null || v === "" ? null : v;
  };

  let owner = get("owner") || DEFAULT_OWNER;
  let repo = get("repo") || DEFAULT_REPO;
  if (typeof repo === "string" && repo.includes("/")) {
    const split = splitOwnerRepo(repo, owner, DEFAULT_REPO);
    owner = split.owner;
    repo = split.repo;
  }

  const branch = get("branch") || DEFAULT_BRANCH;
  const tag = get("tag") || "latest";
  const asset = get("asset") || "";

  const forkRaw = get("fork");
  let fork = "0";
  if (forkRaw === 1 || forkRaw === true || forkRaw === "1" || forkRaw === "true") {
    fork = "1";
  } else if (typeof forkRaw === "string" && forkRaw.includes("/")) {
    const split = splitOwnerRepo(forkRaw, owner, repo);
    owner = split.owner;
    repo = split.repo;
    fork = "1";
  } else if (forkRaw != null && forkRaw !== 0 && forkRaw !== false && forkRaw !== "0" && forkRaw !== "false") {
    fork = "1";
  }

  if (`${owner}/${repo}`.toLowerCase() !== `${DEFAULT_OWNER}/${DEFAULT_REPO}`.toLowerCase()) {
    fork = "1";
  }

  return { project: PROJECT, owner, repo, branch, fork, tag, asset };
}

function kvKey(dims) {
  return `${dims.project}|${dims.owner}|${dims.repo}|${dims.branch}|${dims.fork}`;
}

function githubAssetUrl(owner, repo, tag, asset) {
  if (!asset) {
    if (owner === DEFAULT_OWNER && repo === DEFAULT_REPO) return GITHUB_RELEASES;
    return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases`;
  }
  if (!tag || tag === "latest") {
    return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest/download/${encodeURIComponent(asset)}`;
  }
  return `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(asset)}`;
}


async function bump(env, key) {
  const n = parseInt((await env.DOWNLOADS.get(key)) || "0", 10) + 1;
  await env.DOWNLOADS.put(key, String(n));
  return n;
}

async function incrementSplit(env, humanKey, botKey, request) {
  const cls = classifyRequest(request);
  const splitKey = cls.bucket === "human" ? humanKey : botKey;
  await bump(env, splitKey);
  return cls;
}

async function readHumanBotSplit(env, request) {
  const views = parseInt((await env.DOWNLOADS.get(KEYS.views)) || "0", 10) || 0;
  const downloadsRaw = await env.DOWNLOADS.get(KEYS.total);
  let downloads = parseInt(downloadsRaw || "0", 10);
  if (!Number.isFinite(downloads) || downloads < 0) downloads = 0;
  const viewsHuman = parseInt((await env.DOWNLOADS.get(KEYS.views_human)) || "0", 10) || 0;
  const downloadsHuman = parseInt((await env.DOWNLOADS.get(KEYS.downloads_human)) || "0", 10) || 0;
  const botManagementAvailable = readBotManagement(request).available;
  return shapeHumanBotFields({
    views,
    downloads,
    views_human: viewsHuman,
    downloads_human: downloadsHuman,
    botManagementAvailable,
  });
}

function enrichStatsWithHumanBot(stats, split) {
  return {
    ...stats,
    views_human: split.views_human,
    views_bot: split.views_bot,
    downloads_human: split.downloads_human,
    downloads_bot: split.downloads_bot,
    human: split.human,
    bot: split.bot,
    classification: split.classification,
  };
}

async function increment(env, dims, request) {
  const key = kvKey(dims);
  const n = parseInt((await env.DOWNLOADS.get(key)) || "0", 10) + 1;
  await env.DOWNLOADS.put(key, String(n));
  if (request) await incrementSplit(env, KEYS.downloads_human, KEYS.downloads_bot, request);

  return n;
}

async function listAllKeys(env) {
  const keys = [];
  let cursor;
  do {
    const page = await env.DOWNLOADS.list(cursor ? { cursor } : {});
    keys.push(...page.keys);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return keys;
}

function viewsKey() {
  return PROJECT + "|__views__";
}

function isViewsKey(name) {
  return name === viewsKey() || String(name).split("|").includes("__views__");
}

function asCount(raw) {
  const n = parseInt(raw || "0", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function readViews(env) {
  return asCount(await env.DOWNLOADS.get(viewsKey()));
}


async function countPayloadAsync(env, request) {
  const stats = await collectStats(env, request);
  const views = Number(stats.views) || 0;
  const downloads = Number(stats.downloads != null ? stats.downloads : stats.total) || 0;
  return shapeCountBody({
    project: PROJECT,
    views,
    downloads,
    total: downloads,
    views_human: stats.views_human,
    downloads_human: stats.downloads_human,
    botManagementAvailable: readBotManagement(request).available,
  });
}

function countPayload(stats) {
  const views = Number(stats.views) || 0;
  const downloads = Number(stats.downloads != null ? stats.downloads : stats.total) || 0;
  return {
    project: PROJECT,
    views,
    downloads,
    // Sibling product Workers (azbrowser, fraggate, aznet, azhub, azinterface)
    // publish total as the download tally, not views+downloads.
    total: downloads,
  };
}

async function collectStats(env, request) {
  const keys = await listAllKeys(env);
  let downloads = 0;
  const by_repo = {};
  const by_branch = {};
  const by_fork = { "0": 0, "1": 0 };
  const breakdown = [];

  for (const k of keys) {
    const name = k.name;
    if (isReservedCounterKey(name, PROJECT) || (typeof isViewsKey === 'function' && isViewsKey(name))) continue;
    const n = asCount(await env.DOWNLOADS.get(name));
    if (n <= 0) continue;
    const parts = name.split("|");
    if (parts.length < 5) continue;
    const [project, owner, repo, branch, fork] = parts;
    downloads += n;
    const repoId = `${owner}/${repo}`;
    by_repo[repoId] = (by_repo[repoId] || 0) + n;
    by_branch[branch] = (by_branch[branch] || 0) + n;
    const forkFlag = fork === "1" ? "1" : "0";
    by_fork[forkFlag] = (by_fork[forkFlag] || 0) + n;
    breakdown.push({ project, owner, repo, branch, fork: forkFlag, count: n });
  }

  const views = await readViews(env);
  const __hbViews = parseInt((await env.DOWNLOADS.get(KEYS.views)) || "0", 10) || 0;
  const __hbViewsHuman = parseInt((await env.DOWNLOADS.get(KEYS.views_human)) || "0", 10) || 0;
  const __hbDownloadsHuman = parseInt((await env.DOWNLOADS.get(KEYS.downloads_human)) || "0", 10) || 0;
  const __hbBotMgmt = request ? readBotManagement(request).available : false;

  return {
    ...shapeHumanBotFields({
      views: (typeof views !== 'undefined' ? views : __hbViews),
      downloads: (typeof downloads !== 'undefined' ? downloads : (typeof shown !== 'undefined' ? shown : (typeof total !== 'undefined' ? total : 0))),
      views_human: __hbViewsHuman,
      downloads_human: __hbDownloadsHuman,
      botManagementAvailable: __hbBotMgmt,
    }),

    project: PROJECT,
    views,
    downloads,
    total: downloads,
    by_repo,
    by_branch,
    by_fork,
    breakdown,
    note: "Forks identified by GitHub owner/repo. Key layout: project|owner|repo|branch|fork. GET /count is {project, views, downloads, total}; total is the download tally (same as downloads), matching sibling product Workers.",
  };
}

async function incrementViews(env, request) {
  const n = asCount(await env.DOWNLOADS.get(viewsKey())) + 1;
  await env.DOWNLOADS.put(viewsKey(), String(n));
  if (request) await incrementSplit(env, KEYS.views_human, KEYS.views_bot, request);

  return n;
}

function installScript() {
  return `#!/usr/bin/env bash
# GodLock one-click install. Counted download via this Worker.
set -euo pipefail
HOST="${HOST}"
ASSET="${DEFAULT_ASSET}"
VERSION="\${GODLOCK_VERSION:-0.1.0}"
RUNTIME="\${AZIEL_RUNTIME_HOST:-https://aziel-runtime.vibelock.workers.dev}"
WORKDIR="\${GODLOCK_HOME:-\$HOME/godlock}"
mkdir -p "\$WORKDIR"
cd "\$WORKDIR"
echo "Downloading counted tarball from \${HOST}/download (User-Agent Mozilla/5.0)…"
curl -fsSL -A 'Mozilla/5.0' "\${HOST}/download?asset=\${ASSET}" -o "\${ASSET}"
tar -xzf "\${ASSET}"
DIR="\$(find . -maxdepth 1 -type d -name 'godlock-*' | head -n 1)"
if [ -n "\${DIR}" ]; then
  cd "\${DIR}"
fi
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -U pip
python -m pip install -e .
echo
echo "Installed GodLock."
UPDATE_JSON="\$(curl -fsSL -A 'Mozilla/5.0' --max-time 3 "\${RUNTIME}/v1/update/check?slug=godlock&version=\${VERSION}" 2>/dev/null || true)"
if [ -z "\$UPDATE_JSON" ]; then
  UPDATE_JSON="\$(curl -fsSL -A 'Mozilla/5.0' --max-time 3 "\${RUNTIME}/v1/pull/godlock" 2>/dev/null || true)"
fi
case "\$UPDATE_JSON" in
  *'"update_available":true'*|*'"update_available": true'*)
    echo "Update available (you have \${VERSION}). Counted download (no silent overwrite): \${HOST}/download"
    ;;
esac
echo "Run:  godlock ui"
echo "Then open http://127.0.0.1:8080  (loopback only)"
echo "Author: Aziel Eliab."
`;
}

async function serveBrandMark(request, env) {
  if (!env.ASSETS) {
    return json({ error: "assets binding missing" }, 500);
  }
  const assetUrl = new URL(BRAND_MARK_PATH, request.url);
  const assetRes = await env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }));
  if (!assetRes.ok) {
    return json({ error: "asset not hosted", asset: "sigil.png", status: assetRes.status }, 404);
  }
  const headers = new Headers();
  headers.set("Content-Type", "image/png");
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  const len = assetRes.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);
  for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, v);
  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(assetRes.body, { status: 200, headers });
}

async function serveAsset(request, env, asset, { head = false } = {}) {
  if (!env.ASSETS) {
    return json({ error: "assets binding missing" }, 500);
  }
  const assetUrl = new URL("/" + asset, request.url);
  const assetRes = await env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }));
  if (!assetRes.ok) {
    return json({ error: "asset not hosted", asset, status: assetRes.status }, 404);
  }
  const headers = new Headers();
  headers.set("Content-Type", "application/gzip");
  headers.set("Content-Disposition", 'attachment; filename="' + asset.replaceAll('"', "") + '"');
  headers.set("Cache-Control", "private, no-store");
  const len = assetRes.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);
  for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, v);
  if (head) {
    return new Response(null, { status: 200, headers });
  }
  return new Response(assetRes.body, { status: 200, headers });
}

async function indexHtml(env) {
  const stats = await collectStats(env);
  const downloads = Number(stats.downloads != null ? stats.downloads : stats.total) || 0;
  const views = Number(stats.views) || 0;
  const v = views.toLocaleString("en-US");
  const n = downloads.toLocaleString("en-US");
  const breakdown = (stats.breakdown || [])
    .map(
      (b) =>
        `<li><code>${b.owner}/${b.repo}</code> branch <code>${b.branch}</code> fork=${b.fork} → ${b.count}</li>`,
    )
    .join("") || "<li>none yet</li>";
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GodLock — Aziel Eliab</title>
<meta name="description" content="Specified Fit stress-test and resilience engine by Aziel Eliab. It records, analyzes, hardens, and grows.">
<meta name="author" content="Aziel Eliab">
<link rel="canonical" href="https://godlock-download-tracker.vibelock.workers.dev/">
<link rel="alternate" href="/cite.json" type="application/json">
<link rel="alternate" href="/llms.txt" type="text/plain">
<link rel="alternate" href="/ai.txt" type="text/plain">
<link rel="alternate" href="/openapi.json" type="application/json" title="OpenAPI">
<meta property="og:title" content="GodLock — Aziel Eliab">
<meta property="og:description" content="Specified Fit stress-test and resilience engine by Aziel Eliab. It records, analyzes, hardens, and grows.">
<meta property="og:url" content="https://godlock-download-tracker.vibelock.workers.dev/">
<meta property="og:type" content="website">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "GodLock",
  "author": {
    "@type": "Person",
    "name": "Aziel Eliab"
  },
  "codeRepository": "https://github.com/AzielEliab/godlock",
  "downloadUrl": "https://godlock-download-tracker.vibelock.workers.dev/download",
  "license": "https://www.apache.org/licenses/LICENSE-2.0",
  "url": "https://godlock-download-tracker.vibelock.workers.dev/",
  "description": "Specified Fit stress-test and resilience engine by Aziel Eliab. It records, analyzes, hardens, and grows."
}
</script>
<!-- gitbaby-seo -->
<style>
  :root {
    color-scheme: dark;
    --bg: #0b0b0b; --panel: #141414; --ink: #e8e0d0; --muted: #b7c2d0;
    --line: #2a2414; --gold: #c9a227; --gold-fill: #c9a227; --ink-on-gold: #14110a;
    --focus: #f0d78c; --field: #0e0e0e;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink); }
  body { font: 16px/1.5 system-ui, "Segoe UI", sans-serif; }
  a { color: var(--gold); }
  a:focus-visible, button:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
  code, pre { font-family: ui-monospace, Menlo, Consolas, monospace; }
  .wrap { max-width: 42rem; margin: 0 auto; padding: 1.4rem 1.2rem 4rem; }
  .brandrow { display: flex; align-items: center; gap: 12px; margin: 0 0 8px; min-height: 48px; }
  .brandmark { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; flex: 0 0 40px; box-shadow: 0 0 0 1px #d4af3733; }
  .stamp { margin: 0 0 8px; color: var(--gold); font-size: .88rem; letter-spacing: .02em; }
  h1 { font-size: 2rem; letter-spacing: .02em; margin: 0 0 .2rem; }
  .motto { color: var(--gold); font-style: italic; margin: 0 0 .7rem; }
  .lede { color: var(--muted); margin: 0 0 1rem; max-width: 40rem; }
  nav.toc { display: flex; flex-wrap: wrap; gap: .55rem; margin: 0 0 1.1rem; }
  nav.toc a { text-decoration: none; color: var(--ink); border: 1px solid var(--line); background: var(--panel); border-radius: 999px; padding: .45rem .75rem; min-height: 44px; display: inline-flex; align-items: center; font-size: .88rem; }
  .card, .cite { border: 1px solid var(--line); border-radius: 14px; padding: 1.15rem 1.2rem 1.25rem; background: var(--panel); margin: 0 0 1.1rem; }
  h2 { font-size: 1.12rem; margin: 0 0 .45rem; letter-spacing: .02em; }
  .kicker { display: block; font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); margin-bottom: .15rem; font-family: ui-monospace, Menlo, Consolas, monospace; }
  .nums { display: grid; grid-template-columns: 1fr; gap: .8rem; margin: 0 0 1rem; }
  .count { font-size: 2.1rem; font-variant-numeric: tabular-nums; font-weight: 700; margin: 0; }
  .count .lbl { display: block; font-size: .92rem; font-weight: 500; color: var(--muted); }
  .btns { display: grid; grid-template-columns: 1fr; gap: .75rem; margin: 0 0 .85rem; }
  a.btn, button.btn { display: block; width: 100%; box-sizing: border-box; text-align: center; font: inherit; font-size: 1.15rem; font-weight: 750; padding: 1rem 1.1rem; min-height: 44px; border-radius: 10px; border: 0; cursor: pointer; text-decoration: none; }
  a.btn.primary { background: #e8eaef; color: #0e1014; }
  button.btn.install { background: var(--gold-fill); color: var(--ink-on-gold); }
  button.btn.install.copied { background: #7dcf9a; color: #0e1014; }
  pre { background: var(--field); color: var(--ink); padding: .75rem .9rem; overflow: auto; border-radius: 8px; font-size: .82rem; border: 1px solid var(--line); }
  .meta, .iso { margin: .85rem 0 0; color: var(--muted); font-size: .92rem; }
  details { margin-top: 1rem; }
  summary { cursor: pointer; color: var(--ink); }
  footer { color: var(--muted); font-size: .9rem; margin-top: .4rem; }
  @media (min-width: 640px) {
    .nums { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .btns { grid-template-columns: 1fr 1fr; }
  }
  @media (prefers-color-scheme: light) {
    :root {
      color-scheme: light;
      --bg: #f6f1e7; --panel: #fffdf8; --ink: #1c160f; --muted: #5a4e3e;
      --line: #d9cbb6; --gold: #7a5a00; --gold-fill: #c9a227; --ink-on-gold: #14110a;
      --focus: #5c4300; --field: #fffdf8;
    }
  }
</style>
<body>
<div class="wrap">
  <header>
    <div class="brandrow"><img class="brandmark" src="/sigil.png" width="40" height="40" alt="" decoding="async"></div>
    <p class="stamp">Author Aziel Eliab</p>
    <h1>GodLock</h1>
    <p class="motto">GodLock does not argue. It records, analyzes, hardens, and grows.</p>
    <p class="lede">Specified Fit stress-test and resilience engine. Download saves the gzip. Install runs on this computer.</p>
    <nav class="toc" aria-label="Product">
      <a href="#install">Download</a>
      <a href="https://godlock.uk/software">Softwares</a>
      <a href="https://godlock.uk/">Engine</a>
      <a href="/openapi.json">OpenAPI</a>
      <a href="${GITHUB_REPO}">GitHub</a>
    </nav>
  </header>
  <section class="card" id="install">
    <h2><span class="kicker">Counted package</span>Download and one-click install</h2>
    <div class="nums">
      <p class="count"><span id="Nodes">—</span>/<span id="LiveNodes">—</span><span class="lbl">Nodes / Live Nodes</span></p>
      <p class="count">${v}<span class="lbl">Views</span></p>
      <p class="count">${n}<span class="lbl">Downloads</span></p>
    </div>
    <p class="lede">Download saves the gzip from this Worker (the Downloads number goes up). One-click install copies a Terminal command. Then run <code>godlock ui</code> and open http://127.0.0.1:8080 on this computer. Tap Record, Verify, Import JSON, or Export JSON.</p>
    <div class="btns">
      <a class="btn primary dl" href="/download?asset=${DEFAULT_ASSET}">Download</a>
      <button type="button" class="btn install" id="install-btn">One-click install</button>
    </div>
    <pre id="install-cmd">curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash</pre>
    <p class="lede">Then run <code>godlock ui</code>. <code>godlock doctor</code> prints PASS or FAIL.</p>
    <p class="meta">The download count ticks on the Download click. The Worker serves the gzip (HTTP 200). Forks using this same link are counted. ${DEFAULT_ASSET} — ${n} counted.</p>
    <p class="iso">Isolated counter: Worker <code>godlock-download-tracker</code>, project <code>godlock</code>, KV <code>GODLOCK_DOWNLOADS</code>. /v1 does not increment downloads.</p>
    <p class="meta"><a href="/stats">JSON stats</a> · <a href="/openapi.json">OpenAPI</a> · <a href="/v1/skill">Skill</a> · <a href="/ai">AI runtime</a> · <a href="${GITHUB_REPO}">GitHub</a> · <a href="${GITHUB_LATEST}">releases</a></p>
    <details>
      <summary>Branches and forks</summary>
      <ul>${breakdown}</ul>
    </details>
  </section>
  <section class="cite" id="cite">
    <h2>How to cite</h2>
    <p>Aziel Eliab. GodLock. https://github.com/AzielEliab/godlock. https://godlock-download-tracker.vibelock.workers.dev.</p>
    <p><a href="https://aziel-runtime.vibelock.workers.dev/">Catalog</a> · <a href="https://aziel-runtime.vibelock.workers.dev/v1/software">Software</a> · <a href="https://github.com/AzielEliab/godlock">GitHub</a> · <a href="https://godlock-download-tracker.vibelock.workers.dev/download">Download</a> · <a href="https://godlock-download-tracker.vibelock.workers.dev/cite.json">cite.json</a> · <a href="https://godlock-download-tracker.vibelock.workers.dev/llms.txt">llms.txt</a> · <a href="https://godlock-download-tracker.vibelock.workers.dev/openapi.json">OpenAPI</a></p>
  </section>
  <footer>Aziel Eliab · <a href="https://godlock.uk/">godlock.uk</a> · <a href="https://godlock.uk/software">Softwares</a></footer>
</div>
<script>
  (function () {
    var cmd = "curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash";
    var btn = document.getElementById("install-btn");
    var pre = document.getElementById("install-cmd");
    if (btn) {
      btn.addEventListener("click", function () {
        function done(ok) {
          btn.textContent = ok ? "Copied! Paste in Terminal, then run godlock ui" : "Select the command, copy it, then run godlock ui";
          btn.classList.add("copied");
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(cmd).then(function () { done(true); }).catch(function () { done(false); });
        } else {
          done(false);
          if (pre && window.getSelection) {
            var r = document.createRange();
            r.selectNodeContents(pre);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(r);
          }
        }
      });
    }
    var nodesEl = document.getElementById("Nodes");
    var liveEl = document.getElementById("LiveNodes");
    if (!nodesEl || !liveEl || typeof fetch !== "function") return;
    function asCount(v) {
      return typeof v === "number" && isFinite(v) && v >= 0 ? Math.floor(v) : null;
    }
    fetch("https://aziel-runtime.vibelock.workers.dev/v1/mesh", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        j = j || {};
        var nodes = asCount(j.nodes);
        if (nodes == null && (asCount(j.human_mesh_users) != null || asCount(j.human_uses) != null)) {
          nodes = (asCount(j.human_mesh_users) || 0) + (asCount(j.human_uses) || 0);
        }
        var live = asCount(j.live_nodes);
        if (live == null && j.rollup && asCount(j.rollup.mesh) != null) live = asCount(j.rollup.mesh);
        if (nodes != null) nodesEl.textContent = String(nodes);
        if (live != null) liveEl.textContent = String(live);
      })
      .catch(function () {});
  })();
</script>
<!-- /gitbaby-seo -->
</body>
</html>`;
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const runtime = await handleRuntime(request, url, env);
    if (runtime) return runtime;

    if ((url.pathname === BRAND_MARK_PATH || url.pathname === BRAND_MARK_PATH + "/") && (request.method === "GET" || request.method === "HEAD")) {
      return serveBrandMark(request, env);
    }

    if ((url.pathname === "/install.sh" || url.pathname === "/install.sh/") && request.method === "GET") {
      return new Response(installScript(), {
        status: 200,
        headers: {
          "Content-Type": "text/x-shellscript; charset=utf-8",
          "Cache-Control": "private, no-store",
          ...corsHeaders(),
        },
      });
    }


    if (url.pathname === "/" && request.method === "GET") {
      await incrementViews(env, request);
      return new Response(await indexHtml(env), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders() },
      });
    }

    if (url.pathname === "/count" && request.method === "GET") {
      return json(await countPayloadAsync(env, request));
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      return json(await collectStats(env, request));
    }

    if (url.pathname === "/event" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "JSON body required" }, 400);
      }
      const dims = parseDims(body || {});
      const count = await increment(env, dims, request);
      return json({
        ok: true,
        key: kvKey(dims),
        count,
        owner: dims.owner,
        repo: dims.repo,
        branch: dims.branch,
        fork: dims.fork,
        asset: dims.asset || null,
      });
    }

    if (url.pathname === "/go" && (request.method === "GET" || request.method === "HEAD")) {
      const dims = parseDims(url.searchParams);
      const asset = dims.asset || DEFAULT_ASSET;
      dims.asset = asset;
      if (request.method === "GET") await increment(env, dims, request);
      return serveAsset(request, env, asset, { head: request.method === "HEAD" });
    }

    if ((url.pathname === "/download" || url.pathname.startsWith("/download/")) && (request.method === "GET" || request.method === "HEAD")) {
      const dims = parseDims(url.searchParams);
      if (!dims.asset && url.pathname.startsWith("/download/")) {
        dims.asset = decodeURIComponent(url.pathname.slice("/download/".length));
      }
      const asset = dims.asset || DEFAULT_ASSET;
      dims.asset = asset;
      if (request.method === "GET") await increment(env, dims, request);
      return serveAsset(request, env, asset, { head: request.method === "HEAD" });
    }


    // gitbaby-seo-routes
    if ((url.pathname === "/robots.txt" || url.pathname === "/robots.txt/") && request.method === "GET") {
      return new Response(robotsTxt(), {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() },
      });
    }
    if ((url.pathname === "/sitemap.xml" || url.pathname === "/sitemap.xml/") && request.method === "GET") {
      return new Response(sitemapXml(), {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8", ...corsHeaders() },
      });
    }
    if ((url.pathname === "/cite.json" || url.pathname === "/cite.json/") && request.method === "GET") {
      return json(citeDoc());
    }
    if ((url.pathname === "/llms.txt" || url.pathname === "/llms.txt/" || url.pathname === "/ai.txt" || url.pathname === "/ai.txt/") && request.method === "GET") {
      return new Response(llmsDoc(), {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() },
      });
    }
    // /gitbaby-seo-routes
    return json({ error: "not found" }, 404);
  },
};
