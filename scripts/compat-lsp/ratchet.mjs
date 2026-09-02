import { createHash } from "node:crypto";
import { OPEN_PHASE } from "./edits.mjs";

const digest = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

export function compactCorpusObservation(
  method,
  position,
  differences,
  mechanisms = [],
) {
  return {
    method,
    position,
    diffDigest: digest([...differences].sort()),
    fieldCount: differences.length,
    mechanisms: [...mechanisms].sort(),
  };
}

// One grouping serves both public projections: an id and its mechanism set are
// two readings of the same aggregate, and deriving them separately would be two
// ports of one rule.
function aggregateCorpus(fileId, observations, phase) {
  const byMethod = new Map();
  for (const observation of observations) {
    byMethod.set(observation.method, [
      ...(byMethod.get(observation.method) ?? []),
      observation,
    ]);
  }
  const entries = [];
  for (const [method, values] of [...byMethod].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const mechanisms = new Set();
    for (const value of values)
      for (const mechanism of value.mechanisms ?? []) mechanisms.add(mechanism);
    // The request count does not reproduce either, and it never discriminated:
    // `fileId|method|phase` is already unique, so dropping it leaves all 23,890
    // committed keys. Two CI runs whose merge refs share a `main` parent and
    // differ by ten commits that touch NO Rust moved one file's hover count
    // 91 -> 90 and 88 -> 90 — 2 NEW + 2 STALE and a red shard; with the count out
    // of the key the same pair of runs is 0 and 0. It was sensitivity without
    // direction: a shrink and a growth are both one NEW and one STALE.
    const stage = phase === OPEN_PHASE ? "" : `|phase=${phase}`;
    entries.push({
      id: `aggregate:${fileId}|${method}${stage}`,
      mechanisms: [...mechanisms].sort(),
    });
  }
  return entries;
}

export function aggregateCorpusDifferences(
  fileId,
  observations,
  phase = OPEN_PHASE,
) {
  return aggregateCorpus(fileId, observations, phase).map((entry) => entry.id);
}

// The mechanism set is a property of the aggregate, not of the key: it is
// carried beside the ratchet rather than inside it, because a label in the key
// would multiply one entry into its ~6 mechanisms.
export function aggregateCorpusMechanisms(
  fileId,
  observations,
  phase = OPEN_PHASE,
) {
  return aggregateCorpus(fileId, observations, phase);
}

export function baselineRewriteReasons(
  selectedSuites,
  allSuites,
  selectedRepos,
  allRepos,
  narrowed = [],
) {
  return [
    selectedSuites.length !== allSuites.length ||
    allSuites.some((suite) => !selectedSuites.includes(suite))
      ? `--suites measured [${selectedSuites.join(", ")}], not all [${allSuites.join(", ")}] (FALSE-SHRINK)`
      : false,
    selectedRepos.length !== allRepos.length ||
    allRepos.some((repo) => !selectedRepos.includes(repo))
      ? `--corpus-repos measured [${selectedRepos.join(", ")}], not all [${allRepos.join(", ")}] (FALSE-SHRINK)`
      : false,
    ...narrowed,
  ];
}

export function assertNonemptySuites(cases, selectedSuites) {
  for (const suite of selectedSuites) {
    if (!cases.some((entry) => entry.suite === suite))
      throw new Error(`${suite} selected but discovered zero cases`);
  }
}

export function shardCorpusCases(cases, shard) {
  if (!shard) return cases;
  return cases.filter((entry) => {
    if (entry.suite !== "corpus") return true;
    return corpusShardIndex(entry.id, shard.count) === shard.index;
  });
}

export function corpusShardIndex(id, count) {
  return createHash("sha256").update(id).digest().readUInt32BE(0) % count;
}

export function selectKnownForScope(
  known,
  selectedSuites,
  selectedRepos,
  shard,
) {
  const scopes = selectedSuites.map((suite) => `${suite}/`);
  return known.filter((entry) => {
    const rest = entry.slice(entry.indexOf(":") + 1);
    if (!scopes.some((scope) => rest.startsWith(scope))) return false;
    if (!rest.startsWith("corpus/")) return true;
    if (!selectedRepos.some((repo) => rest.startsWith(`corpus/${repo}/`)))
      return false;
    if (!shard) return true;
    return (
      corpusShardIndex(rest.slice(0, rest.indexOf("|")), shard.count) ===
      shard.index
    );
  });
}
