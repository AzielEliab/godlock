/**
 * AZL-DONATE-1.0 — static Donate door. Same copy and rails on /donate
 * and the homepage block. No KV, no D1 write, no unlock. Author: Aziel Eliab.
 * Donate signature is — Aziel. Site chrome stays Aziel Eliab.
 * Payment-URI QRs are solid black-on-white PNGs under /donate/qr/{id}.png.
 */
export const DONATE_SPEC = "AZL-DONATE-1.0";
export const DONATE_PATH = "/donate";
export const DONATE_QR_DIR = "/donate/qr";
export const DONATE_CANONICAL = "https://www.azieleliab.com/donate";
export const DONATE_TITLE = "Donate";
export const DONATE_SIGNATURE = "— Aziel";
export const DONATE_NETWORK_NOTE = "Send only on this network.";

export function donateQrSrc(id) {
  return DONATE_QR_DIR + "/" + String(id || "") + ".png";
}

export function donateQrIdFromPath(path) {
  const p = String(path || "");
  const prefix = DONATE_QR_DIR + "/";
  if (!p.startsWith(prefix) || !p.endsWith(".png")) return "";
  const id = p.slice(prefix.length, -4);
  return /^[a-z0-9]+$/.test(id) ? id : "";
}

export const DONATE_COPY = [
  "Nothing is free.",
  "This work has no corporate backer. No grant. No product that unlocks when you pay. Compute, hosting, and time have a cost. If a door stays open it is because the bill was paid.",
  "Donations keep the work in contact with what does not need a sponsor. They do not buy a vote, a feature, a name on a wall, or a quieter question.",
  "You do not owe this. If the work is useful, you already know what to do.",
  "Send only on the correct network. Double-check the address before you send. Wrong chain is a loss. There is no refund desk.",
  "The software remains free to run and fork. Payment is not a key.",
];

/** BTC ETH LTC XRP DOGE are the lattice rails. SOL and TRX stay as extras. */
export const DONATE_RAILS = [
  {
    id: "btc",
    symbol: "BTC",
    label: "Bitcoin",
    address: "bc1q8cg7hmgmu7x9yaja8j249np0vt84d4y8duugr7",
    uri: "bitcoin:bc1q8cg7hmgmu7x9yaja8j249np0vt84d4y8duugr7",
    extra: false,
  },
  {
    id: "eth",
    symbol: "ETH",
    label: "Ethereum",
    address: "0x29b386022e3968cf8dBFCE59569b49680184B23b",
    uri: "ethereum:0x29b386022e3968cf8dBFCE59569b49680184B23b",
    extra: false,
  },
  {
    id: "ltc",
    symbol: "LTC",
    label: "Litecoin",
    address: "LWuqPjMCFtLHvoBaQL4m8QtnxbXSDftVNs",
    uri: "litecoin:LWuqPjMCFtLHvoBaQL4m8QtnxbXSDftVNs",
    extra: false,
  },
  {
    id: "xrp",
    symbol: "XRP",
    label: "XRP",
    address: "rLc3jZJbgEU1wBGwTFtgyq8bpayQE15K7b",
    uri: "xrp:rLc3jZJbgEU1wBGwTFtgyq8bpayQE15K7b",
    extra: false,
    note: "No destination tag required.",
  },
  {
    id: "doge",
    symbol: "DOGE",
    label: "Dogecoin",
    address: "DQ4go4iLPfNXDWim4KptTh3565sFCVrCyp",
    uri: "dogecoin:DQ4go4iLPfNXDWim4KptTh3565sFCVrCyp",
    extra: false,
  },
  {
    id: "sol",
    symbol: "SOL",
    label: "Solana",
    address: "6BZNXxEvcZf1CgkWYojKoWUPCxCcNLbDKYRPfaN465gj",
    uri: "solana:6BZNXxEvcZf1CgkWYojKoWUPCxCcNLbDKYRPfaN465gj",
    extra: true,
  },
  {
    id: "trx",
    symbol: "TRX",
    label: "Tron",
    address: "TJXb1YhZ9pAYsEW6UKUAzxFUzH6Tzcacyy",
    uri: "tron:TJXb1YhZ9pAYsEW6UKUAzxFUzH6Tzcacyy",
    extra: true,
  },
];

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[c]));
}

