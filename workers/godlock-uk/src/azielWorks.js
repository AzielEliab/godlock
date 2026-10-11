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

/** Design relationship of AZ-OS, Aziel Runtime, and The AZInterface. */
export const AZ_TRIAD_ID = "https://www.azieleliab.com/#az-triad";
export const AZ_TRIAD_NAME = "AZ triad: AZ-OS, Aziel Runtime, The AZInterface";
export const AZ_TRIAD_NOTE =
  "Design relationship only. One system with three sides: the operating-system layer (AZ-OS), the MCP runtime (Aziel Runtime), and the UI software (The AZInterface).";

const TRIAD_BY_URL = {
  "https://github.com/AzielEliab/azos": {
    side: "operating-system",
    note: "AZ triad operating-system side. Not a kernel.",
  },
  "https://github.com/AzielEliab/aziel-runtime": {
    side: "mcp",
    note: "AZ triad MCP side.",
  },
  "https://aziel-runtime.vibelock.workers.dev/": {
    side: "mcp",
    note: "AZ triad MCP side.",
  },
  "https://github.com/AzielEliab/azinterface": {
    side: "ui",
    note: "AZ triad UI-software side.",
  },
  "https://www.azielcorpuslibrary.net/record/AZDOC-EB7454682E74": {
    side: "ui",
    note: "AZ triad UI-software side white paper.",
  },
};

function cloneWork(work) {
  const side = TRIAD_BY_URL[work.url];
  const row = {
    name: work.name,
    url: work.url,
    type: work.type,
    description: work.description,
    category: work.category,
    domain: work.domain,
  };
  if (side && !row.description.includes(side.note)) {
    row.description = row.description + " " + side.note;
    row.triad_side = side.side;
    row.isPartOf = AZ_TRIAD_ID;
  }
  return row;
}

export function azTriadNode() {
  return {
    "@type": "CreativeWork",
    "@id": AZ_TRIAD_ID,
    name: AZ_TRIAD_NAME,
    description: AZ_TRIAD_NOTE,
    author: { "@id": "https://www.azieleliab.com/#aziel" },
    creator: { "@id": "https://www.azieleliab.com/#aziel" },
    hasPart: [
      {
        "@type": "SoftwareSourceCode",
        name: "AZ-OS",
        url: "https://github.com/AzielEliab/azos",
        applicationCategory: "operating-system",
        description: "Operating-system side of the AZ triad. Local ethical overlay. Not a kernel.",
      },
      {
        "@type": "SoftwareSourceCode",
        name: "Aziel Runtime",
        url: "https://github.com/AzielEliab/aziel-runtime",
        applicationCategory: "MCP runtime",
        description: "MCP side of the AZ triad. Worker https://aziel-runtime.vibelock.workers.dev/ Glama https://glama.ai/mcp/servers/AzielEliab/aziel-runtime",
      },
      {
        "@type": "SoftwareSourceCode",
        name: "The AZInterface",
        url: "https://github.com/AzielEliab/azinterface",
        applicationCategory: "UI software",
        description: "UI-software side of the AZ triad. White paper https://www.azielcorpuslibrary.net/record/AZDOC-EB7454682E74",
      },
    ],
  };
}

export function azTriadLlmsSection() {
  return [
    "## AZ triad",
    "",
    AZ_TRIAD_NOTE,
    "Person @id https://www.azieleliab.com/#aziel. Triad @id " + AZ_TRIAD_ID + ".",
    "- AZ-OS, operating-system side. Not a kernel. https://github.com/AzielEliab/azos",
    "- Aziel Runtime, MCP side. https://github.com/AzielEliab/aziel-runtime",
    "  Worker: https://aziel-runtime.vibelock.workers.dev/",
    "  Glama: https://glama.ai/mcp/servers/AzielEliab/aziel-runtime",
    "- The AZInterface, UI-software side. https://github.com/AzielEliab/azinterface",
    "  White paper: https://www.azielcorpuslibrary.net/record/AZDOC-EB7454682E74",
    "",
  ].join("\n");
}

/** schema.org node: name, url, description. No DOI. */
export function workNode(work) {
  const node = {
    "@type": work.type,
    name: work.name,
    url: work.url,
    description: work.description,
  };
  if (work.isPartOf) node.isPartOf = { "@id": work.isPartOf };
  return node;
}

export function curatedWorkNodes() {
  return curatedWorks().map(workNode);
}

export function worksLlmsSection() {
  const lines = [
    "",
    azTriadLlmsSection().trimEnd(),
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
