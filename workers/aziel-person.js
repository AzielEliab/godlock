/**
 * Canonical Aziel Eliab Person fields (identity spec 2026-10-06).
 * Shared by the GodLock.uk Worker and the download tracker. No other imports.
 */

export const AZIEL_PERSON_ID = "https://www.azieleliab.com/#aziel";
export const AZIEL_PERSON_NAME = "Aziel Eliab";

/** Monikers that must lead alternateName, in this order. */
export const CANONICAL_ALTERNATE_NAMES = [
  "Aziel Elroi Eliab",
  "AzielEliab",
  "azieleliab",
  "The Revealer of the Sealed",
  "Elias Artista",
];

/** jobTitle and hasOccupation.name, same order on every surface. */
export const AZIEL_JOB_TITLES = [
  "Digital rights activist",
  "Software developer",
  "Software engineer",
  "Engineer",
  "Designer",
  "Philosopher",
  "Author",
  "Artist",
  "Researcher",
  "Archivist (He Didn't Jump / Marion Zioncheck archive)",
  "Open-hardware designer",
];

export const PERSON_ROLES_LINE =
  "digital rights activist, software developer, software engineer, engineer, designer, philosopher, author, artist, researcher, archivist (He Didn't Jump / Marion Zioncheck archive), and open-hardware designer";

export const DISAMBIGUATING_DESCRIPTION =
  "Aziel Eliab (also known as Aziel Elroi Eliab, AzielEliab, The Revealer of the Sealed, and Elias Artista) is one living person: a digital rights activist, software developer and engineer, designer, philosopher, author, artist, and researcher. Not the two Levitical musicians Aziel and Eliab named together in 1 Chronicles 15:20.";

/** Title-case variants that already existed beside the five monikers. */
export const EXISTING_TITLE_VARIANTS = [
  "The Revealer of The Sealed",
  "Revealer of The Sealed",
];

export function occupationNodes(titles = AZIEL_JOB_TITLES) {
  return titles.map((name) => ({ "@type": "Occupation", name }));
}

export function alternateNamesWithVariants(variants) {
  const seen = new Set();
  const out = [];
  for (const item of CANONICAL_ALTERNATE_NAMES.concat(variants || [])) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

export function machineAkaLine() {
  return CANONICAL_ALTERNATE_NAMES.concat(EXISTING_TITLE_VARIANTS).join(" | ");
}

/** Existing legitimate variants already published on godlock.uk. No new misspellings. */
export const LEGACY_ALTERNATE_VARIANTS = [
  ...EXISTING_TITLE_VARIANTS,
  "AzielElroiEliab",
  "EliasArtista",
  "עזיאל",
  "עֲזִיאֵל",
  "אל ראי",
  "אֵל רֳאִי",
  "אלרועי",
  "אליאב",
  "אֱלִיאָב",
  "עזיאל אל ראי אליאב",
  "עזיאל אלרועי אליאב",
  "Aziell",
  "Azeil",
  "Azial",
  "Azeel",
  "Asiel",
  "Asziel",
  "Az'iel",
  "Azi-el",
  "Aziél",
  "Azíel",
  "El Roi",
  "El-Roi",
  "ElRoi",
  "Elro'i",
  "Elroei",
  "Elroey",
  "El-Ro'i",
  "Eli'ab",
  "Eliáb",
  "Elyab",
  "Eliav",
  "Eliabb",
  "Aziel Eliab",
  "aziel eliab",
  "Aziel_Eliab",
  "Aziel-Elroi-Eliab",
];

export const AZINDEX_PERSON_ALTERNATE_NAMES = alternateNamesWithVariants(LEGACY_ALTERNATE_VARIANTS);

export const PROFILE_SAME_AS = [
  "https://github.com/AzielEliab",
  "https://github.com/azieltherevealerofthesealed-arch",
  "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime",
  "https://www.azieleliab.com/",
  "https://www.azielcorpuslibrary.net/",
  "https://godlock.uk/",
  "https://www.hedidntjump.com/",
  "https://x.com/AzielEliab",
];

export function authorPersonLd() {
  return {
    "@type": "Person",
    "@id": AZIEL_PERSON_ID,
    name: AZIEL_PERSON_NAME,
    alternateName: AZINDEX_PERSON_ALTERNATE_NAMES.slice(),
    jobTitle: AZIEL_JOB_TITLES.slice(),
    hasOccupation: occupationNodes(),
    disambiguatingDescription: DISAMBIGUATING_DESCRIPTION,
    url: "https://www.azieleliab.com/",
    sameAs: PROFILE_SAME_AS.slice(),
  };
}
