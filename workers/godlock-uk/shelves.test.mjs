import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { citeDoc, llmsDoc, aiDoc, robotsTxt, sitemapXml, siteOpenApi, CANON_HOST } from "./src/seo.js";
import { firstScreenTip } from "./src/ingestReceipt.js";
import {
  shelvesDoc,
  shelvesCiteFields,
  shelvesLlmsSection,
  COLD_MULTI_SHELF,
  COLD_MULTI_SHELF_RULE,
  CANONICAL_SHELVES,
  CODEBERG_TIP_PACK,
  LOCKSET_TIP,
  ZENODO_REFUSE,
  GITFLIC_REFUSE,
  GITLAB_REFUSE,
  PLANE_B_WORKING_TARGETS,
  PLANE_B_ALL_TARGETS,
  ARCHIVE_ORG_TIP_PACK_URL,
  ARCHIVE_ORG_TIP_PACK_202609_URL,
  FRAMAGIT_TIP_PACK_URL,
  PLANE_C_ATTEST,
  CAP7_SITES,
  CORPUS_ROLL,
} from "./src/shelves.js";
import { azielEliabBody, whoPageHtml, homeBody, softwareBody } from "./src/ui.js";

function mockEnv() {
  const stmt = {
    bind() { return stmt; },
    async first() { return null; },
    async all() { return { results: [] }; },
    async run() { return { success: true }; },
  };
  return {
    DB: {
      prepare() { return stmt; },
      async batch() { return []; },
    },
    MESH_PROBE_ORIGIN: false,
  };
}

async function fetchPath(path) {
  return worker.fetch(new Request("https://godlock.uk" + path, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  }), mockEnv());
}