export function donateText() {
  return DONATE_COPY.join("\n\n") + "\n\n" + DONATE_SIGNATURE + "\n";
}

export function publicRails(rails = DONATE_RAILS) {
  return (rails || []).map((r) => ({
    id: r.id,
    symbol: r.symbol,
    label: r.label,
    address: r.address,
    uri: r.uri,
    extra: !!r.extra,
    note: r.note || "",
    network_note: DONATE_NETWORK_NOTE,
    qr: donateQrSrc(r.id),
  }));
}

export function donateDoc() {
  return {
    ok: true,
    spec: DONATE_SPEC,
    product: "GodLock",
    site: "godlock.uk",
    author: "Aziel Eliab",
    identity: "Aziel Eliab",
    title: DONATE_TITLE,
    path: DONATE_PATH,
    canonical: DONATE_CANONICAL,
    text: donateText(),
    signature: DONATE_SIGNATURE,
    rails: publicRails(),
    unlock: false,
    kv: false,
    tip_jar: false,
  };
}

export function donateCopyHtml() {
  const paras = DONATE_COPY.map((p) => `<p>${esc(p)}</p>`).join("\n");
  return `${paras}\n<p class="about-sign donate-sign">${esc(DONATE_SIGNATURE)}</p>`;
}

export function donateRailHtml(rail) {
  const r = rail || {};
  const addr = String(r.address || "");
  const uri = String(r.uri || "");
  const src = r.id ? donateQrSrc(r.id) : "";
  const extra = r.extra ? `<span class="pill">extra</span>` : "";
  const note = r.note ? `<p class="muted">${esc(r.note)}</p>` : "";
  const alt = esc(r.symbol) + " payment URI";
  const qr = src
    ? `<div class="donate-qr"><img src="${esc(src)}" width="128" height="128" alt="${alt}" decoding="async"></div>`
    : "";
  return `<article class="donate-rail soft-card" id="donate-${esc(r.id)}" data-rail="${esc(r.id)}">
  <h3>${esc(r.symbol)} <span class="muted">${esc(r.label)}</span> ${extra}</h3>
  <p class="hash donate-addr">${esc(addr)}</p>
  ${note}
  <p class="muted">${esc(DONATE_NETWORK_NOTE)}</p>
  <div class="donate-actions">
    <button type="button" class="button ghost" data-copy="${esc(addr)}">Copy</button>
    <a class="button ghost" href="${esc(uri)}">Open in wallet</a>
  </div>
  ${qr}
</article>`;
}

export function donateRailsHtml(rails = DONATE_RAILS) {
  return `<div class="donate-rails">${(rails || []).map(donateRailHtml).join("")}</div>`;
}

export function donateCanonicalLine() {
  return `<p class="muted">Same door: <a href="${esc(DONATE_CANONICAL)}">${esc(DONATE_CANONICAL)}</a></p>`;
}

export function donateCopyScript() {
  return `<script>
(function(){
  document.querySelectorAll("[data-copy]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var t = btn.getAttribute("data-copy") || "";
      if (!t) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).catch(function(){});
      }
    });
  });
})();
</script>`;
}

/** Full /donate body. Static island — no counters, no unlock copy. */
export function donateBody() {
  return `<section class="about-aziel" id="donate"><div class="card about-prose donate-copy">
<h1 class="soft-heading">${esc(DONATE_TITLE)}</h1>
${donateCopyHtml()}
</div>
${donateRailsHtml()}
<div class="card">${donateCanonicalLine()}</div>
${donateCopyScript()}
</section>`;
}

/** Homepage block: same copy and rails as /donate. */
export function donateHomeBlock() {
  return `<section class="donate-home" id="donate">
<div class="card about-prose donate-copy">
  <h2>${esc(DONATE_TITLE)}</h2>
  ${donateCopyHtml()}
  <p class="muted"><a href="${esc(DONATE_PATH)}">Donate door</a></p>
  ${donateCanonicalLine()}
</div>
${donateRailsHtml()}
${donateCopyScript()}
</section>`;
}

export function donateTouchesStorage(env) {
  void env;
  return false;
}
