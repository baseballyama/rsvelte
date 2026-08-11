import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export function seedIdOfMutant(id) {
  return id.replace(/__m\d+__[a-z0-9-]+(?=\.svelte(\.[jt]s)?$)/, "");
}

export function seedIdOfBaselineEntry(entry) {
  return seedIdOfMutant(entry.replace(/ \[[^\]]+\] \([^)]+\)$/, ""));
}

export function seedHash(sources, entry) {
  const source = path.join(sources, seedIdOfBaselineEntry(entry));
  if (!fs.existsSync(source)) return null;
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(source))
    .digest("hex");
}

export function readBaselineProvenance(file) {
  if (!fs.existsSync(file)) return {};
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error(`${file} must map seed ids to content hashes`);
  }
  return parsed;
}

export function classifyBaseline({ baseline, ids, provenance, sources }) {
  const rekeyed = [];
  const unmeasured = [];
  const stale = [];
  for (const entry of baseline) {
    const hash = seedHash(sources, entry);
    const recorded = provenance[seedIdOfBaselineEntry(entry)];
    if (hash === null || recorded === undefined) {
      unmeasured.push(entry);
    } else if (recorded !== hash) {
      rekeyed.push(entry);
    } else if (!ids.has(entry)) {
      stale.push(entry);
    }
  }
  return { rekeyed, unmeasured, stale };
}
