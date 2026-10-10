/**
 * Filter the owner catalog (aziel_works.json) into the Worker works module.
 * Usage: node scripts/build-aziel-works.mjs /path/to/aziel_works.json
 *
 * Emits only verified:true items with no caution field and no doi.org / zenodo.org URL.
 * Skips own_software:false forks. Does not copy Zenodo DOI fields.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(process.argv[2] || "");
if (!source || source === resolve("")) {
  console.error("Pass the path to aziel_works.json");
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(source, "utf8"));
const ORDER = ["software", "websites", "hardware", "philosophy", "archives", "research_papers"];

const CURATED_PAPER_IDS = new Set([
  "AZDOC-E03E61D8E50B",
  "AZDOC-F22AD0DCAA9D",
  "AZDOC-E3ABDBF3A1EA",
  "AZDOC-E00603883906",
  "AZDOC-0671040C36E6",
]);
const CURATED_PHILOSOPHY_IDS = new Set([
  "AZDOC-56EF7B9F55F1",
  "AZDOC-A53F8E3052E2",
  "AZDOC-D4BD09136A6C",
  "AZDOC-8F14A40DC9A6",
  "AZDOC-A004166120D6",
  "AZDOC-75D6EC3113C1",
]);
const CURATED_ARCHIVE_URLS = new Set([
  "https://hedidntjump.com/volumes",
  "https://hedidntjump.com/volumes/volume-1.pdf",
  "https://hedidntjump.com/volumes/volume-2.pdf",
  "https://hedidntjump.com/volumes/volume-3.pdf",
  "https://hedidntjump.com/volumes/volume-4.pdf",
  "https://hedidntjump.com/volumes/volume-5.pdf",
]);

function eligible(item) {
  if (!item || item.verified !== true || item.caution) return false;
  if (item.own_software === false) return false;
  const url = String(item.url || "");
  if (!/^https:\/\//.test(url)) return false;
  if (/doi\.org|zenodo\.org/i.test(url)) return false;
  return true;
}

function publicName(item) {
  if (item.name === "Wearable Dual-Tether Web-Sling System") {
    return "Webslinger (Wearable Dual-Tether Web-Sling System)";
  }
  if (item.url === "https://github.com/AzielEliab/azos") return "AZ-OS";
  return item.name;
}

function publicDomain(item) {
  const domain = String(item.domain || "");
  const blob = domain + " " + item.name + " " + item.url;
  if (/hedidntjump|zioncheck/i.test(blob) && /\bARG\b|\bgame\b/i.test(domain)) {
    return "historical document archive";
  }
  return domain;
}

function publicType(item, category) {
  if (category === "hardware") return "Product";
  return item.type || "CreativeWork";
}

function record(item, category) {
  return {
    name: publicName(item),
    url: item.url,
    type: publicType(item, category),
    description: String(item.description || ""),
    category,
    domain: publicDomain(item),
  };
}

/** GodLock public HTML forbids these tokens outside machine files. */
function htmlSafeCurated(item) {
  const blob = [item.name, item.description, item.url].join(" ");
  if (/\bABAD\b/.test(blob)) return false;
  if (/Whitestone/.test(blob)) return false;
  if (/The ARK/.test(blob)) return false;
  return true;
}

function curatedPick(item, category) {
  if (!eligible(item) || !item.featured) return false;
  if (!htmlSafeCurated(item)) return false;
  if (category === "software" || category === "websites" || category === "hardware") return true;
  if (category === "archives") return CURATED_ARCHIVE_URLS.has(item.url);
  if (category === "philosophy") return CURATED_PHILOSOPHY_IDS.has(item.corpus_record_id);
  if (category === "research_papers") return CURATED_PAPER_IDS.has(item.corpus_record_id);
  return false;
}

const works = [];
const curated = [];
const seen = new Set();

for (const category of ORDER) {
  for (const item of catalog.categories[category] || []) {
    if (!eligible(item) || seen.has(item.url)) continue;
    seen.add(item.url);
    const row = record(item, category);
    works.push(row);
    if (curatedPick(item, category)) curated.push(row);
  }
}

for (const item of catalog.categories.software || []) {
  const home = item.homepage;
  if (!home || home.http_status !== 200 || item.own_software === false) continue;
  const url = String(home.url || "");
  if (!/^https:\/\//.test(url) || seen.has(url)) continue;
  if (/glama\.ai|doi\.org|zenodo\.org/i.test(url)) continue;
  seen.add(url);
  works.push({
    name: (home.title || item.name) + "",
    url,
    type: "SoftwareApplication",
    description: publicName(item) + " public homepage.",
    category: "software",
    domain: publicDomain(item),
  });
}

const listings = [];
for (const item of catalog.categories.listings || []) {
  if (!eligible(item)) continue;
  listings.push({
    name: item.name,
    url: item.url,
    type: "WebPage",
    description: String(item.description || ""),
    category: "listings",
    domain: String(item.domain || ""),
    platform: item.platform || "",
  });
}

if (curated.length < 30 || curated.length > 60) {
  console.error("Curated set is " + curated.length + "; expected 30–60");
  process.exit(1);
}

const out = {
  generated: catalog.generated,
  person_id: "https://www.azieleliab.com/#aziel",
  note: "Filtered from the owner catalog. verified:true, no caution, no doi.org or zenodo.org URL, no third-party forks. He Didn't Jump is a document archive.",
  curated,
  works,
  listings,
};

const dest = resolve(here, "../src/azielWorksData.js");
const body = "/** Generated by scripts/build-aziel-works.mjs. Do not hand-edit. */\n"
  + "export const AZIEL_WORKS_DATA = "
  + JSON.stringify(out, null, 2)
  + ";\n";
writeFileSync(dest, body);
console.log("curated", curated.length, "works", works.length, "listings", listings.length, "->", dest);
