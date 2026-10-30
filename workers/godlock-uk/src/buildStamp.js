/**
 * GodLock Worker's own deploy stamp for /health.
 * version_id is env.CF_VERSION_METADATA.id when the binding is present.
 * git_sha is GODLOCK_GIT_SHA, else a 40-hex CF_VERSION_METADATA.tag.
 * Missing values stay null. This module does not invent a sha or an id.
 * Author: Aziel Eliab.
 */

const SHA40 = /^[0-9a-f]{40}$/;

export function godlockBuildStamp(env) {
  const meta = env && env.CF_VERSION_METADATA && typeof env.CF_VERSION_METADATA === "object"
    ? env.CF_VERSION_METADATA
    : null;
  const versionId = meta && meta.id != null && String(meta.id).trim() !== ""
    ? String(meta.id).trim()
    : null;
  const tag = meta && meta.tag != null ? String(meta.tag).trim().toLowerCase() : "";
  const fromVar = env && env.GODLOCK_GIT_SHA != null ? String(env.GODLOCK_GIT_SHA).trim().toLowerCase() : "";
  let git_sha = null;
  let git_sha_source = "unset";
  if (SHA40.test(fromVar)) {
    git_sha = fromVar;
    git_sha_source = "deploy_var";
  } else if (SHA40.test(tag)) {
    git_sha = tag;
    git_sha_source = "cf_version_metadata.tag";
  }
  return {
    git_sha,
    git_sha_short: git_sha ? git_sha.slice(0, 8) : null,
    git_sha_source,
    git_sha_note: git_sha
      ? "GodLock Worker git_sha from " + git_sha_source + ". Not the Softwares runtime tip."
      : "GodLock git_sha is unset until Cos LIVE sets GODLOCK_GIT_SHA or a 40-hex CF_VERSION_METADATA.tag. This response does not invent a sha.",
    version_id: versionId,
    version_id_source: versionId ? "cf_version_metadata" : "unset",
    version_id_note: versionId
      ? "GodLock Worker version_id is env.CF_VERSION_METADATA.id, read at serve time. Not the Softwares runtime version_id. Not a baked constant."
      : "GodLock version_id is unset until the CF_VERSION_METADATA binding is present. This response does not invent an id.",
  };
}
