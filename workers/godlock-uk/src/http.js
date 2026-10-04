/** Small HTTP helpers. Author: Aziel Eliab. */

/** Cloudflare Content-Signal. Same policy as robots.txt. Search and AI input/train stay open. */
export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Signal": CONTENT_SIGNAL,
  };
}

/** Public responses carry Content-Signal even when a proxy path built its own header set. */
export function stampContentSignal(response) {
  if (!response) return response;
  const headers = new Headers(response.headers);
  headers.set("Content-Signal", CONTENT_SIGNAL);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function cacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  };
}

export function json(body, status = 200, extraHeaders) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...cacheHeaders(),
      ...(extraHeaders || {}),
    },
  });
}

export function html(pageBody, { status = 200, extraHeaders } = {}) {
  return new Response(pageBody, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders(),
      ...cacheHeaders(),
      ...(extraHeaders || {}),
    },
  });
}

export function wantsJson(request, url) {
  if (url && url.searchParams.get("format") === "json") return true;
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  if (accept.includes("application/json") && !accept.includes("text/html")) return true;
  if (accept.includes("text/html")) return false;
  return request.method === "POST";
}

export function readCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const re = new RegExp("(?:^|;\\s*)" + name + "=([^;]+)");
  const m = raw.match(re);
  return m ? decodeURIComponent(m[1]) : "";
}