function visibleBody(html) {
  return String(html)
    .replace(/^[\s\S]*<body>/i, "")
    .replace(/<\/body>[\s\S]*$/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}

describe("AZindex COLD-MULTI-SHELF on GodLock", () => {
  it("cites corpus#96 at the same machine level without fanning", () => {
    const doc = shelvesDoc();
    assert.equal(doc.spec, COLD_MULTI_SHELF);
    assert.equal(doc.kind, "challenge_cite");
    assert.equal(doc.product, "GodLock");
    assert.equal(doc.challenge_only, true);
    assert.equal(doc.no_fan, true);
    assert.equal(doc.growth_on, true);
    assert.equal(doc.person_id, "https://www.azieleliab.com/#aziel");
    assert.equal(doc.canonical_shelves, CANONICAL_SHELVES);
    assert.equal(doc.canonical_shelves, "https://www.azielcorpuslibrary.net/shelves");
    assert.equal(doc.corpus, CORPUS_ROLL);
    assert.equal(doc.corpus, "corpus#96");
    assert.equal(doc.published_surfaces, 5);
    assert.deepEqual(doc.family_blast_radii, ["cloudflare", "github"]);
    assert.equal(doc.planes.A.published_surfaces, 5);
    assert.equal(doc.planes.A.status, "live");
    assert.equal(doc.planes.B.status, "slot");
    assert.equal(doc.planes.B.doi, null);
    assert.deepEqual(doc.planes.B.working_targets, ["codeberg", "archive.org", "framagit"]);
    assert.deepEqual(doc.planes.B.working_targets, PLANE_B_WORKING_TARGETS.slice());
    assert.ok(!doc.planes.B.working_targets.includes("gitflic-ru"));
    assert.equal(doc.planes.B.codeberg_tip_pack, CODEBERG_TIP_PACK);
    assert.equal(doc.planes.B.codeberg_tip_pack, "b549362c0736ddb54ddc488812327c464e0da1167281f92fd1a4263eedf5df37");
    assert.equal(doc.planes.B.archive_org_url, ARCHIVE_ORG_TIP_PACK_URL);
    assert.equal(doc.planes.B.archive_org_url, "https://archive.org/details/aziel-lockset-tip");
    assert.equal(doc.planes.B.archive_org_secondary_url, ARCHIVE_ORG_TIP_PACK_202609_URL);
    assert.equal(doc.planes.B.archive_org_secondary_url, "https://archive.org/details/aziel-lockset-tip_202609");
    assert.equal(doc.planes.B.archive_org_secondary_item, "aziel-lockset-tip_202609");
    assert.deepEqual(doc.planes.B.archive_org_items, ["aziel-lockset-tip", "aziel-lockset-tip_202609"]);
    assert.equal(doc.planes.B.working_targets.filter((t) => t === "archive.org").length, 1);
    assert.equal(doc.planes.B.archive_org_hash_verify, "pass");
    assert.equal(doc.planes.B.live_ready, false);
    assert.equal(doc.independent_live_count, 1);
    assert.equal(doc.independent_requirement_met, false);
    assert.equal(doc.planes.B.framagit_url, null);
    assert.equal(doc.planes.B.framagit_url, FRAMAGIT_TIP_PACK_URL);
    assert.equal(doc.planes.B.gitflic, GITFLIC_REFUSE);
    assert.equal(doc.planes.B.gitlab, GITLAB_REFUSE);
    assert.equal(doc.planes.B.refuse, PLANE_B_ALL_TARGETS);
    assert.equal(doc.planes.B.zenodo_live, false);
    assert.equal(doc.visible_1520, false);
    assert.equal(doc.planes.C.status, "slot");
    assert.ok(doc.planes.C.refuse.includes(PLANE_C_ATTEST));
    assert.equal(doc.doi, null);
    assert.equal(doc.lockset_doi, null);
    assert.equal(doc.refuse, ZENODO_REFUSE);
    assert.equal(doc.resolves_to_hub, false);
    assert.equal(doc.cap7_sites.godlock.design_of, "https://godlock.uk/");
    assert.equal(doc.cap7_sites.godlock.resolves_to_hub, false);
    assert.equal(doc.softwares_tab, false);
    assert.equal(doc.mesh_radio, false);
    assert.match(doc.lamb_lens, /Lamb Lens/);
    assert.match(doc.lamb_lens, /challenge only/);
    assert.match(doc.note, /NO-FAN/);
    const codeberg = doc.registry.shelves.find((s) => s.id === "plane-b-codeberg-tip-pack");
    assert.equal(codeberg.status, "slot");
    assert.equal(codeberg.pack_sha256, CODEBERG_TIP_PACK);
    assert.equal(codeberg.lockset_tip, LOCKSET_TIP);
    const archive = doc.registry.shelves.find((s) => s.id === "plane-b-archive-org-tip-pack");
    assert.equal(archive.status, "slot");
    assert.equal(archive.url, "https://archive.org/details/aziel-lockset-tip");
    assert.equal(archive.hash_verify, "pass");
    assert.equal(archive.tip_verified, true);
    assert.equal(archive.independent, true);
    assert.equal(archive.refuse, PLANE_B_ALL_TARGETS);
    assert.equal(archive.secondary_items[0].id, "plane-b-archive-org-tip-pack-202609");
    assert.equal(archive.secondary_items[0].url, "https://archive.org/details/aziel-lockset-tip_202609");
    assert.equal(archive.secondary_items[0].independent_shelf, false);
    assert.equal(archive.secondary_items[0].pack_sha256, CODEBERG_TIP_PACK);
    const archive202609 = doc.registry.shelves.find((s) => s.id === "plane-b-archive-org-tip-pack-202609");
    assert.equal(archive202609.status, "slot");
    assert.equal(archive202609.url, "https://archive.org/details/aziel-lockset-tip_202609");
    assert.equal(archive202609.identifier, "aziel-lockset-tip_202609");
    assert.equal(archive202609.hash_verify, "pass");
    assert.equal(archive202609.tip_verified, true);
    assert.equal(archive202609.pack_sha256, CODEBERG_TIP_PACK);
    assert.equal(archive202609.pack_sha256, "b549362c0736ddb54ddc488812327c464e0da1167281f92fd1a4263eedf5df37");
    assert.equal(archive202609.blast_radius, "archive-org");
    assert.equal(archive202609.blast_radius, archive.blast_radius);
    assert.equal(archive202609.independent, false);
    assert.equal(archive202609.ia_flat_sha256, null);
    assert.equal(archive202609.sha256sums_flat_check, "incomplete");
    assert.equal(archive202609.wrap, "zip");
    assert.equal(archive202609.same_pack_as, "plane-b-archive-org-tip-pack");
    assert.equal(archive202609.required_for_plane_b_live, false);
    assert.equal(archive202609.live_ready, false);
    assert.equal(archive202609.doi, null);
    assert.equal(archive202609.refuse, PLANE_B_ALL_TARGETS);
    assert.ok(doc.slot.includes("plane-b-archive-org-tip-pack-202609"));
    assert.ok(!doc.live.includes("plane-b-archive-org-tip-pack-202609"));
    const framagit = doc.registry.shelves.find((s) => s.id === "plane-b-framagit-tip-pack");
    assert.equal(framagit.status, "slot");
    assert.equal(framagit.url, null);
    assert.equal(framagit.forge, "framagit");
    assert.equal(framagit.refuse, "CNS-NO-FORGE-MIRROR");
    assert.equal(framagit.live_ready, false);
    assert.equal(doc.planes.B.framagit_refuse, "CNS-NO-FORGE-MIRROR");
    assert.equal(doc.planes.B.framagit_status, "slot");
    assert.equal(doc.planes.B.live_ready, false);
    assert.equal(doc.planes.C.live_ready, false);
    const gitflic = doc.registry.shelves.find((s) => s.id === "plane-b-gitflic-ru-tip-pack");
    assert.equal(gitflic.status, "refused");
    assert.equal(gitflic.refuse, GITFLIC_REFUSE);
    assert.ok(doc.refused.includes("plane-b-gitflic-ru-tip-pack"));
    assert.ok(!doc.slot.includes("plane-b-gitflic-ru-tip-pack"));
    const gitlab = doc.registry.shelves.find((s) => s.id === "plane-b-gitlab-tip-pack");
    assert.equal(gitlab.status, "refused");
    assert.equal(gitlab.refuse, GITLAB_REFUSE);
    const zenodo = doc.registry.shelves.find((s) => s.id === "plane-b-zenodo-tip-pack");
    assert.equal(zenodo.status, "slot");
    assert.equal(zenodo.zenodo_live, false);
    assert.equal(zenodo.doi, null);
    assert.ok(zenodo.refuse.includes(ZENODO_REFUSE));
    assert.ok(doc.slot.includes("plane-b-zenodo-tip-pack"));
    assert.ok(!doc.refused.includes("plane-b-zenodo-tip-pack"));
    assert.match(zenodo.reason, /Zenodo deposit not LIVE/);
    assert.doesNotMatch(zenodo.reason, /Operator IP banned|CNS-ZENODO-IP-BAN/);
    assert.doesNotMatch(JSON.stringify(doc), /CNS-ZENODO-IP-BAN|Operator IP banned/);
    assert.doesNotMatch(JSON.stringify(doc.planes), /gitflic-ru unverified/i);
    assert.doesNotMatch(JSON.stringify(doc.planes.B.working_targets), /gitflic/);
    const attest = doc.registry.shelves.find((s) => s.id === "plane-c-usb-airgap");
    assert.equal(attest.status, "slot");
    assert.equal(attest.refuse, PLANE_C_ATTEST);
    assert.doesNotMatch(JSON.stringify(doc), /1 Chronicles 15:20/);
  });

  it("serves /shelves and /v1/shelves as machine JSON", async () => {
    for (const path of ["/shelves", "/v1/shelves"]) {
      const res = await fetchPath(path);
      assert.equal(res.status, 200, path);
      assert.match(res.headers.get("Content-Type") || "", /application\/json/);
      const body = await res.json();
      assert.equal(body.spec, COLD_MULTI_SHELF);
      assert.equal(body.challenge_only, true);
      assert.equal(body.no_fan, true);
      assert.equal(body.canonical_shelves, CANONICAL_SHELVES);
      assert.equal(body.planes.B.codeberg_tip_pack, CODEBERG_TIP_PACK);
      assert.deepEqual(body.planes.B.working_targets, ["codeberg", "archive.org", "framagit"]);
      assert.equal(body.planes.B.archive_org_url, "https://archive.org/details/aziel-lockset-tip");
      assert.equal(body.planes.B.archive_org_secondary_url, "https://archive.org/details/aziel-lockset-tip_202609");
      assert.equal(body.independent_live_count, 1);
      assert.equal(body.planes.B.framagit_url, null);
      assert.equal(body.planes.B.gitflic, "CNS-GITFLIC-EMAIL");
      assert.equal(body.doi, null);
    }
  });

  it("puts the same facts on cite / llms / ai without a visible 15:20 lock", async () => {
    const cite = citeDoc();
    const fields = shelvesCiteFields();
    assert.equal(cite.shelves, CANON_HOST + "/shelves");
    assert.equal(cite.canonical_shelves, CANONICAL_SHELVES);
    assert.equal(cite.cold_multi_shelf, COLD_MULTI_SHELF);
    assert.equal(cite.challenge_only, true);
    assert.equal(cite.no_fan, true);
    assert.equal(cite.doi, null);
    assert.equal(cite.zenodo_refuse, null);
    assert.equal(cite.plane_b_codeberg_tip_pack, CODEBERG_TIP_PACK);
    assert.equal(cite.plane_b_codeberg_status, "slot");
    assert.deepEqual(cite.plane_b_working_targets, ["codeberg", "archive.org", "framagit"]);
    assert.equal(cite.plane_b_archive_org_url, "https://archive.org/details/aziel-lockset-tip");
    assert.equal(cite.plane_b_archive_org_secondary_url, "https://archive.org/details/aziel-lockset-tip_202609");
    assert.equal(cite.plane_b_archive_org_secondary_item, "aziel-lockset-tip_202609");
    assert.equal(cite.plane_b_archive_org_hash_verify, "pass");
    assert.equal(cite.plane_b_framagit_url, null);
    assert.equal(cite.plane_b_framagit_refuse, "CNS-NO-FORGE-MIRROR");
    assert.equal(cite.plane_b_framagit_status, "slot");
    assert.equal(cite.plane_c_live_ready, false);
    assert.equal(cite.plane_b_gitflic_refuse, GITFLIC_REFUSE);
    assert.equal(cite.plane_b_gitlab_refuse, GITLAB_REFUSE);
    assert.equal(cite.plane_c_attest, PLANE_C_ATTEST);
    assert.equal(cite.cap7_sites.godlock.design_of, fields.cap7_sites.godlock.design_of);
    assert.equal(cite.cap7_godlock_resolves_to_hub, false);
    assert.equal(cite.resolves_to_hub, false);
    assert.equal(cite.published_surfaces, 5);
    assert.match(cite.lamb_lens, /Lamb Lens/);
    assert.equal(cite.ingest_tip, firstScreenTip());
    assert.equal(firstScreenTip(), "0406601d4b2939a86d65eb145d24dc41bd9b1577b225ba4f0516cbbd47bb0fd7");

    const llms = llmsDoc();
    const ai = aiDoc();
    assert.equal(ai, llms);
    assert.match(llms, /## Cold multi-shelf/);
    assert.match(llms, /COLD-MULTI-SHELF-1\.0/);
    assert.ok(llms.includes(COLD_MULTI_SHELF_RULE));
    assert.match(llms, /GodLock is challenge only\. NO-FAN/);
    assert.match(llms, /Canonical shelves: https:\/\/www\.azielcorpuslibrary\.net\/shelves/);
    assert.match(llms, /https:\/\/godlock\.uk\/shelves/);
    assert.match(llms, new RegExp(CODEBERG_TIP_PACK));
    assert.match(llms, /ALL-TARGETS/);
    assert.match(llms, /https:\/\/archive\.org\/details\/aziel-lockset-tip/);
    assert.match(llms, /https:\/\/archive\.org\/details\/aziel-lockset-tip_202609/);
    assert.match(llms, /one working_targets kind/);
    assert.match(llms, /Framagit url null/);
    assert.match(llms, /SLOT CNS-NO-FORGE-MIRROR/);
    assert.match(llms, /Plane C: USB airgap SLOT until CNS-OPERATOR-ATTEST\. No LIVE flip/);
    assert.doesNotMatch(llms, /CNS-ZENODO-IP-BAN/);
    assert.doesNotMatch(llms, /blocked from/);
    assert.doesNotMatch(llms, /Operator IP banned/);
    assert.doesNotMatch(llms, /GitFlic RU unverified/);
    assert.match(llms, /doi null/);
    assert.match(llms, /CNS-OPERATOR-ATTEST/);
    assert.match(llms, /resolves_to_hub: false/);
    assert.match(llms, /Lamb Lens/);
    assert.match(llms, /Growth-ON/);
    assert.match(llms, /corpus#96/);
    assert.match(shelvesLlmsSection(), /NO-FAN/);

    const home = homeBody({ stats: {}, latest: null, prior: [] });
    const software = softwareBody({ products: [] });
    assert.match(software, /<h2 class="soft-heading">Softwares<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(visibleBody(home), /1 Chronicles 15:20/);
    assert.doesNotMatch(visibleBody(azielEliabBody()), /1 Chronicles 15:20/);
    assert.doesNotMatch(visibleBody(whoPageHtml()), /<p class="identity-lock"/);
    const html = await (await worker.fetch(new Request("https://godlock.uk/", {
      headers: { "User-Agent": "Mozilla/5.0" },
    }), mockEnv())).text();
    assert.doesNotMatch(visibleBody(html), /1 Chronicles 15:20/);
    assert.match(html, /rel="alternate" href="\/shelves"/);
  });

  it("allows and sitemaps /shelves as a machine surface", async () => {
    const robots = robotsTxt();
    assert.match(robots, /Allow: \/shelves/);
    assert.match(robots, /Allow: \/v1\/shelves/);
    assert.match(robots, /COLD-MULTI-SHELF-1\.0/);
    assert.match(robots, /challenge only/);
    const xml = await sitemapXml({});
    assert.ok(xml.includes(CANON_HOST + "/shelves"));
    assert.ok(xml.includes(CANON_HOST + "/v1/shelves"));
    assert.ok(xml.includes("https://www.azielcorpuslibrary.net/shelves"));
    assert.ok(siteOpenApi().paths["/shelves"]);
    assert.ok(siteOpenApi().paths["/v1/shelves"]);
    assert.ok(siteOpenApi().paths["/ai.txt"]);
    for (const site of Object.values(CAP7_SITES)) {
      assert.equal(site.resolves_to_hub, false);
      assert.ok(site.design_of);
    }
  });
});
