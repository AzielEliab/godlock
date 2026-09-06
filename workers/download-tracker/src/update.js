/**
 * Client update prompt for GodLock. Calls runtime
 * GET /v1/update/check?slug=godlock&version=… when online.
 * Surfaces counted /download when update_available. Never overwrites.
 * Author: Aziel Eliab.
 */

export const RUNTIME_HOST = "https://aziel-runtime.vibelock.workers.dev";
export const UPDATE_CHECK_PATH = "/v1/update/check";
export const PULL_PATH = "/v1/pull/godlock";
export const COUNTED_DOWNLOAD = "https://godlock-download-tracker.vibelock.workers.dev/download";
export const SLUG = "godlock";
export const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

export function compareVersions(left, right) {
  const parts = (raw) => String(raw || "")
    .trim()
    .replace(/^[vV]/, "")
    .split(".")
    .map((chunk) => {
      const m = String(chunk).match(/^\d+/);
      return m ? parseInt(m[0], 10) : null;
    })
    .filter((n) => n != null);
  const a = parts(left);
  const b = parts(right);
  if (!a.length || !b.length) return 0;
  const n = Math.max(a.length, b.length);
  while (a.length < n) a.push(0);
  while (b.length < n) b.push(0);
  for (let i = 0; i < n; i++) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}

export function parseUpdateDoc(body, current) {
  if (!body || typeof body !== "object") return null;
  const latest = String(body.latest || body.latest_version || body.version || "").trim();
  const installed = String(body.current || body.installed || current || "").trim();
  const download = String(body.download || body.download_url || COUNTED_DOWNLOAD).trim() || COUNTED_DOWNLOAD;
  let flagged = body.update_available === true || String(body.update_available || "").toLowerCase() === "true";
  if (!flagged && latest && installed && compareVersions(latest, installed) > 0) flagged = true;
  if (body.error && !latest) return null;
  if (!latest && !flagged) return null;
  return {
    ok: true,
    slug: SLUG,
    version: installed || current,
    latest: latest || installed || current,
    update_available: !!flagged,
    download,
    forced: false,
    author: "Aziel Eliab",
  };
}

export function formatUpdatePrompt(doc) {
  if (!doc || !doc.update_available) return "";
  return (
    "Update available: GodLock " + (doc.latest || "") +
    " (you have " + (doc.version || "") + "). " +
    "Counted download (no silent overwrite): " + (doc.download || COUNTED_DOWNLOAD)
  );
}

async function readJson(res) {
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

export function updateCheckUrl(version) {
  return RUNTIME_HOST + UPDATE_CHECK_PATH + "?slug=" + encodeURIComponent(SLUG) + "&version=" + encodeURIComponent(version);
}

export async function checkGodlockUpdate(deps = {}) {
  const version = String(deps.version || "0.1.0");
  const httpFetch = deps.fetch || globalThis.fetch;
  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 2500;
  if (typeof httpFetch !== "function") return null;

  const urls = [updateCheckUrl(version), RUNTIME_HOST + PULL_PATH];
  for (const url of urls) {
    try {
      const ac = typeof AbortController === "function" ? new AbortController() : null;
      const timer = ac ? setTimeout(() => ac.abort(), timeoutMs) : null;
      const init = { headers: UA };
      if (ac) init.signal = ac.signal;
      const res = await httpFetch(url, init);
      if (timer) clearTimeout(timer);
      const parsed = parseUpdateDoc(await readJson(res), version);
      if (parsed) {
        parsed.source = url.includes(UPDATE_CHECK_PATH) ? "update-check" : "pull";
        parsed.forced = false;
        parsed.prompt = formatUpdatePrompt(parsed);
        return parsed;
      }
    } catch { /* try next / stay silent when offline */ }
  }
  return null;
}
