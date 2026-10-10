/**
 * Aziel Eliab works catalog for machine files and curated Person JSON-LD.
 * Filtered copy of the owner catalog: verified URLs only, no Zenodo DOI links.
 */
import { AZIEL_WORKS_DATA } from "./azielWorksData.js";

export const WORKS_CATALOG_NOTE = AZIEL_WORKS_DATA.note;

export function curatedWorks() {
  return AZIEL_WORKS_DATA.curated.map(cloneWork);
}

export function fullWorks() {
  return AZIEL_WORKS_DATA.works.map(cloneWork);
}

export function workListings() {
  return AZIEL_WORKS_DATA.listings.map(cloneWork);
}

function cloneWork(work) {
  return {
    name: work.name,
    url: work.url,
    type: work.type,
    description: work.description,
    category: work.category,
    domain: work.domain,
  };
}

/** schema.org node: name, url, description. No DOI. */
export function workNode(work) {
  return {
    "@type": work.type,
    name: work.name,
    url: work.url,
    description: work.description,
  };
}

export function curatedWorkNodes() {
  return curatedWorks().map(workNode);
}

export function worksLlmsSection() {
  const lines = [
    "",
    "## Works",
    "",
    "Person @id https://www.azieleliab.com/#aziel. " + WORKS_CATALOG_NOTE,
    "Curated JSON-LD workExample count: " + curatedWorks().length + ". Full list: https://godlock.uk/works.json",
    "Zenodo DOI URLs are not listed. He Didn't Jump is a document archive.",
    "",
  ];
  const groups = new Map();
  for (const work of fullWorks()) {
    if (!groups.has(work.category)) groups.set(work.category, []);
    groups.get(work.category).push(work);
  }
  for (const [category, rows] of groups) {
    lines.push("### " + category);
    for (const work of rows) {
      lines.push("- " + work.name + " — " + work.url);
    }
    lines.push("");
  }
  lines.push("### listings");
  lines.push("Directory pages only. Not Person sameAs, except the Glama aziel-runtime profile already on the Person.");
  for (const work of workListings()) {
    lines.push("- " + work.name + " — " + work.url);
  }
  lines.push("");
  return lines.join("\n");
}

export const WORKS_KNOWS_ABOUT = [
  "AI runtimes / MCP",
  "skilled-trades software",
  "operating systems philosophy",
  "open hardware",
  "neuroplasticity research",
  "historical archives/Marion Zioncheck",
];
